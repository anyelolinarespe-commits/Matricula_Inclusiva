/**
 * horario-view.js - Pantalla 3: Horario Consolidado y Narración Asistida
 * Sistema de Matrícula Accesible UTP
 * WCAG 2.1 AAA
 */

import { accessibilityManager } from "../services/accessibility.js";
import { speechSynthesisManager } from "../services/speech-synthesis.js";
import { speechRecognitionManager } from "../services/speech-recognition.js";
import { ESTUDIANTE } from "../data/mock-data.js";

export class HorarioView {
  constructor(container, state, onNavigateBack) {
    this.container = container;
    this.state = state; // Cursos matriculados
    this.onNavigateBack = onNavigateBack;
  }

  render() {
    const cursos = this.state.cursosMatriculados;
    const totalCreditos = cursos.reduce((acc, c) => acc + c.creditos, 0);

    const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const horasFranja = [
      { etiqueta: "08:00 - 10:00", inicioMin: 480, finMin: 600 },
      { etiqueta: "10:15 - 12:45", inicioMin: 615, finMin: 765 },
      { etiqueta: "14:00 - 16:30", inicioMin: 840, finMin: 990 },
      { etiqueta: "18:30 - 21:30", inicioMin: 1110, finMin: 1290 }
    ];

    this.container.innerHTML = `
      <section class="horario-section" aria-labelledby="horario-heading">
        <!-- Banner Superior de Horario con Controles de Audio -->
        <div class="schedule-hero-banner" role="region" aria-label="Controles de Narración Auditiva">
          <div>
            <div style="font-size: var(--font-sm); text-transform: uppercase; color: var(--utp-red); font-weight: 800;">
              Confirmación Académica • UTP ${ESTUDIANTE.periodo}
            </div>
            <h1 id="horario-heading" tabindex="-1" style="font-size: var(--font-2xl); font-weight: 800; color: var(--text-primary);">
              Horario Oficial Consolidado
            </h1>
            <p style="font-size: var(--font-base); color: var(--text-secondary); margin-top: 0.25rem;">
              Estudiante: <strong>${ESTUDIANTE.nombre}</strong> (${ESTUDIANTE.codigo}) • 
              <strong>${cursos.length} Asignaturas</strong> (${totalCreditos} de 22 Créditos)
            </p>
          </div>

          <!-- Barra de Controles de Audio Accesibles -->
          <div class="schedule-audio-controls" role="toolbar" aria-label="Controles de Narración del Horario">
            <button
              type="button"
              id="btn-narrar-todo"
              class="btn-audio-control primary"
              aria-label="Narrar Horario Completo en Voz Alta. Atajo Alt más R"
            >
              <span aria-hidden="true">🔊</span> <span>Narrar Todo [Alt + R]</span>
            </button>

            <button
              type="button"
              id="btn-pausar-audio"
              class="btn-audio-control"
              aria-label="Pausar o Reanudar Audio. Atajo Alt más P"
            >
              <span aria-hidden="true">⏸️</span> <span>Pausar / Reanudar [Alt + P]</span>
            </button>

            <button
              type="button"
              id="btn-narrar-hoy"
              class="btn-audio-control"
              aria-label="Narrar clases de hoy. Atajo Alt más H"
            >
              <span aria-hidden="true">📅</span> <span>Narrar Solo Hoy [Alt + H]</span>
            </button>
          </div>
        </div>

        <!-- Barra rápida de botones por día para personas con movilidad reducida -->
        <div style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; background: var(--bg-card); padding: 0.75rem 1.25rem; border: 2px solid var(--border-color); border-radius: 8px;">
          <span style="font-weight: 700; font-size: var(--font-sm);">Consultar por día:</span>
          ${diasSemana.map(dia => `
            <button
              type="button"
              class="btn-util btn-day-narrate"
              data-dia="${dia}"
              style="border: 1px solid var(--border-color); border-radius: 4px; padding: 0.5rem 0.85rem; font-size: var(--font-sm); min-height: 48px;"
              aria-label="Narrar clases del ${dia}"
            >
              ${dia}
            </button>
          `).join("")}
        </div>

        <!-- 1. Visualización: Grilla Semanal Visual de Alto Contraste -->
        <div class="schedule-grid-wrapper" role="region" aria-label="Grilla Gráfica Semanal de Alto Contraste" tabindex="-1">
          <h2 style="font-size: var(--font-lg); font-weight: 800; margin-bottom: 1rem; color: var(--text-primary);">
            <span aria-hidden="true">📊</span> <span>Grilla Semanal Visual</span>
          </h2>
          <table class="schedule-grid-table" aria-label="Tabla de distribución horaria de lunes a sábado">
            <thead>
              <tr>
                <th scope="col" class="time-col">Franja Horaria</th>
                ${diasSemana.map(d => `<th scope="col">${d}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${horasFranja.map(franja => `
                <tr>
                  <th scope="row" class="time-col">${franja.etiqueta}</th>
                  ${diasSemana.map(dia => {
                    const cursosEnBloque = cursos.filter(c => 
                      c.bloques.some(b => b.dia === dia && (b.inicioMin < franja.finMin && b.finMin > franja.inicioMin))
                    );

                    if (cursosEnBloque.length === 0) {
                      return `<td style="color: var(--text-secondary); font-size: var(--font-sm);">Libre</td>`;
                    }

                    return `
                      <td>
                        ${cursosEnBloque.map(c => `
                          <div class="schedule-cell-block" role="article" aria-label="${c.nombre} de ${c.diasHorario}">
                            <div class="cell-course-name">${c.nombre}</div>
                            <div class="cell-course-room">📍 ${c.aula} • Sec: ${c.seccion}</div>
                          </div>
                        `).join("")}
                      </td>
                    `;
                  }).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <!-- 2. Visualización: Resumen Lineal Accesible (Óptimo para Lectores de Pantalla) -->
        <div class="schedule-linear-section" role="region" aria-label="Resumen Lineal de Horario por Días">
          <h2 style="font-size: var(--font-lg); font-weight: 800; margin-bottom: 1rem; color: var(--text-primary);">
            📝 Itinerario Cronológico Detallado
          </h2>

          ${diasSemana.map(dia => {
            const clasesDelDia = [];
            cursos.forEach(c => {
              c.bloques.forEach(b => {
                if (b.dia === dia) {
                  clasesDelDia.push({
                    curso: c.nombre,
                    codigo: c.codigo,
                    creditos: c.creditos,
                    horario: `${b.inicio} - ${b.fin}`,
                    docente: c.docente,
                    aula: c.aula,
                    modalidad: c.modalidad
                  });
                }
              });
            });

            if (clasesDelDia.length === 0) {
              return `
                <div class="linear-day-group">
                  <h3 class="linear-day-heading">${dia}</h3>
                  <p style="color: var(--text-secondary); font-size: var(--font-sm);">Sin actividades académicas registradas.</p>
                </div>
              `;
            }

            return `
              <div class="linear-day-group">
                <h3 class="linear-day-heading">${dia} (${clasesDelDia.length} ${clasesDelDia.length === 1 ? 'clase' : 'clases'})</h3>
                ${clasesDelDia.map(item => `
                  <div class="linear-course-item">
                    <div style="font-size: var(--font-base); font-weight: 800; color: var(--text-primary);">
                      ⏰ ${item.horario} • ${item.curso} (${item.codigo})
                    </div>
                    <div style="font-size: var(--font-sm); color: var(--text-secondary); margin-top: 0.25rem;">
                      📍 <strong>Ubicación:</strong> ${item.aula} | 
                      👨‍🏫 <strong>Docente:</strong> ${item.docente} | 
                      🎓 <strong>Modalidad:</strong> ${item.modalidad} (${item.creditos} Créditos)
                    </div>
                  </div>
                `).join("")}
              </div>
            `;
          }).join("")}
        </div>

        <!-- Botones de Acción Final: Descargas y Navegación -->
        <div class="schedule-actions-row" role="region" aria-label="Acciones del Horario">
          <button
            type="button"
            id="btn-back-to-matricula"
            class="btn-secondary"
            aria-label="Volver a la selección de asignaturas"
          >
            ⬅️ Volver a Selección de Cursos
          </button>

          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
            <button
              type="button"
              id="btn-download-pdf"
              class="btn-primary"
              style="width: auto;"
              aria-label="Descargar o Imprimir Horario Oficial en PDF"
            >
              📄 Descargar Horario (PDF / Imprimir)
            </button>

            <button
              type="button"
              id="btn-download-txt"
              class="btn-secondary"
              aria-label="Descargar Transcripción Accesible de Audio y Texto"
            >
              💾 Descargar Texto Accesible (.txt)
            </button>
          </div>
        </div>
      </section>
    `;

    this.bindEvents();
    // No reproducir bucle automático; el usuario solicita la voz con el botón o comando
    accessibilityManager.announcePolite("Horario oficial cargado. Presione Alt más R para narrar o examine la grilla semanal.");
  }

  autoNarrarHorarioCompleto() {
    const btn = document.getElementById("btn-narrar-todo");
    if (btn) accessibilityManager.setFocus(btn, true);

    const texto = speechSynthesisManager.generarNarracionHorario(this.state.cursosMatriculados);
    speechSynthesisManager.speak(texto, true);
  }

  narrarDia(dia) {
    let diaElegido = dia;
    if (dia.toLowerCase() === "hoy") {
      const hoyNum = new Date().getDay(); // 0 Dom, 1 Lun...
      const diasArr = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
      diaElegido = diasArr[hoyNum] || "Lunes";
    }

    const btnDia = this.container.querySelector(`[data-dia="${diaElegido}"]`);
    if (btnDia) accessibilityManager.setFocus(btnDia, true);

    const texto = speechSynthesisManager.generarNarracionHorario(this.state.cursosMatriculados, diaElegido);
    accessibilityManager.playEarcon("listen");
    speechSynthesisManager.speak(texto, true);
  }

  bindEvents() {
    // Narrar todo
    const btnNarrarTodo = document.getElementById("btn-narrar-todo");
    if (btnNarrarTodo) {
      btnNarrarTodo.addEventListener("click", () => {
        this.autoNarrarHorarioCompleto();
      });
    }

    // Pausar / Reanudar
    const btnPausar = document.getElementById("btn-pausar-audio");
    if (btnPausar) {
      btnPausar.addEventListener("click", () => {
        speechSynthesisManager.togglePause();
      });
    }

    // Narrar hoy
    const btnNarrarHoy = document.getElementById("btn-narrar-hoy");
    if (btnNarrarHoy) {
      btnNarrarHoy.addEventListener("click", () => {
        this.narrarDia("hoy");
      });
    }

    // Botones por día
    this.container.querySelectorAll(".btn-day-narrate").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const dia = e.currentTarget.getAttribute("data-dia");
        this.narrarDia(dia);
      });
    });

    // Volver a matrícula
    const btnVolver = document.getElementById("btn-back-to-matricula");
    if (btnVolver) {
      btnVolver.addEventListener("click", () => {
        speechSynthesisManager.stop();
        this.onNavigateBack();
      });
    }

    // Descargar PDF / Imprimir
    const btnDescargarPDF = document.getElementById("btn-download-pdf");
    if (btnDescargarPDF) {
      btnDescargarPDF.addEventListener("click", () => {
        this.descargarPDF();
      });
    }

    // Descargar Texto Accesible
    const btnDescargarTxt = document.getElementById("btn-download-txt");
    if (btnDescargarTxt) {
      btnDescargarTxt.addEventListener("click", () => {
        this.descargarTextoAccesible();
      });
    }
  }

  descargarPDF() {
    const btn = document.getElementById("btn-download-pdf");
    if (btn) accessibilityManager.setFocus(btn, true);

    accessibilityManager.playEarcon("success");
    speechSynthesisManager.speak("Generando documento accesible de horario.", true, () => {
      window.print();
    });
  }

  descargarTextoAccesible() {
    const btn = document.getElementById("btn-download-txt");
    if (btn) accessibilityManager.setFocus(btn, true);

    const texto = speechSynthesisManager.generarNarracionHorario(this.state.cursosMatriculados);
    const contenido = `========================================================\n` +
      `UNIVERSIDAD TECNOLÓGICA DEL PERÚ (UTP) - MATRÍCULA ACCESIBLE\n` +
      `PERIODO: ${ESTUDIANTE.periodo}\n` +
      `ESTUDIANTE: ${ESTUDIANTE.nombre} (${ESTUDIANTE.codigo})\n` +
      `CARRERA: ${ESTUDIANTE.carrera} | SEDE: ${ESTUDIANTE.sede}\n` +
      `========================================================\n\n` +
      `TRANSCRIPCIÓN COMPLETA DEL HORARIO:\n` +
      `${texto}\n\n` +
      `DETALLE DE ASIGNATURAS INSCRITAS:\n` +
      this.state.cursosMatriculados.map((c, i) => 
        `${i+1}. [${c.codigo}] ${c.nombre} (${c.creditos} Créditos)\n` +
        `   Horario: ${c.diasHorario}\n` +
        `   Aula: ${c.aula} | Docente: ${c.docente}\n`
      ).join("\n") +
      `\nGenerado por el Sistema de Matrícula Accesible UTP (WCAG 2.2 AA)\n`;

    const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Horario_UTP_${ESTUDIANTE.codigo}_Accesible.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    accessibilityManager.playEarcon("success");
    speechSynthesisManager.speak("Archivo descargado con éxito.", true);
  }

  handleVoiceCommand(action, payload) {
    if (action === "NARRAR_TODO") {
      this.autoNarrarHorarioCompleto();
    } else if (action === "NARRAR_DIA") {
      this.narrarDia(payload);
    } else if (action === "DESCARGAR_HORARIO") {
      this.descargarPDF();
    } else if (action === "VOLVER_MATRICULA") {
      const btn = document.getElementById("btn-back-to-matricula");
      if (btn) accessibilityManager.setFocus(btn, true);
      speechSynthesisManager.stop();
      this.onNavigateBack();
    } else if (action === "ENFOCAR_GRILLA") {
      const grilla = this.container.querySelector(".schedule-grid-wrapper");
      if (grilla) accessibilityManager.setFocus(grilla, true);
      speechSynthesisManager.speak("Grilla semanal enfocada.", true);
    } else if (action === "AYUDA") {
      speechSynthesisManager.speak(
        "Diga 'narrar todo', 'qué tengo el lunes', 'descargar horario' o 'volver'.",
        true
      );
    }
  }
}
