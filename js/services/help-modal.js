/**
 * help-modal.js - Centro de Ayuda Interactivo Accesible (WCAG 2.2 AA / AAA)
 * Despliega interfaz con comandos de voz, atajos de teclado y preguntas guiadas.
 */

import { accessibilityManager } from "./accessibility.js";
import { speechSynthesisManager } from "./speech-synthesis.js";

export const PREGUNTAS_AYUDA = {
  codigo: {
    pregunta: "¿Cómo dicto mi código de estudiante?",
    respuesta: "Para dictar su código diga 'dictar código' y pronuncie sus dígitos pausadamente, o active el botón de micrófono en la casilla de código. ¿Desea saber cómo ingresar su contraseña o pedir un PIN?",
    tab: "voice"
  },
  pin: {
    pregunta: "¿Cómo solicito un código PIN de acceso rápido?",
    respuesta: "Diga 'solicitar pin' o use el botón en pantalla. El sistema le enviará un PIN accesible de cuatro dígitos por SMS que se autocompletará. ¿Desea saber cómo ingresar?",
    tab: "voice"
  },
  matricula: {
    pregunta: "¿Cómo selecciono o quito un curso?",
    respuesta: "En la pantalla de matrícula, diga 'seleccionar' seguido del número de asignatura, por ejemplo 'seleccionar 1'. Para retirarla diga 'quitar 1'. ¿Desea saber cómo confirmar su matrícula?",
    tab: "voice"
  },
  confirmar: {
    pregunta: "¿Cómo confirmo mi matrícula?",
    respuesta: "Diga 'confirmar matrícula' o presione la tecla Enter para finalizar y guardar su horario. ¿Desea saber cómo ver su horario preliminar?",
    tab: "voice"
  },
  horario: {
    pregunta: "¿Cómo reviso mi horario semanal?",
    respuesta: "Diga 'ver horario' para acceder a la grilla semanal, o diga 'narrar todo' para escuchar sus clases día por día. ¿Desea saber cómo volver a seleccionar asignaturas?",
    tab: "voice"
  },
  contraste: {
    pregunta: "¿Cómo activo el modo de alto contraste?",
    respuesta: "Diga 'alto contraste' en cualquier momento o presione la combinación de teclas Alt más C para activar fondo negro con letras amarillas de máximo contraste. ¿Desea conocer los atajos de teclado?",
    tab: "keys"
  },
  texto: {
    pregunta: "¿Cómo cambio el tamaño de las letras?",
    respuesta: "Diga 'aumentar texto' o 'disminuir texto', o use las teclas Alt más 1 para tamaño normal, Alt más 2 para grande y Alt más 3 para máximo. ¿Desea consultar otros atajos?",
    tab: "keys"
  },
  cerrar_sesion: {
    pregunta: "¿Cómo cierro mi sesión?",
    respuesta: "Diga 'cerrar sesión' en cualquier pantalla o active el botón Cerrar Sesión en la esquina superior derecha del sistema. ¿Desea saber cómo volver?",
    tab: "voice"
  },
  cerrar_ayuda: {
    pregunta: "¿Cómo cierro este centro de ayuda?",
    respuesta: "Diga 'cerrar ayuda' o presione la tecla Escape para volver exactamente a la pantalla donde estaba.",
    tab: "voice"
  }
};

export class HelpModalManager {
  constructor() {
    this.modalEl = null;
    this.activeTab = "voice"; // "voice" | "keys" | "questions"
    this.previousFocusedElement = null;
    this.isModalOpen = false;
  }

  init() {
    this.modalEl = document.getElementById("help-modal");
    if (!this.modalEl) return;

    this.bindEvents();
  }

  bindEvents() {
    // Botón de cerrar superior
    const btnClose = document.getElementById("btn-close-help-modal");
    if (btnClose) {
      btnClose.addEventListener("click", () => this.close());
    }

    // Botón de cerrar inferior
    const btnFooterClose = document.getElementById("btn-footer-close-help");
    if (btnFooterClose) {
      btnFooterClose.addEventListener("click", () => this.close());
    }

    // Botón narrar guía auditiva interactiva
    const btnNarrarGuia = document.getElementById("btn-narrar-guia-ayuda");
    if (btnNarrarGuia) {
      btnNarrarGuia.addEventListener("click", () => this.narrarGuiaAyuda());
    }

    // Pestañas
    const tabVoice = document.getElementById("tab-btn-voice");
    const tabKeys = document.getElementById("tab-btn-keys");
    const tabQuestions = document.getElementById("tab-btn-questions");

    if (tabVoice) tabVoice.addEventListener("click", () => this.switchTab("voice", true));
    if (tabKeys) tabKeys.addEventListener("click", () => this.switchTab("keys", true));
    if (tabQuestions) tabQuestions.addEventListener("click", () => this.switchTab("questions", true));

    // Clic fuera del diálogo (en el backdrop) para cerrar
    this.modalEl.addEventListener("click", (e) => {
      if (e.target === this.modalEl) {
        this.close();
      }
    });

    // Delegación de clics en las preguntas interactivas
    this.modalEl.querySelectorAll("[data-help-question]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const qKey = e.currentTarget.getAttribute("data-help-question");
        this.responderPregunta(qKey, true);
      });
    });

    // Delegación de botones de prueba dentro del modal
    this.modalEl.querySelectorAll("[data-speak-command]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const textToSpeak = e.currentTarget.getAttribute("data-speak-command");
        speechSynthesisManager.speak(textToSpeak, true);
      });
    });

    // Atrapamiento de foco accesible por teclado dentro del modal
    this.modalEl.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        this.close();
        return;
      }

      if (e.key === "Tab") {
        this.handleFocusTrap(e);
      }
    });
  }

  handleFocusTrap(e) {
    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = Array.from(this.modalEl.querySelectorAll(focusableSelectors))
      .filter(el => !el.disabled && el.offsetParent !== null);

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }

  isOpen() {
    return this.isModalOpen;
  }

  toggle() {
    if (this.isModalOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open(initialTab = "voice", announce = true) {
    if (!this.modalEl) this.init();
    if (!this.modalEl) return;

    this.previousFocusedElement = document.activeElement;
    this.isModalOpen = true;
    this.modalEl.style.display = "flex";
    document.body.classList.add("modal-open");

    accessibilityManager.playEarcon("nav");
    this.switchTab(initialTab, false);

    // Mover foco al botón de cerrar o primera pestaña para lectores de pantalla
    setTimeout(() => {
      const btnClose = document.getElementById("btn-close-help-modal");
      if (btnClose) btnClose.focus();
    }, 100);

    if (announce) {
      this.narrarGuiaAyuda();
    }
  }

  close() {
    if (!this.modalEl || !this.isModalOpen) return;

    this.isModalOpen = false;
    this.modalEl.style.display = "none";
    document.body.classList.remove("modal-open");

    accessibilityManager.playEarcon("cancel");
    accessibilityManager.announceAssertive("Centro de ayuda cerrado.");
    speechSynthesisManager.speak("Centro de ayuda cerrado.", false);

    // Devolver foco al elemento previo
    if (this.previousFocusedElement && typeof this.previousFocusedElement.focus === "function") {
      this.previousFocusedElement.focus();
    }
  }

  switchTab(tabKey, announce = true) {
    this.activeTab = tabKey;

    const tabs = {
      voice: { btn: "tab-btn-voice", panel: "help-tab-voice", name: "Comandos de Voz" },
      keys: { btn: "tab-btn-keys", panel: "help-tab-keys", name: "Atajos de Teclado" },
      questions: { btn: "tab-btn-questions", panel: "help-tab-questions", name: "Pregúntale al Asistente" }
    };

    Object.keys(tabs).forEach(k => {
      const btn = document.getElementById(tabs[k].btn);
      const panel = document.getElementById(tabs[k].panel);
      const isCurrent = k === tabKey;

      if (btn) {
        btn.classList.toggle("active", isCurrent);
        btn.setAttribute("aria-selected", isCurrent ? "true" : "false");
        btn.setAttribute("tabindex", isCurrent ? "0" : "-1");
      }
      if (panel) {
        panel.style.display = isCurrent ? "block" : "none";
        panel.classList.toggle("active", isCurrent);
      }
    });

    if (announce) {
      const activeName = tabs[tabKey] ? tabs[tabKey].name : tabKey;
      accessibilityManager.announceAssertive(`Pestaña ${activeName} activada.`);
      if (tabKey === "voice") {
        speechSynthesisManager.speak("Mostrando comandos de voz. Puede decir por ejemplo: 'dictar código', 'seleccionar 1', 'ver horario' o 'cerrar sesión'.", true);
      } else if (tabKey === "keys") {
        speechSynthesisManager.speak("Mostrando atajos de teclado. Los atajos principales son: Alt más A para ayuda, Alt más M para micrófono, Alt más C para alto contraste y Esc para cerrar.", true);
      } else if (tabKey === "questions") {
        speechSynthesisManager.speak("Mostrando preguntas guiadas. Formule una pregunta por voz o active una pregunta en pantalla.", true);
      }
    }
  }

  narrarGuiaAyuda() {
    const speechText = "Centro de ayuda interactivo UTP. ¿Desea consultar los comandos de voz o los atajos de teclado? También puede formularme una pregunta por voz, por ejemplo: ¿cómo dicto mi código?, ¿cómo selecciono un curso?, o ¿cómo cierro sesión? Diga 'cerrar ayuda' para volver.";
    speechSynthesisManager.speak(speechText, true);
    accessibilityManager.announceAssertive(speechText);
  }

  responderPregunta(qKey, announce = true) {
    const item = PREGUNTAS_AYUDA[qKey];
    if (!item) return;

    // Asegurar que el modal esté abierto
    if (!this.isModalOpen) {
      this.open(item.tab, false);
    } else {
      this.switchTab(item.tab, false);
    }

    // Resaltar visualmente la tarjeta de la pregunta
    const cardEl = this.modalEl.querySelector(`[data-question-card="${qKey}"]`);
    if (cardEl) {
      this.modalEl.querySelectorAll("[data-question-card]").forEach(c => c.classList.remove("highlighted-question"));
      cardEl.classList.add("highlighted-question");
      cardEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    if (announce) {
      speechSynthesisManager.speak(item.respuesta, true);
      accessibilityManager.announceAssertive(item.respuesta);
    }
  }
}

export const helpModalManager = new HelpModalManager();
