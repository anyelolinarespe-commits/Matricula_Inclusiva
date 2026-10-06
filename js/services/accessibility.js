/**
 * accessibility.js - Administrador de Accesibilidad WCAG 2.1 AAA
 * Gestión de escalado tipográfico, alto contraste, regiones ARIA Live y señales auditivas (Earcons)
 */

import { speechSynthesisManager } from "./speech-synthesis.js";

class AccessibilityManager {
  constructor() {
    this.fontScaleLevels = [1, 1.25, 1.5]; // Normal, A+, A++
    this.currentScaleIndex = 0;
    this.isHighContrast = false;
    this.audioCtx = null;
    this.focusReadTimeout = null;
    this.isFocusReaderEnabled = true;

    this.init();
  }

  init() {
    // Restaurar preferencias guardadas
    const savedScale = localStorage.getItem("utp_font_scale_index");
    if (savedScale !== null) {
      this.currentScaleIndex = parseInt(savedScale, 10);
      this.applyFontScale();
    }

    const savedContrast = localStorage.getItem("utp_high_contrast");
    if (savedContrast === "true") {
      this.setHighContrast(true);
    }

    this.setupFocusReader();
    this.setupTestSoundButton();
  }

  // Inicializar contexto Web Audio para señales auditivas sin dependencias externas
  initAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  /**
   * Reproduce un 'Earcon' auditivo para personas ciegas o con visión reducida
   * @param {'success'|'error'|'listen'|'cancel'} type
   */
  playEarcon(type) {
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;

      if (type === "listen") {
        // Tono ascendente de inicio de escucha
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === "success") {
        // Doble pitido armónico de éxito
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === "error") {
        // Tono grave de advertencia o cruce de horarios
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(160, now + 0.3);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === "cancel") {
        // Tono descendente de cancelación o silencio
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch (e) {
      console.warn("Audio Context Earcon no permitido aún por el navegador:", e);
    }
  }

  // Ajuste de escala tipográfica
  changeFontScale(delta) {
    if (delta === 0) {
      this.currentScaleIndex = 0; // Normal
    } else {
      const nextIndex = this.currentScaleIndex + delta;
      if (nextIndex >= 0 && nextIndex < this.fontScaleLevels.length) {
        this.currentScaleIndex = nextIndex;
      }
    }
    this.applyFontScale();
    localStorage.setItem("utp_font_scale_index", this.currentScaleIndex);

    const labels = ["Tamaño de texto Normal (100%)", "Tamaño de texto Grande (125%)", "Tamaño de texto Extra Grande (150%)"];
    this.announcePolite(labels[this.currentScaleIndex]);
    return this.currentScaleIndex;
  }

  applyFontScale() {
    const scale = this.fontScaleLevels[this.currentScaleIndex];
    document.documentElement.style.setProperty("--font-scale", scale);

    // Actualizar estados visuales de los botones de texto
    const buttons = document.querySelectorAll("[data-scale-btn]");
    buttons.forEach((btn, index) => {
      if (index === this.currentScaleIndex) {
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");
      } else {
        btn.classList.remove("active");
        btn.setAttribute("aria-pressed", "false");
      }
    });
  }

  // Alternar Modo Alto Contraste
  toggleHighContrast() {
    this.setHighContrast(!this.isHighContrast);
  }

  setHighContrast(enable) {
    this.isHighContrast = enable;
    if (enable) {
      document.body.classList.add("alto-contraste");
      document.body.classList.add("high-contrast");
      localStorage.setItem("utp_high_contrast", "true");
      this.announcePolite("Modo de Alto Contraste Activado");
    } else {
      document.body.classList.remove("alto-contraste");
      document.body.classList.remove("high-contrast");
      localStorage.setItem("utp_high_contrast", "false");
      this.announcePolite("Modo de Contraste Estándar UTP Activado");
    }

    const contrastBtn = document.getElementById("btn-toggle-contrast");
    if (contrastBtn) {
      contrastBtn.setAttribute("aria-pressed", enable ? "true" : "false");
      contrastBtn.innerHTML = enable
        ? '<span aria-hidden="true">☀️</span> <span>Contraste Estándar</span>'
        : '<span aria-hidden="true">👁️</span> <span>Alto Contraste</span>';
    }
  }

  /**
   * Notificación para lectores de pantalla en Live Region Assertive (Prioridad Alta / Alertas)
   * @param {string} message
   */
  announceAssertive(message) {
    const el = document.getElementById("aria-announcer-assertive");
    if (el) {
      el.textContent = "";
      setTimeout(() => {
        el.textContent = message;
      }, 50);
    }
  }

  /**
   * Notificación para lectores de pantalla en Live Region Polite (Prioridad Normal / Información)
   * @param {string} message
   */
  announcePolite(message) {
    const el = document.getElementById("aria-announcer-polite");
    if (el) {
      el.textContent = "";
      setTimeout(() => {
        el.textContent = message;
      }, 50);
    }
  }

  /**
   * Forzar foco accesible en un elemento y desplazar la interfaz suavemente
   * @param {string|HTMLElement} target
   * @param {boolean} andScroll - Si debe ejecutar scrollIntoView
   */
  setFocus(target, andScroll = true) {
    const element = typeof target === "string" ? document.getElementById(target) : target;
    if (element) {
      // Si el elemento no es interactivo por defecto, temporalmente tabindex=-1
      if (!element.hasAttribute("tabindex") && !["BUTTON", "A", "INPUT", "SELECT", "TEXTAREA"].includes(element.tagName)) {
        element.setAttribute("tabindex", "-1");
      }
      try {
        element.focus({ preventScroll: !andScroll });
      } catch (e) {
        element.focus();
      }
      if (andScroll && typeof element.scrollIntoView === "function") {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }

  /**
   * Obtener el rol nativo o ARIA en español
   * @param {HTMLElement} el
   * @returns {string}
   */
  getElementRoleSpanish(el) {
    if (!el || !el.tagName) return "elemento";

    const explicitRole = el.getAttribute("role");
    if (explicitRole) {
      const roleMap = {
        button: "botón",
        link: "enlace",
        checkbox: "casilla de verificación",
        radio: "botón de opción",
        textbox: "campo de texto",
        combobox: "selector desplegable",
        tab: "pestaña",
        region: "sección",
        banner: "encabezado institucional",
        main: "contenido principal",
        alert: "alerta",
        status: "estado"
      };
      if (roleMap[explicitRole]) return roleMap[explicitRole];
    }

    const tag = el.tagName.toUpperCase();
    if (tag === "BUTTON") return "botón";
    if (tag === "A") return "enlace";
    if (tag === "SELECT") return "selector";
    if (tag === "TEXTAREA") return "área de texto";
    if (tag === "INPUT") {
      const type = (el.getAttribute("type") || "text").toLowerCase();
      if (type === "button" || type === "submit" || type === "reset") return "botón";
      if (type === "checkbox") return "casilla de verificación";
      if (type === "radio") return "botón de opción";
      if (type === "password") return "campo de contraseña";
      return "campo de texto";
    }
    if (/^H[1-6]$/.test(tag)) return `encabezado nivel ${tag.charAt(1)}`;
    if (tag === "NAV") return "navegación";
    if (tag === "MAIN") return "contenido principal";
    if (tag === "SECTION") return "sección";

    return "control";
  }

  /**
   * Extrae nombre, rol y propósito/descripción de un elemento interactivo
   * @param {HTMLElement} el
   * @returns {{ nombre: string, rol: string, descripcion: string, textoLectura: string }}
   */
  describeElement(el) {
    if (!el) return null;

    const rol = this.getElementRoleSpanish(el);

    // 1. Obtener Nombre Accesible
    let nombre = "";
    if (el.getAttribute("aria-label")) {
      nombre = el.getAttribute("aria-label").trim();
    } else if (el.getAttribute("aria-labelledby")) {
      const lblEl = document.getElementById(el.getAttribute("aria-labelledby"));
      if (lblEl) nombre = lblEl.textContent.trim();
    }

    if (!nombre) {
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        if (el.id) {
          const labelFor = document.querySelector(`label[for="${el.id}"]`);
          if (labelFor) nombre = labelFor.textContent.trim();
        }
        if (!nombre && el.placeholder) {
          nombre = el.placeholder.trim();
        }
      } else {
        // Clonar para excluir aria-hidden de iconos
        const clone = el.cloneNode(true);
        clone.querySelectorAll("[aria-hidden='true']").forEach(n => n.remove());
        nombre = (clone.textContent || "").replace(/\s+/g, " ").trim();
      }
    }

    // 2. Obtener Descripción o Propósito
    let descripcion = "";
    if (el.getAttribute("data-descripcion")) {
      descripcion = el.getAttribute("data-descripcion").trim();
    } else if (el.getAttribute("data-ayuda")) {
      descripcion = el.getAttribute("data-ayuda").trim();
    } else if (el.getAttribute("aria-describedby")) {
      const descEl = document.getElementById(el.getAttribute("aria-describedby"));
      if (descEl) descripcion = descEl.textContent.trim();
    } else if (el.title) {
      descripcion = el.title.trim();
    }

    // Si el nombre ya contiene el rol o la descripción, no duplicarlo
    let textoLectura = "";
    if (nombre && descripcion && nombre.toLowerCase().includes(descripcion.toLowerCase())) {
      textoLectura = `${rol}: ${nombre}`;
    } else if (nombre && descripcion) {
      textoLectura = `${rol}: ${nombre}. ${descripcion}`;
    } else if (nombre) {
      textoLectura = `${rol}: ${nombre}`;
    } else if (descripcion) {
      textoLectura = `${rol}: ${descripcion}`;
    } else {
      textoLectura = `${rol}`;
    }

    return { nombre, rol, descripcion, textoLectura };
  }

  /**
   * Configura la auto-lectura al navegar con teclado (Tabulador / focusin)
   */
  setupFocusReader() {
    // Cancelar habla de inmediato cuando se presiona la tecla Tab (navegación rápida sin encolamiento)
    window.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        speechSynthesisManager.cancelImmediate();
        if (this.focusReadTimeout) {
          clearTimeout(this.focusReadTimeout);
          this.focusReadTimeout = null;
        }
      }
    });

    // Escuchar foco para auto-lectura
    document.addEventListener("focusin", (e) => {
      if (!this.isFocusReaderEnabled) return;
      const target = e.target;
      if (!target || target === document.body || target === document.documentElement) return;

      // Filtrar solo elementos interactivos o con tabindex
      const isInteractive =
        ["BUTTON", "A", "INPUT", "SELECT", "TEXTAREA"].includes(target.tagName) ||
        target.hasAttribute("tabindex") ||
        target.hasAttribute("role");

      if (!isInteractive) return;

      if (this.focusReadTimeout) {
        clearTimeout(this.focusReadTimeout);
      }

      // Pequeño debounce (70ms) para evitar picos de audio al tabear rápidamente
      this.focusReadTimeout = setTimeout(() => {
        const info = this.describeElement(target);
        if (info && info.textoLectura) {
          speechSynthesisManager.speak(info.textoLectura, true);
        }
      }, 70);
    });
  }

  /**
   * Configuración y enlace de eventos para el botón "Probar" en cabecera
   */
  setupTestSoundButton() {
    const bindBtn = () => {
      const btnTest = document.getElementById("btn-test-sound");
      if (btnTest && !btnTest.hasAttribute("data-bound")) {
        btnTest.setAttribute("data-bound", "true");
        btnTest.addEventListener("click", () => {
          this.executeSoundTest();
        });
      }
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", bindBtn);
    } else {
      bindBtn();
    }
  }

  /**
   * Ejecuta la prueba de sonido del sintetizador de voz y verificación de volumen
   */
  executeSoundTest() {
    this.playEarcon("success");

    const feedbackMsg = "Prueba de sonido exitosa. El sistema de audio está funcionando correctamente.";

    // 1. Notificar en región live específica #test-feedback-status
    const testStatus = document.getElementById("test-feedback-status");
    if (testStatus) {
      testStatus.textContent = "";
      setTimeout(() => {
        testStatus.textContent = feedbackMsg;
      }, 30);
    }

    // 2. Notificar en Live Region Polite general
    this.announcePolite(feedbackMsg);

    // 3. Efecto visual pulsante en el botón presionado
    const btnTest = document.getElementById("btn-test-sound");
    if (btnTest) {
      btnTest.classList.add("testing-active");
      setTimeout(() => {
        btnTest.classList.remove("testing-active");
      }, 1000);
    }

    // 4. Sintetizar la voz en lenguaje natural
    speechSynthesisManager.speak(feedbackMsg, true);
  }
}

export const accessibilityManager = new AccessibilityManager();
