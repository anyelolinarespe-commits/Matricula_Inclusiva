/**
 * accessibility.js - Administrador de Accesibilidad WCAG 2.1 AAA
 * Gestión de escalado tipográfico, alto contraste, regiones ARIA Live y señales auditivas (Earcons)
 */

class AccessibilityManager {
  constructor() {
    this.fontScaleLevels = [1, 1.25, 1.5]; // Normal, A+, A++
    this.currentScaleIndex = 0;
    this.isHighContrast = false;
    this.audioCtx = null;

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
      document.body.classList.add("high-contrast");
      localStorage.setItem("utp_high_contrast", "true");
      this.announcePolite("Modo de Alto Contraste Activado");
    } else {
      document.body.classList.remove("high-contrast");
      localStorage.setItem("utp_high_contrast", "false");
      this.announcePolite("Modo de Contraste Estándar UTP Activado");
    }

    const contrastBtn = document.getElementById("btn-toggle-contrast");
    if (contrastBtn) {
      contrastBtn.setAttribute("aria-pressed", enable ? "true" : "false");
      contrastBtn.textContent = enable ? "☀️ Contraste Estándar" : "👁️ Alto Contraste";
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
   * Forzar foco accesible en un elemento
   * @param {string|HTMLElement} target
   */
  setFocus(target) {
    const element = typeof target === "string" ? document.getElementById(target) : target;
    if (element) {
      element.focus();
      // Si el elemento no es interactivo por defecto, temporalmente tabindex=-1
      if (!element.hasAttribute("tabindex") && !["BUTTON", "A", "INPUT", "SELECT", "TEXTAREA"].includes(element.tagName)) {
        element.setAttribute("tabindex", "-1");
      }
    }
  }
}

export const accessibilityManager = new AccessibilityManager();
