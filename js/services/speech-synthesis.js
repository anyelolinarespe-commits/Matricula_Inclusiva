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
    this.recognitionController = null;
    this.activeUtterances = new Set();

    this.initVoices();
  }

  setRecognitionController(controller) {
    this.recognitionController = controller;
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
   * Narrar un texto en lenguaje natural sin eco ni bucle infinito
   * @param {string} text - Texto a pronunciar (máximo 1 o 2 oraciones)
   * @param {boolean} interrupt - Si es true, cancela el habla anterior
   * @param {Function} onEndCallback - Callback al finalizar
   */
  speak(text, interrupt = true, onEndCallback = null) {
    if (!this.isEnabled || !this.synth) {
      // De todos modos anunciarlo por lector de pantalla
      accessibilityManager.announcePolite(text);
      if (typeof onEndCallback === "function") {
        try { onEndCallback(); } catch (e) { console.error(e); }
      }
      return;
    }

    if (interrupt) {
      this.cancelImmediate();
    }

    this.lastSpokenText = text;

    // Anunciar también en la región accesible ARIA Live
    accessibilityManager.announcePolite(text);

    // Pausar temporalmente el reconocimiento para eliminar eco y auto-escucha
    if (this.recognitionController && typeof this.recognitionController.pauseForSpeaking === "function") {
      this.recognitionController.pauseForSpeaking();
    }

    let callbackExecuted = false;
    const executeCallback = () => {
      if (!callbackExecuted) {
        callbackExecuted = true;
        if (typeof onEndCallback === "function") {
          try { onEndCallback(); } catch (e) { console.error(e); }
        }
      }
    };

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      if (!this.activeUtterances) {
        this.activeUtterances = new Set();
      }
      this.activeUtterances.add(utterance);

      utterance.voice = this.selectedVoice;
      utterance.lang = this.selectedVoice ? this.selectedVoice.lang : "es-PE";
      utterance.rate = 1.05; // Velocidad óptima de dicción en español
      utterance.pitch = 1.0;

      utterance.onend = () => {
        this.isPausedState = false;
        this.updateAudioIndicator(false);
        this.activeUtterances.delete(utterance);
        // Reactivar reconocimiento tras finalizar el habla
        if (this.recognitionController && typeof this.recognitionController.resumeAfterSpeaking === "function") {
          this.recognitionController.resumeAfterSpeaking();
        }
        executeCallback();
      };

      utterance.onerror = (e) => {
        this.isPausedState = false;
        this.updateAudioIndicator(false);
        this.activeUtterances.delete(utterance);
        if (this.recognitionController && typeof this.recognitionController.resumeAfterSpeaking === "function") {
          this.recognitionController.resumeAfterSpeaking();
        }
        if (e.error !== "canceled" && e.error !== "interrupted") {
          console.warn("Error en SpeechSynthesis:", e);
        }
        executeCallback();
      };

      this.updateAudioIndicator(true);
      this.synth.speak(utterance);
    } catch (err) {
      console.warn("Error al emitir voz:", err);
      executeCallback();
    }
  }

  pause() {
    if (this.synth && this.synth.speaking && !this.isPausedState) {
      this.synth.pause();
      this.isPausedState = true;
      this.updateAudioIndicator(false);
      accessibilityManager.announcePolite("Narración pausada");
      if (this.recognitionController && typeof this.recognitionController.resumeAfterSpeaking === "function") {
        this.recognitionController.resumeAfterSpeaking();
      }
    }
  }

  resume() {
    if (this.synth && this.isPausedState) {
      if (this.recognitionController && typeof this.recognitionController.pauseForSpeaking === "function") {
        this.recognitionController.pauseForSpeaking();
      }
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

  /**
   * Cancelación inmediata sin encolamiento ni latencia (WCAG 1.4.2)
   */
  cancelImmediate() {
    if (!this.synth) return;
    try {
      this.synth.cancel();
    } catch (e) {}
    if (this.activeUtterances) {
      this.activeUtterances.clear();
    }
    this.isPausedState = false;
    this.updateAudioIndicator(false);
  }

  stop() {
    if (this.synth) {
      this.cancelImmediate();
      if (this.recognitionController && typeof this.recognitionController.resumeAfterSpeaking === "function") {
        this.recognitionController.resumeAfterSpeaking();
      }
    }
  }

  repeatLast() {
    if (this.lastSpokenText) {
      this.speak(this.lastSpokenText, true);
    } else {
      this.speak("No hay ninguna narración previa.", true);
    }
  }

  toggleEnabled() {
    this.isEnabled = !this.isEnabled;
    if (!this.isEnabled) {
      this.stop();
      accessibilityManager.announcePolite("Voz desactivada");
    } else {
      accessibilityManager.announcePolite("Voz activada");
      this.speak("Voz del sistema activada.", true);
    }

    const ttsBtn = document.getElementById("btn-toggle-tts");
    if (ttsBtn) {
      ttsBtn.setAttribute("aria-pressed", this.isEnabled ? "true" : "false");
      ttsBtn.innerHTML = this.isEnabled
        ? `<span aria-hidden="true">🔊</span> <span>Voz: Activa</span>`
        : `<span aria-hidden="true">🔇</span> <span>Voz: Mute</span>`;
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
   * Generar texto conciso en lenguaje natural (máximo 1 o 2 oraciones)
   * @param {Array} cursosMatriculados
   * @param {string|null} diaFiltro
   */
  generarNarracionHorario(cursosMatriculados, diaFiltro = null) {
    if (!cursosMatriculados || cursosMatriculados.length === 0) {
      return "No tienes materias inscritas. Regresa a selección para añadir cursos.";
    }

    const totalCreditos = cursosMatriculados.reduce((sum, c) => sum + c.creditos, 0);

    if (diaFiltro) {
      const diaNorm = diaFiltro.toLowerCase();
      const cursosDelDia = [];

      cursosMatriculados.forEach(c => {
        c.bloques.forEach(b => {
          if (b.dia.toLowerCase().includes(diaNorm)) {
            cursosDelDia.push(`${c.nombre} de ${b.inicio} a ${b.fin} en ${c.aula}`);
          }
        });
      });

      if (cursosDelDia.length === 0) {
        return `El día ${diaFiltro} no tienes clases programadas.`;
      }

      return `El ${diaFiltro} tienes: ${cursosDelDia.join(". Y ") + "."}`;
    }

    // Narración global concisa
    return `Tienes ${cursosMatriculados.length} materias con un total de ${totalCreditos} créditos. Para consultar un día específico, di por ejemplo 'qué me toca el lunes'.`;
  }
}

export const speechSynthesisManager = new SpeechSynthesisManager();
