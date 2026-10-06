/**
 * matricula-view.js - Pantalla 2: Selección y Matrícula de Asignaturas
 * Sistema de Matrícula Accesible UTP
 * WCAG 2.1 AAA
 */

import { accessibilityManager } from "../services/accessibility.js";
import { speechSynthesisManager } from "../services/speech-synthesis.js";
import { speechRecognitionManager } from "../services/speech-recognition.js";
import { ESTUDIANTE, CURSOS_CATALOGO, detectarCruceHorario } from "../data/mock-data.js";

export class MatriculaView {
  constructor(container, state, onNavigateToHorario) {
    this.container = container;
    this.state = state; // Contiene cursosMatriculados
    this.onNavigateToHorario = onNavigateToHorario;
    this.filtroTurno = "todos"; // "todos" | "mañana" | "tarde" | "noche"
    this.conflictoActual = null;
  }

  render() {
    const cursosFiltrados = this.getCursosFiltrados();
    const totalCreditos = this.calcularTotalCreditos();
    const porcentajeCreditos = Math.min(100, Math.round((totalCreditos / ESTUDIANTE.creditosMaximos) * 100));

    this.container.innerHTML = `
      <section class="matricula-section" aria-labelledby="matricula-heading">
        <!-- Banner Auditivo y Visual de Orientación Inicial -->
        <div class="welcome-audio-banner" role="region" aria-label="Bienvenida y Orientación de Matrícula" style="margin-bottom: 1.25rem;">
          <div>
            <div class="welcome-banner-text">
              <span aria-hidden="true">🏛️</span> <strong>Bienvenido al Portal de Selección de Matrícula UTP, ${ESTUDIANTE.nombre}.</strong>
            </div>
            <p style="font-size: var(--font-sm); margin-top: 0.25rem; color: var(--text-secondary);">
              Límite: <strong>${ESTUDIANTE.creditosMaximos} Créditos Máx.</strong> (actualmente <strong>${totalCreditos} seleccionados</strong> en ${this.state.cursosMatriculados.length} asignaturas).
              Diga <em>"ver cursos"</em>, <em>"ver créditos"</em>, <em>"filtrar turno mañana"</em> o <em>"seleccionar 1"</em>.
            </p>
          </div>
          <button type="button" id="btn-replay-welcome-matricula" class="btn-util btn-contrast-toggle" aria-label="Escuchar bienvenida y opciones por voz">
            <span aria-hidden="true">🔊</span> <span>Escuchar Opciones</span>
          </button>
        </div>

        <!-- Banner con Datos del Estudiante -->
        <div class="student-banner" role="region" aria-label="Perfil del Estudiante">
          <div>
            <div style="font-size: var(--font-sm); text-transform: uppercase; letter-spacing: 1px; color: var(--utp-red); font-weight: 800;">
              Portal de Matrícula UTP • ${ESTUDIANTE.periodo}
            </div>
            <h1 id="matricula-heading" class="student-info-name" tabindex="-1">
              ${ESTUDIANTE.nombre}
            </h1>
            <div class="student-info-details">
              <span><strong>Código:</strong> ${ESTUDIANTE.codigo}</span>
              <span><strong>Carrera:</strong> ${ESTUDIANTE.carrera}</span>
              <span><strong>Sede:</strong> ${ESTUDIANTE.sede}</span>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: var(--font-sm); color: var(--text-secondary); font-weight: 700;">Límite Académico</div>
            <div style="font-size: var(--font-xl); font-weight: 900; color: var(--utp-red);">
              ${ESTUDIANTE.creditosMaximos} Créditos Máx.
            </div>
          </div>
        </div>

        <!-- Alerta de Cruce de Horarios (si existe) -->
        ${this.conflictoActual ? `
          <div class="conflict-alert" role="alert" aria-live="assertive">
            <span aria-hidden="true" style="font-size: 1.5rem;">⚠️</span>
            <div>
              <strong>¡Cruce de horario detectado!</strong> 
              No se puede matricular "${this.conflictoActual.cursoNuevo.nombre}" porque se cruza el día 
              <strong>${this.conflictoActual.dia}</strong> (${this.conflictoActual.horario1}) 
              con el curso ya seleccionado <em>"${this.conflictoActual.cursoExistente.nombre}"</em>.
            </div>
          </div>
        ` : ''}

        <!-- Barra de Filtros Accesibles -->
        <div class="filter-toolbar" role="toolbar" aria-label="Filtro de asignaturas por turno">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-weight: 800; font-size: var(--font-base);"><span aria-hidden="true">🔍</span> Filtrar Turno:</span>
            <div class="filter-btn-group" role="radiogroup" aria-label="Seleccionar Turno">
              <button type="button" class="btn-filter ${this.filtroTurno === 'todos' ? 'active' : ''}" data-turno="todos" role="radio" aria-checked="${this.filtroTurno === 'todos'}">
                Todos (${CURSOS_CATALOGO.length})
              </button>
              <button type="button" class="btn-filter ${this.filtroTurno === 'mañana' ? 'active' : ''}" data-turno="mañana" role="radio" aria-checked="${this.filtroTurno === 'mañana'}">
                Mañana
              </button>
              <button type="button" class="btn-filter ${this.filtroTurno === 'tarde' ? 'active' : ''}" data-turno="tarde" role="radio" aria-checked="${this.filtroTurno === 'tarde'}">
                Tarde
              </button>
              <button type="button" class="btn-filter ${this.filtroTurno === 'noche' ? 'active' : ''}" data-turno="noche" role="radio" aria-checked="${this.filtroTurno === 'noche'}">
                Noche
              </button>
            </div>
          </div>

          <div style="font-size: var(--font-sm); color: var(--text-secondary);">
            Diga: <em>"seleccionar 1"</em>, <em>"filtrar turno noche"</em> o <em>"ver horario"</em>
          </div>
        </div>

        <!-- Disposición Principal: Catálogo y Panel Lateral -->
        <div class="matricula-layout">
          <!-- Listado de Asignaturas -->
          <div class="courses-grid" role="region" aria-label="Catálogo de asignaturas disponibles">
            ${cursosFiltrados.map(curso => {
              const estaMatriculado = this.state.cursosMatriculados.some(c => c.id === curso.id);
              return `
                <article
                  class="course-card ${estaMatriculado ? 'enrolled' : ''}"
                  id="curso-card-${curso.numero}"
                  tabindex="-1"
                  aria-labelledby="curso-title-${curso.numero}"
                >
                  <!-- Número destacado para comando de voz -->
                  <div class="course-number-badge" aria-label="Curso número ${curso.numero}">
                    ${curso.numero}
                  </div>

                  <!-- Información central -->
                  <div class="course-main-info">
                    <h2 id="curso-title-${curso.numero}" class="course-title">
                      ${curso.numero}. ${curso.nombre}
                    </h2>
                    <div class="course-meta-tags">
                      <span class="course-tag"><strong>Código:</strong> ${curso.codigo}</span>
                      <span class="course-tag"><strong>Créditos:</strong> ${curso.creditos}</span>
                      <span class="course-tag"><strong>Turno:</strong> ${curso.turno.toUpperCase()}</span>
                      <span class="course-tag"><strong>Sección:</strong> ${curso.seccion}</span>
                    </div>
                    <div class="course-schedule-text">
                      <span aria-hidden="true">📅</span>
                      <span>${curso.diasHorario}</span>
                      <span style="font-size: var(--font-sm); color: var(--text-secondary); font-weight: normal; margin-left: 0.5rem;">(${curso.aula})</span>
                    </div>
                    <p style="font-size: var(--font-sm); color: var(--text-secondary); margin-top: 0.2rem;">
                      Docente: ${curso.docente}
                    </p>
                  </div>

                  <!-- Acciones del curso -->
                  <div class="course-card-actions">
                    <button
                      type="button"
                      class="btn-course-action"
                      style="background-color: var(--bg-main); color: var(--text-primary); border: 2px solid var(--border-color); font-size: var(--font-sm); min-height: 48px; margin-bottom: 0.35rem;"
                      data-action="consultar"
                      data-id="${curso.numero}"
                      aria-label="Escuchar qué curso es el número ${curso.numero}, ${curso.nombre}"
                    >
                      <span aria-hidden="true">ℹ️</span> ¿Qué es? [${curso.numero}]
                    </button>
                    ${estaMatriculado ? `
                      <button
                        type="button"
                        class="btn-course-action btn-course-remove"
                        data-action="quitar"
                        data-id="${curso.id}"
                        aria-label="Quitar ${curso.nombre} del horario. Curso número ${curso.numero}"
                      >
                        <span aria-hidden="true">❌</span> Quitar [${curso.numero}]
                      </button>
                    ` : `
                      <button
                        type="button"
                        class="btn-course-action btn-course-add"
                        data-action="agregar"
                        data-id="${curso.id}"
                        aria-label="Agregar ${curso.nombre} al horario. Curso número ${curso.numero}"
                      >
                        <span aria-hidden="true">➕</span> Agregar [${curso.numero}]
                      </button>
                    `}
                  </div>
                </article>
              `;
            }).join("")}
          </div>

          <!-- Panel Lateral: Horario Armado y Créditos -->
          <aside class="sticky-sidebar" aria-labelledby="sidebar-heading">
            <div class="enrolled-panel-card">
              <h2 id="sidebar-heading" style="font-size: var(--font-xl); font-weight: 800; color: var(--text-primary);">
                <span aria-hidden="true">📋</span> <span>Horario Armado</span>
              </h2>
              
              <!-- Medidor de Créditos en Tiempo Real -->
              <div class="credits-meter-wrapper" role="region" aria-label="Balance de créditos">
                <div class="credits-meter-header">
                  <span>Créditos:</span>
                  <span id="credit-count-label" tabindex="-1" style="color: var(--utp-red);">${totalCreditos} / ${ESTUDIANTE.creditosMaximos}</span>
                </div>
                <div
                  class="credits-progress-bar"
                  role="progressbar"
                  aria-valuenow="${totalCreditos}"
                  aria-valuemin="0"
                  aria-valuemax="${ESTUDIANTE.creditosMaximos}"
                  aria-label="Progreso de créditos matriculados"
                >
                  <div class="credits-progress-fill" style="width: ${porcentajeCreditos}%;"></div>
                </div>
              </div>

              <!-- Mini lista de cursos seleccionados -->
              <div style="font-weight: 700; margin-bottom: 0.5rem; font-size: var(--font-base);">
                Asignaturas Elegidas (${this.state.cursosMatriculados.length}):
              </div>

              ${this.state.cursosMatriculados.length === 0 ? `
                <p style="font-size: var(--font-sm); color: var(--text-secondary); padding: 1rem; text-align: center; border: 1px dashed var(--border-subtle); border-radius: 6px;">
                  Aún no has agregado materias. Pronuncie <em>"seleccionar 1"</em> o presione el botón de agregar.
                </p>
              ` : `
                <ul class="enrolled-courses-mini-list" role="list">
                  ${this.state.cursosMatriculados.map(c => `
                    <li class="enrolled-mini-item">
                      <div>
                        <strong>#${c.numero} ${c.nombre}</strong>
                        <div style="font-size: var(--font-sm); color: var(--text-secondary);">
                          ${c.creditos} Créditos • ${c.diasHorario}
                        </div>
                      </div>
                      <button
                        type="button"
                        class="btn-remove-mini"
                        data-action="quitar"
                        data-id="${c.id}"
                        aria-label="Eliminar curso ${c.nombre} del horario"
                      >
                        ✕
                      </button>
                    </li>
                  `).join("")}
                </ul>
              `}

              <!-- Botones de Acción Final -->
              <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1.5rem;">
                <button
                  type="button"
                  id="btn-confirm-matricula"
                  class="btn-primary"
                  ${this.state.cursosMatriculados.length === 0 ? 'disabled style="opacity: 0.6; cursor: not-allowed;"' : ''}
                  aria-label="Confirmar Matrícula y generar horario. Atajo Alt más Enter"
                >
                  <span>Confirmar Matrícula</span>
                  <kbd style="background: rgba(0,0,0,0.25); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: var(--font-sm);">Alt + Enter</kbd>
                </button>

                <button
                  type="button"
                  id="btn-view-schedule"
                  class="btn-secondary"
                  style="width: 100%; justify-content: center;"
                  aria-label="Ver Horario Consolidado"
                >
                  <span aria-hidden="true">👁️</span> <span>Ver Horario Semanal</span>
                </button>

                <button
                  type="button"
                  id="btn-read-screen"
                  class="btn-secondary"
                  style="width: 100%; justify-content: center; font-size: var(--font-sm);"
                  aria-label="Leer pantalla en voz alta"
                >
                  <span aria-hidden="true">📖</span> <span>Leer Resumen de Pantalla</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </section>
    `;

    this.bindEvents();
  }

  getCursosFiltrados() {
    if (this.filtroTurno === "todos") return CURSOS_CATALOGO;
    return CURSOS_CATALOGO.filter(c => c.turno === this.filtroTurno);
  }

  calcularTotalCreditos() {
    return this.state.cursosMatriculados.reduce((sum, c) => sum + c.creditos, 0);
  }

  bindEvents() {
    // Manejo de botones de filtrado
    this.container.querySelectorAll(".btn-filter").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const turno = e.currentTarget.getAttribute("data-turno");
        this.setFiltroTurno(turno);
      });
    });

    // Manejo de agregar / quitar cursos
    this.container.querySelectorAll("[data-action='agregar']").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = parseInt(e.currentTarget.getAttribute("data-id"), 10);
        this.agregarCurso(id);
      });
    });

    this.container.querySelectorAll("[data-action='quitar']").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = parseInt(e.currentTarget.getAttribute("data-id"), 10);
        this.quitarCurso(id);
      });
    });

    // Botón Confirmar Matrícula
    const btnConfirmar = document.getElementById("btn-confirm-matricula");
    if (btnConfirmar) {
      btnConfirmar.addEventListener("click", () => {
        this.confirmarMatricula();
      });
    }

    // Botón Ver Horario
    const btnVerHorario = document.getElementById("btn-view-schedule");
    if (btnVerHorario) {
      btnVerHorario.addEventListener("click", () => {
        this.onNavigateToHorario();
      });
    }

    // Botón Leer Pantalla
    const btnLeerPantalla = document.getElementById("btn-read-screen");
    if (btnLeerPantalla) {
      btnLeerPantalla.addEventListener("click", () => {
        this.narrarResumenPantalla();
      });
    }

    // Manejo de consultar qué curso es
    this.container.querySelectorAll("[data-action='consultar']").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = parseInt(e.currentTarget.getAttribute("data-id"), 10);
        this.consultarCurso(id);
      });
    });

    // Botón Escuchar Bienvenida y Opciones
    const btnReplayWelcome = document.getElementById("btn-replay-welcome-matricula");
    if (btnReplayWelcome) {
      btnReplayWelcome.addEventListener("click", () => {
        this.narrarBienvenidaIngreso();
      });
    }
  }

  agregarCurso(identificador) {
    const num = parseInt(identificador, 10);
    const curso = CURSOS_CATALOGO.find(c => 
      (!isNaN(num) && c.numero === num) || 
      c.id === identificador || 
      c.numero === identificador || 
      c.nombre.toLowerCase().includes(String(identificador).toLowerCase())
    );

    if (!curso) {
      accessibilityManager.playEarcon("error");
      speechSynthesisManager.speak(`No se encontró el curso "${identificador}".`, true);
      return;
    }

    // Verificar si ya está matriculado
    if (this.state.cursosMatriculados.some(c => c.id === curso.id)) {
      speechSynthesisManager.speak(`El curso ${curso.nombre} ya se encuentra agregado.`, true);
      const card = document.getElementById(`curso-card-${curso.numero}`);
      if (card) accessibilityManager.setFocus(card, true);
      return;
    }

    // Verificar límite de créditos
    const totalCreditos = this.calcularTotalCreditos();
    if (totalCreditos + curso.creditos > ESTUDIANTE.creditosMaximos) {
      accessibilityManager.playEarcon("error");
      speechSynthesisManager.speak(
        `Supera el límite de 22 créditos permitidos.`,
        true
      );
      return;
    }

    // Verificar cruces de horario
    const cruce = detectarCruceHorario(curso, this.state.cursosMatriculados);
    if (cruce.hayCruce) {
      this.conflictoActual = {
        cursoNuevo: curso,
        cursoExistente: cruce.cursoExistente,
        dia: cruce.dia,
        horario1: cruce.horario1,
        horario2: cruce.horario2
      };
      accessibilityManager.playEarcon("error");
      this.render();
      speechSynthesisManager.speak(
        `Cruce de horario el ${cruce.dia} con ${cruce.cursoExistente.nombre}. No se agregó.`,
        true
      );
      return;
    }

    // Todo correcto: Agregar curso
    this.conflictoActual = null;
    this.state.cursosMatriculados.push(curso);
    accessibilityManager.playEarcon("success");
    const nuevosCreditos = this.calcularTotalCreditos();

    this.render();

    // Sincronizar foco físico y desplazamiento suave (Accesibilidad motriz)
    const card = document.getElementById(`curso-card-${curso.numero}`);
    if (card) {
      accessibilityManager.setFocus(card, true);
      card.classList.add("highlight-card");
      setTimeout(() => card.classList.remove("highlight-card"), 3000);
    }

    accessibilityManager.announcePolite(`Curso ${curso.nombre} agregado. Total: ${nuevosCreditos} créditos.`);
    speechSynthesisManager.speak(`Curso ${curso.numero}, ${curso.nombre}, agregado. Tienes ${nuevosCreditos} créditos.`, true);
  }

  quitarCurso(identificador) {
    const num = parseInt(identificador, 10);
    const cursoIndex = this.state.cursosMatriculados.findIndex(c => 
      (!isNaN(num) && c.numero === num) || 
      c.id === identificador || 
      c.numero === identificador || 
      c.nombre.toLowerCase().includes(String(identificador).toLowerCase())
    );

    if (cursoIndex === -1) {
      accessibilityManager.playEarcon("error");
      speechSynthesisManager.speak(`El curso no está en tu lista de materias seleccionadas.`, true);
      return;
    }

    const [cursoRemovido] = this.state.cursosMatriculados.splice(cursoIndex, 1);
    this.conflictoActual = null;
    accessibilityManager.playEarcon("cancel");
    const nuevosCreditos = this.calcularTotalCreditos();

    this.render();

    // Sincronizar foco físico en la tarjeta del curso retirado
    const card = document.getElementById(`curso-card-${cursoRemovido.numero}`);
    if (card) {
      accessibilityManager.setFocus(card, true);
    }

    accessibilityManager.announcePolite(`Curso ${cursoRemovido.nombre} retirado. Total: ${nuevosCreditos} créditos.`);
    speechSynthesisManager.speak(`Curso ${cursoRemovido.nombre} retirado. Te quedan ${nuevosCreditos} créditos.`, true);
  }

  setFiltroTurno(turno) {
    this.filtroTurno = turno;
    this.render();
    accessibilityManager.playEarcon("success");

    const btn = this.container.querySelector(`[data-turno="${turno}"]`);
    if (btn) {
      accessibilityManager.setFocus(btn, true);
    }

    const textoTurno = turno === "todos" ? "todos los turnos" : `turno ${turno}`;
    speechSynthesisManager.speak(`Filtro aplicado: mostrando ${textoTurno}.`, true);
  }

  confirmarMatricula() {
    if (this.state.cursosMatriculados.length === 0) {
      accessibilityManager.playEarcon("error");
      speechSynthesisManager.speak("Debes seleccionar al menos una asignatura antes de confirmar tu matrícula.", true);
      return;
    }

    const btn = document.getElementById("btn-confirm-matricula");
    if (btn) accessibilityManager.setFocus(btn, true);

    const total = this.calcularTotalCreditos();
    accessibilityManager.playEarcon("success");
    accessibilityManager.announceAssertive(`Matrícula confirmada con ${total} créditos. Abriendo horario oficial.`);
    speechSynthesisManager.speak(
      `Matrícula confirmada con ${total} créditos. Abriendo horario oficial.`,
      true
    );
    this.onNavigateToHorario();
  }

  /**
   * Narración concisa de bienvenida al ingresar a la pantalla de Matrícula (máximo 1 o 2 oraciones)
   */
  narrarBienvenidaIngreso() {
    const totalCreditos = this.calcularTotalCreditos();
    const mensaje = `Bienvenido a matrícula, ${ESTUDIANTE.nombre}. Tienes ${totalCreditos} de ${ESTUDIANTE.creditosMaximos} créditos. Diga 'ver cursos' o el número a elegir.`;

    speechSynthesisManager.speak(mensaje, true);
    accessibilityManager.announcePolite(`Bienvenido, ${ESTUDIANTE.nombre}. ${totalCreditos} de ${ESTUDIANTE.creditosMaximos} créditos.`);
  }

  narrarCreditos() {
    const total = this.calcularTotalCreditos();
    const count = this.state.cursosMatriculados.length;
    const meter = document.getElementById("credit-count-label");
    if (meter) accessibilityManager.setFocus(meter, true);

    const mensaje = `Tienes ${total} de 22 créditos en ${count} materias seleccionadas.`;
    accessibilityManager.playEarcon("listen");
    speechSynthesisManager.speak(mensaje, true);
  }

  narrarOpciones() {
    const mensaje = `Diga 'ver cursos', 'ver horario' o 'agrega' seguido del número de asignatura.`;
    speechSynthesisManager.speak(mensaje, true);
  }

  /**
   * Consulta y narra con concisión qué curso es un número específico
   * @param {number|string} identificador
   */
  consultarCurso(identificador) {
    const num = parseInt(identificador, 10);
    const curso = CURSOS_CATALOGO.find(
      c => (!isNaN(num) && c.numero === num) || 
           c.id === identificador || 
           c.numero === identificador || 
           c.nombre.toLowerCase().includes(String(identificador).toLowerCase())
    );

    if (!curso) {
      accessibilityManager.playEarcon("error");
      speechSynthesisManager.speak(`No se encontró el curso "${identificador}".`, true);
      return;
    }

    accessibilityManager.playEarcon("listen");

    // Resaltar visualmente la tarjeta del curso, enfocar y hacer scroll accesible
    const card = document.getElementById(`curso-card-${curso.numero}`);
    if (card) {
      accessibilityManager.setFocus(card, true);
      card.classList.add("highlight-card");
      setTimeout(() => card.classList.remove("highlight-card"), 3000);
    }

    const estaMatriculado = this.state.cursosMatriculados.some(c => c.id === curso.id);

    let mensaje = `Curso ${curso.numero}: ${curso.nombre}, ${curso.creditos} créditos, turno ${curso.turno}, aula ${curso.aula}. `;
    if (estaMatriculado) {
      mensaje += `Ya está en tu horario armado.`;
    } else {
      mensaje += `Diga 'agrega ${curso.numero}' para inscribirlo.`;
    }

    speechSynthesisManager.speak(mensaje, true);
    accessibilityManager.announceAssertive(`Curso #${curso.numero}: ${curso.nombre}. ${curso.creditos} créditos.`);
  }

  narrarResumenPantalla() {
    const total = this.calcularTotalCreditos();
    const count = this.state.cursosMatriculados.length;
    let mensaje = `Tienes ${count} asignaturas con ${total} créditos. Diga 'agrega' seguido del número de curso del 1 al 6.`;
    speechSynthesisManager.speak(mensaje, true);
  }

  handleVoiceCommand(action, payload) {
    if (action === "ENFOCAR_NOMBRE") {
      accessibilityManager.setFocus("matricula-heading", true);
      speechSynthesisManager.speak(`Perfil de ${ESTUDIANTE.nombre} enfocado.`, true);
    } else if (action === "CONSULTAR_CURSO") {
      this.consultarCurso(payload);
    } else if (action === "SELECCIONAR_CURSO") {
      this.agregarCurso(payload);
    } else if (action === "QUITAR_CURSO") {
      this.quitarCurso(payload);
    } else if (action === "FILTRAR_TURNO") {
      this.setFiltroTurno(payload);
    } else if (action === "LEER_PANTALLA_MATRICULA") {
      this.narrarResumenPantalla();
    } else if (action === "VER_CREDITOS") {
      this.narrarCreditos();
    } else if (action === "NARRAR_OPCIONES") {
      this.narrarOpciones();
    } else if (action === "VER_HORARIO") {
      this.onNavigateToHorario();
    } else if (action === "CONFIRMAR_MATRICULA") {
      this.confirmarMatricula();
    } else if (action === "AYUDA") {
      this.narrarOpciones();
    }
  }
}
