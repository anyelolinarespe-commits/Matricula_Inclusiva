/**
 * speech-synthesis.js - Administrador de Síntesis de Voz (Text-to-Speech)
 * Sistema de Matrícula Accesible UTP
 * WCAG 2.1 AAA: Feedback auditivo en lenguaje natural
 */

import { accessibilityManager } from "./accessibility.js";

class SpeechSynthesisManager {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.voices = [];
    this.selectedVoice = null;
    this.isEnabled = true;
    this.lastSpokenText = "";
    this.isPausedState = false;

    this.initVoices();
  }

  initVoices() {
    if (!this.synth) {
      console.warn("SpeechSynthesis API no está soportada en este navegador.");
      return;
    }

    const loadVoices = () => {
      this.voices = this.synth.getVoices();
      // Priorizar voces en español (Perú, Latinoamérica, España)
      this.selectedVoice =
        this.voices.find(v => v.lang === "es-PE") ||
        this.voices.find(v => v.lang === "es-419") ||
        this.voices.find(v => v.lang.startsWith("es-")) ||
        this.voices.find(v => v.lang.includes("es")) ||
        this.voices[0] ||
        null;
    };

    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  /**
   * Narrar un texto en lenguaje natural
   * @param {string} text - Texto a pronunciar
   * @param {boolean} interrupt - Si es true, interrumpe lo que esté hablando actualmente
   * @param {Function} onEndCallback - Callback al finalizar
   */
  speak(text, interrupt = true, onEndCallback = null) {
    if (!this.isEnabled || !this.synth) {
      // De todos modos anunciarlo por lector de pantalla
      accessibilityManager.announcePolite(text);
      return;
    }

    if (interrupt) {
      this.synth.cancel();
      this.isPausedState = false;
    }

    this.lastSpokenText = text;

    // Anunciar también en la región accesible ARIA Live
    accessibilityManager.announcePolite(text);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.selectedVoice;
    utterance.lang = this.selectedVoice ? this.selectedVoice.lang : "es-PE";
    utterance.rate = 1.05; // Velocidad óptima de dicción en español
    utterance.pitch = 1.0;

    utterance.onend = () => {
      this.isPausedState = false;
      this.updateAudioIndicator(false);
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = (e) => {
      // Ignorar errores por cancelación voluntaria
      if (e.error !== "canceled" && e.error !== "interrupted") {
        console.warn("Error en SpeechSynthesis:", e);
      }
      this.updateAudioIndicator(false);
    };

    this.updateAudioIndicator(true);
    this.synth.speak(utterance);
  }

  pause() {
    if (this.synth && this.synth.speaking && !this.isPausedState) {
      this.synth.pause();
      this.isPausedState = true;
      this.updateAudioIndicator(false);
      accessibilityManager.announcePolite("Narración pausada");
    }
  }

  resume() {
    if (this.synth && this.isPausedState) {
      this.synth.resume();
      this.isPausedState = false;
      this.updateAudioIndicator(true);
      accessibilityManager.announcePolite("Narración reanudada");
    }
  }

  togglePause() {
    if (this.isPausedState) {
      this.resume();
    } else {
      this.pause();
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isPausedState = false;
      this.updateAudioIndicator(false);
    }
  }

  repeatLast() {
    if (this.lastSpokenText) {
      this.speak(this.lastSpokenText, true);
    } else {
      this.speak("No hay ninguna narración previa para repetir.", true);
    }
  }

  toggleEnabled() {
    this.isEnabled = !this.isEnabled;
    if (!this.isEnabled) {
      this.stop();
      accessibilityManager.announcePolite("Voz de lectura desactivada");
    } else {
      accessibilityManager.announcePolite("Voz de lectura activada");
      this.speak("Voz de lectura activada.", false);
    }

    const ttsBtn = document.getElementById("btn-toggle-tts");
    if (ttsBtn) {
      ttsBtn.setAttribute("aria-pressed", this.isEnabled ? "true" : "false");
      ttsBtn.innerHTML = this.isEnabled
        ? `🔊 <span>Voz: Activa</span>`
        : `🔇 <span>Voz: Mute</span>`;
      ttsBtn.classList.toggle("active", this.isEnabled);
    }

    return this.isEnabled;
  }

  updateAudioIndicator(isSpeaking) {
    const indicator = document.getElementById("tts-status-indicator");
    if (indicator) {
      indicator.style.display = isSpeaking ? "inline-flex" : "none";
    }
  }

  /**
   * Generar texto en lenguaje natural comprensivo para un horario consolidado
   * @param {Array} cursosMatriculados
   * @param {string|null} diaFiltro - Si se pide un día específico (ej. "Lunes")
   */
  generarNarracionHorario(cursosMatriculados, diaFiltro = null) {
    if (!cursosMatriculados || cursosMatriculados.length === 0) {
      return "Actualmente no tienes asignaturas matriculadas. Regresa a la pantalla de selección para agregar cursos a tu horario.";
    }

    const totalCreditos = cursosMatriculados.reduce((sum, c) => sum + c.creditos, 0);

    if (diaFiltro) {
      const diaNorm = diaFiltro.toLowerCase();
      const cursosDelDia = [];

      cursosMatriculados.forEach(c => {
        c.bloques.forEach(b => {
          if (b.dia.toLowerCase().includes(diaNorm)) {
            cursosDelDia.push({
              nombre: c.nombre,
              inicio: b.inicio,
              fin: b.fin,
              aula: c.aula,
              modalidad: c.modalidad
            });
          }
        });
      });

      if (cursosDelDia.length === 0) {
        return `Para el día ${diaFiltro} no tienes ninguna clase programada. Estás libre.`;
      }

      let speech = `El ${diaFiltro} tienes ${cursosDelDia.length} ${cursosDelDia.length === 1 ? "clase" : "clases"}. `;
      cursosDelDia.forEach((item, idx) => {
        speech += `${idx + 1}. Curso ${item.nombre}, de ${item.inicio} a ${item.fin} horas, en ${item.aula}, modalidad ${item.modalidad}. `;
      });
      return speech;
    }

    // Narración global estructurada por días de la semana
    let speech = `Tienes ${cursosMatriculados.length} asignaturas matriculadas, sumando un total de ${totalCreditos} de 22 créditos permitidos. No tienes ningún cruce de horario. A continuación tu itinerario de la semana: `;

    const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    let hayDiasConClase = false;

    diasSemana.forEach(dia => {
      const clasesHoy = [];
      cursosMatriculados.forEach(c => {
        c.bloques.forEach(b => {
          if (b.dia === dia) {
            clasesHoy.push({
              curso: c.nombre,
              horario: `${b.inicio} a ${b.fin}`,
              aula: c.aula
            });
          }
        });
      });

      if (clasesHoy.length > 0) {
        hayDiasConClase = true;
        speech += `El día ${dia}: `;
        clasesHoy.forEach(item => {
          speech += `${item.curso}, de ${item.horario} horas en ${item.aula}. `;
        });
      }
    });

    if (!hayDiasConClase) {
      speech += "No hay clases programadas para esta semana.";
    } else {
      speech += "Fin de la narración de tu horario. Puedes presionar Alt más R para repetir, o decir 'descargar horario'.";
    }

    return speech;
  }
}

export const speechSynthesisManager = new SpeechSynthesisManager();
