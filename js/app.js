/**
 * app.js - Orquestador Principal de la Aplicación
 * Sistema de Matrícula Accesible UTP (WCAG 2.1 AAA)
 */

import { accessibilityManager } from "./services/accessibility.js";
import { speechSynthesisManager } from "./services/speech-synthesis.js";
import { speechRecognitionManager } from "./services/speech-recognition.js";
import { CURSOS_CATALOGO } from "./data/mock-data.js";
import { LoginView } from "./views/login-view.js";
import { MatriculaView } from "./views/matricula-view.js";
import { HorarioView } from "./views/horario-view.js";

class App {
  constructor() {
    this.container = document.getElementById("contenido-principal") || document.getElementById("main-app-container");
    this.state = {
      isLoggedIn: false,
      currentView: "login", // "login" | "matricula" | "horario"
      // Cursos 1 (4 cr) y 2 (3 cr) preseleccionados = 7 / 22 Créditos iniciales como solicita el ejemplo
      cursosMatriculados: [CURSOS_CATALOGO[0], CURSOS_CATALOGO[1]]
    };
    this.activeViewInstance = null;

    this.init();
  }

  init() {
    this.setupGlobalAccessibilityControls();
    this.setupGlobalKeyboardShortcuts();
    this.setupSpeechRecognitionPipeline();

    // Renderizar la vista inicial
    this.navigateTo("login");
  }

  setupGlobalAccessibilityControls() {
    // Botones de escalado tipográfico
    const btnScaleNormal = document.getElementById("btn-scale-normal");
    const btnScalePlus = document.getElementById("btn-scale-plus");
    const btnScaleMax = document.getElementById("btn-scale-max");
    const btnToggleContrast = document.getElementById("btn-toggle-contrast");

    if (btnScaleNormal) {
      btnScaleNormal.addEventListener("click", () => accessibilityManager.changeFontScale(0));
    }
    if (btnScalePlus) {
      btnScalePlus.addEventListener("click", () => accessibilityManager.changeFontScale(1));
    }
    if (btnScaleMax) {
      btnScaleMax.addEventListener("click", () => accessibilityManager.changeFontScale(2));
    }
    if (btnToggleContrast) {
      btnToggleContrast.addEventListener("click", () => accessibilityManager.toggleHighContrast());
    }

    // Botones de la barra de estado del Asistente
    const btnToggleAssistant = document.getElementById("btn-toggle-assistant");
    const btnToggleTts = document.getElementById("btn-toggle-tts");

    if (btnToggleAssistant) {
      btnToggleAssistant.addEventListener("click", () => {
        speechRecognitionManager.toggle();
      });
    }

    if (btnToggleTts) {
      btnToggleTts.addEventListener("click", () => {
        speechSynthesisManager.toggleEnabled();
      });
    }
  }

  setupGlobalKeyboardShortcuts() {
    window.addEventListener("keydown", (e) => {
      // Control de interrupción inmediato por tecla Escape (WCAG 1.4.2)
      if (e.key === "Escape") {
        e.preventDefault();
        window.speechSynthesis.cancel();
        speechSynthesisManager.stop();
        accessibilityManager.announcePolite("Narración detenida");
        return;
      }

      // Ignorar ciertas teclas si el foco está en un campo de texto editable y no es un atajo con Alt
      const isInput = ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName);

      // Atajo Barra Espaciadora: Push-to-Talk / Alternar escucha cuando no se está escribiendo texto
      if (e.code === "Space" && !isInput) {
        e.preventDefault();
        speechRecognitionManager.toggle();
        return;
      }

      // Atajos con Alt (Estándar de Accesibilidad)
      if (e.altKey) {
        if (e.key === "p" || e.key === "P") {
          e.preventDefault();
          speechSynthesisManager.togglePause();
        } else if (e.key === "r" || e.key === "R") {
          e.preventDefault();
          if (this.state.currentView === "horario") {
            this.activeViewInstance.autoNarrarHorarioCompleto();
          } else {
            speechSynthesisManager.repeatLast();
          }
        } else if (e.key === "h" || e.key === "H") {
          e.preventDefault();
          if (this.state.currentView === "horario") {
            this.activeViewInstance.narrarDia("hoy");
          }
        } else if (e.key === "m" || e.key === "M") {
          // Atajo global obligatorio WCAG: Alt + M para alternar asistente
          e.preventDefault();
          speechRecognitionManager.toggle();
        } else if (e.key === "c" || e.key === "C") {
          e.preventDefault();
          accessibilityManager.toggleHighContrast();
        } else if (e.key === "a" || e.key === "A") {
          e.preventDefault();
          this.narrarAyudaGlobal();
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (this.state.currentView === "matricula") {
            this.activeViewInstance.confirmarMatricula();
          }
        } else if (e.key === "1") {
          e.preventDefault();
          accessibilityManager.changeFontScale(0);
        } else if (e.key === "2") {
          e.preventDefault();
          accessibilityManager.changeFontScale(1);
        } else if (e.key === "3") {
          e.preventDefault();
          accessibilityManager.changeFontScale(2);
        }
      }
    });
  }

  setupSpeechRecognitionPipeline() {
    speechRecognitionManager.onCommand(({ action, payload, view }) => {
      console.log(`[Comando Ejecutado]: ${action} (${payload}) en vista ${view}`);

      if (this.activeViewInstance && typeof this.activeViewInstance.handleVoiceCommand === "function") {
        this.activeViewInstance.handleVoiceCommand(action, payload);
      }
    });

    // Iniciar reconocimiento de voz automáticamente si está soportado
    setTimeout(() => {
      speechRecognitionManager.start();
    }, 800);
  }

  navigateTo(viewName) {
    this.state.currentView = viewName;
    speechRecognitionManager.setCurrentView(viewName);

    // Cancelar narraciones previas al cambiar de pantalla
    speechSynthesisManager.stop();

    if (viewName === "login") {
      this.activeViewInstance = new LoginView(this.container, () => {
        this.state.isLoggedIn = true;
        this.navigateTo("matricula");
      });
      this.activeViewInstance.render();
    } else if (viewName === "matricula") {
      this.activeViewInstance = new MatriculaView(
        this.container,
        this.state,
        () => this.navigateTo("horario")
      );
      this.activeViewInstance.render();
      accessibilityManager.setFocus("matricula-heading");
      // Narración obligatoria de bienvenida, lugar, créditos y opciones al ingresar
      this.activeViewInstance.narrarBienvenidaIngreso();
    } else if (viewName === "horario") {
      this.activeViewInstance = new HorarioView(
        this.container,
        this.state,
        () => this.navigateTo("matricula")
      );
      this.activeViewInstance.render();
      accessibilityManager.setFocus("horario-heading");
    }
  }

  narrarAyudaGlobal() {
    let msg = `Estás en la pantalla ${this.state.currentView}. `;
    if (this.state.currentView === "login") {
      msg += "Diga 'dictar código', 'ingresar', 'solicitar pin' o use la tecla Enter para acceder.";
    } else if (this.state.currentView === "matricula") {
      msg += "Diga 'seleccionar 1', 'quitar 1', 'filtrar turno mañana', 'leer pantalla' o 'confirmar matrícula'.";
    } else if (this.state.currentView === "horario") {
      msg += "Diga 'narrar todo', 'qué me toca el lunes', 'pausar', 'repetir', 'descargar horario' o 'volver'.";
    }
    msg += " Atajos: Espacio para activar voz, Alt más P para pausar, Alt más C para alto contraste.";
    speechSynthesisManager.speak(msg, true);
  }
}

// Inicializar la aplicación una vez cargado el DOM
document.addEventListener("DOMContentLoaded", () => {
  window.utpApp = new App();
});
