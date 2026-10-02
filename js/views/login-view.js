/**
 * login-view.js - Pantalla 1: Login Accesible con Asistente por Voz
 * Sistema de Matrícula Accesible UTP
 * WCAG 2.1 AAA
 */

import { accessibilityManager } from "../services/accessibility.js";
import { speechSynthesisManager } from "../services/speech-synthesis.js";
import { speechRecognitionManager } from "../services/speech-recognition.js";
import { ESTUDIANTE } from "../data/mock-data.js";

/**
 * Convierte un código universitario en pronunciación clara dígito por dígito para confirmación de voz
 * @param {string} codigo - Ej. "U22220525"
 * @returns {string} - Ej. "U, dos, dos, dos, dos, cero, cinco, dos, cinco"
 */
export function deletrearCodigoParaVoz(codigo) {
  const mapaDigitos = {
    '0': 'cero',
    '1': 'uno',
    '2': 'dos',
    '3': 'tres',
    '4': 'cuatro',
    '5': 'cinco',
    '6': 'seis',
    '7': 'siete',
    '8': 'ocho',
    '9': 'nueve'
  };

  const caracteres = String(codigo).toUpperCase().split('');
  return caracteres.map(char => {
    if (char === 'U') return 'letra U';
    return mapaDigitos[char] || char;
  }).join(', ');
}

export class LoginView {
  constructor(container, onLoginSuccess) {
    this.container = container;
    this.onLoginSuccess = onLoginSuccess;
    this.codigoValue = ESTUDIANTE.codigo;
    this.passwordValue = "••••••••••";
    this.pinRequested = false;
  }

  render() {
    this.container.innerHTML = `
      <section class="login-section" aria-labelledby="login-heading">
        <h1 id="login-heading" class="sr-only">Portal de Acceso Accesible UTP</h1>

        <!-- Banner auditivo y visual de bienvenida -->
        <div class="welcome-audio-banner" role="region" aria-label="Bienvenida del Asistente">
          <div>
            <div class="welcome-banner-text">
              🎙️ <strong>Bienvenido al portal de matrícula accesible UTP.</strong>
              El asistente por voz está activo. Diga su código de estudiante o presione la <strong>Barra Espaciadora</strong>.
            </div>
            <p style="font-size: var(--font-sm); margin-top: 0.25rem; color: var(--text-secondary);">
              Atajo: Presione <strong>Enter</strong> para ingresar o <strong>Alt + A</strong> para escuchar la lista de comandos.
            </p>
          </div>
          <button id="btn-play-welcome" class="btn-util btn-contrast-toggle" aria-label="Reproducir mensaje de bienvenida">
            🔊 Escuchar Bienvenida
          </button>
        </div>

        <div class="login-view-layout">
          <!-- Formulario Principal -->
          <div class="login-card">
            <h2 style="font-size: var(--font-2xl); font-weight: 800; margin-bottom: 0.5rem; color: var(--utp-red);">
              Ingreso a Matrícula 2026-II
            </h2>
            <p style="margin-bottom: 1.5rem; color: var(--text-secondary);">
              Ingrese sus credenciales institucionales o use los comandos de voz guiados.
            </p>

            <form id="form-login" novalidate>
              <div class="form-group">
                <label for="input-codigo" class="form-label">
                  Código de Estudiante <span aria-hidden="true">*</span>
                </label>
                <span id="codigo-hint" class="form-hint">
                  Ejemplo verbal: Diga <strong>"u 2 2 2 2 0 5 25"</strong> o <strong>"dictar código U20211234"</strong>. Los números se unirán automáticamente.
                </span>
                <div class="voice-input-wrapper">
                  <input
                    type="text"
                    id="input-codigo"
                    class="form-input"
                    value="${this.codigoValue}"
                    autocomplete="username"
                    required
                    aria-describedby="codigo-hint"
                    aria-required="true"
                  />
                  <button
                    type="button"
                    id="btn-voice-code"
                    class="btn-mic-inline"
                    title="Dictar código por voz"
                    aria-label="Activar dictado de código por voz"
                  >
                    🎤
                  </button>
                </div>
                <!-- Banner dinámico de confirmación de código dictado -->
                <div id="codigo-feedback-box" role="status" aria-live="polite" style="display: none; margin-top: 0.75rem; padding: 0.75rem 1rem; border-radius: 8px; background-color: var(--color-success-bg); border: 2px solid var(--color-success-border); color: var(--color-success-text); font-weight: 700;"></div>
              </div>

              <div class="form-group">
                <label for="input-password" class="form-label">
                  Contraseña Institucional <span aria-hidden="true">*</span>
                </label>
                <input
                  type="password"
                  id="input-password"
                  class="form-input"
                  value="password123"
                  autocomplete="current-password"
                  required
                  aria-required="true"
                />
              </div>

              <!-- Alternativa accesible por SMS / Llamada asistida -->
              <div class="pin-fallback-card" role="region" aria-label="Alternativa accesible de acceso">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
                  <div>
                    <strong style="display: block; font-size: var(--font-base);">¿Dificultades motoras con la contraseña?</strong>
                    <span style="font-size: var(--font-sm); color: var(--text-secondary);">
                      Solicite un código PIN de acceso rápido a su teléfono registrado (${ESTUDIANTE.telefonoContacto}).
                    </span>
                  </div>
                  <button
                    type="button"
                    id="btn-request-pin"
                    class="btn-util"
                    style="border: 2px solid var(--border-color); border-radius: 6px;"
                  >
                    📲 Solicitar PIN por SMS / Llamada
                  </button>
                </div>
                <div id="pin-status-message" style="margin-top: 0.75rem; font-weight: 700; display: none;"></div>
              </div>

              <div style="margin-top: 2rem;">
                <button
                  type="submit"
                  id="btn-submit-login"
                  class="btn-primary"
                  aria-label="Ingresar a Matrícula. Atajo tecla Enter"
                >
                  <span>Ingresar a Matrícula</span>
                  <kbd style="background: rgba(0,0,0,0.2); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: var(--font-sm);">Enter</kbd>
                </button>
              </div>
            </form>
          </div>

          <!-- Panel Lateral: Listado interactivo de comandos permitidos -->
          <aside class="command-sheet-card" aria-labelledby="commands-title">
            <h2 id="commands-title" class="command-sheet-title">
              <span>🎙️</span> Comandos de Voz
            </h2>
            <p style="font-size: var(--font-sm); color: var(--text-secondary);">
              El sistema escucha activamente. Puede pronunciar o hacer clic para simular cada acción:
            </p>

            <ul class="command-list" role="list">
              <li class="command-item">
                <div>
                  <span class="command-trigger-badge">"dictar código U20211234"</span>
                  <div style="font-size: var(--font-sm); margin-top: 0.2rem;">Rellena el código de alumno</div>
                </div>
                <button type="button" class="btn-test-command" data-exec="dictar" aria-label="Probar comando dictar código">Probar</button>
              </li>

              <li class="command-item">
                <div>
                  <span class="command-trigger-badge">"borrar código"</span>
                  <div style="font-size: var(--font-sm); margin-top: 0.2rem;">Limpia la casilla</div>
                </div>
                <button type="button" class="btn-test-command" data-exec="borrar" aria-label="Probar comando borrar código">Probar</button>
              </li>

              <li class="command-item">
                <div>
                  <span class="command-trigger-badge">"u 2 2 2 2 0 5 25"</span>
                  <div style="font-size: var(--font-sm); margin-top: 0.2rem;">Une números en U22220525 y confirma</div>
                </div>
                <button type="button" class="btn-test-command" data-exec="u22" aria-label="Probar comando u 2 2 2 2 0 5 25">Probar</button>
              </li>

              <li class="command-item">
                <div>
                  <span class="command-trigger-badge">"repetir código"</span>
                  <div style="font-size: var(--font-sm); margin-top: 0.2rem;">Deletrea el código para verificarlo</div>
                </div>
                <button type="button" class="btn-test-command" data-exec="repetir" aria-label="Probar comando repetir código">Probar</button>
              </li>

              <li class="command-item">
                <div>
                  <span class="command-trigger-badge">"ingresar"</span>
                  <div style="font-size: var(--font-sm); margin-top: 0.2rem;">Valida credenciales y entra</div>
                </div>
                <button type="button" class="btn-test-command" data-exec="ingresar" aria-label="Probar comando ingresar">Probar</button>
              </li>

              <li class="command-item">
                <div>
                  <span class="command-trigger-badge">"solicitar pin"</span>
                  <div style="font-size: var(--font-sm); margin-top: 0.2rem;">Envía PIN de verificación</div>
                </div>
                <button type="button" class="btn-test-command" data-exec="pin" aria-label="Probar comando solicitar PIN">Probar</button>
              </li>

              <li class="command-item">
                <div>
                  <span class="command-trigger-badge">"silenciar voz"</span>
                  <div style="font-size: var(--font-sm); margin-top: 0.2rem;">Mutea el asistente</div>
                </div>
                <button type="button" class="btn-test-command" data-exec="silenciar" aria-label="Probar comando silenciar voz">Probar</button>
              </li>

              <li class="command-item">
                <div>
                  <span class="command-trigger-badge">"ayuda"</span>
                  <div style="font-size: var(--font-sm); margin-top: 0.2rem;">Narra los comandos disponibles</div>
                </div>
                <button type="button" class="btn-test-command" data-exec="ayuda" aria-label="Probar comando ayuda">Probar</button>
              </li>
            </ul>
          </aside>
        </div>
      </section>
    `;

    this.bindEvents();
    this.playAutoWelcome();
  }

  playAutoWelcome() {
    const welcomeMsg = "Bienvenido al portal de matrícula UTP. El asistente por voz está activo. Diga su código de estudiante o presione la barra espaciadora.";
    // Intentar reproducir síntesis si el usuario ya ha interactuado, o en el primer clic
    speechSynthesisManager.speak(welcomeMsg, true);
  }

  bindEvents() {
    const form = document.getElementById("form-login");
    const inputCodigo = document.getElementById("input-codigo");
    const btnPlayWelcome = document.getElementById("btn-play-welcome");
    const btnVoiceCode = document.getElementById("btn-voice-code");
    const btnRequestPin = document.getElementById("btn-request-pin");

    btnPlayWelcome.addEventListener("click", () => {
      this.playAutoWelcome();
    });

    btnVoiceCode.addEventListener("click", () => {
      speechRecognitionManager.start();
      speechSynthesisManager.speak("Por favor, dicte su código de estudiante ahora.", true);
    });

    btnRequestPin.addEventListener("click", () => {
      this.handleSolicitarPin();
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleLoginSubmit();
    });

    // Delegación de clics en la lista de comandos interactivos para testing rápido
    this.container.querySelectorAll(".btn-test-command").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const action = e.currentTarget.getAttribute("data-exec");
        this.executeCommand(action);
      });
    });
  }

  handleLoginSubmit() {
    const inputCodigo = document.getElementById("input-codigo");
    const val = inputCodigo.value.trim().toUpperCase();

    if (!val) {
      accessibilityManager.playEarcon("error");
      accessibilityManager.announceAssertive("Error: Ingrese su código de estudiante.");
      speechSynthesisManager.speak("Error. El campo de código de estudiante no puede estar vacío. Por favor dígalo o escríbalo.", true);
      inputCodigo.focus();
      return;
    }

    accessibilityManager.playEarcon("success");
    speechSynthesisManager.speak(`Identidad confirmada para el código ${val}. Cargando catálogo de matrícula.`, true, () => {
      this.onLoginSuccess();
    });
  }

  handleSolicitarPin() {
    this.pinRequested = true;
    const msgEl = document.getElementById("pin-status-message");
    if (msgEl) {
      msgEl.style.display = "block";
      msgEl.style.color = "var(--color-success-text)";
      msgEl.textContent = `✅ PIN de acceso rápido '8492' enviado a su móvil ${ESTUDIANTE.telefonoContacto}. El sistema lo aplicará automáticamente.`;
    }
    accessibilityManager.playEarcon("success");
    speechSynthesisManager.speak("PIN enviado con éxito a su teléfono móvil. Se ha autocompletado su clave de acceso rápido.", true);
  }

  handleVoiceCommand(action, payload) {
    if (action === "DICTAR_CODIGO") {
      const inputCodigo = document.getElementById("input-codigo");
      const feedbackBox = document.getElementById("codigo-feedback-box");
      if (inputCodigo) {
        inputCodigo.value = payload;
        this.codigoValue = payload;
        accessibilityManager.playEarcon("success");

        if (feedbackBox) {
          feedbackBox.style.display = "block";
          feedbackBox.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap;">
              <div>
                <span style="font-size: var(--font-sm); text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.9;">Código dictado y concatenado:</span>
                <div style="font-size: var(--font-xl); font-weight: 900; letter-spacing: 2px; color: var(--utp-red-dark);">${payload}</div>
              </div>
              <button type="button" id="btn-confirm-code-voice" class="btn-util active" style="border-radius: 6px; padding: 0.4rem 0.85rem; font-size: var(--font-sm);">
                ✅ Confirmar e Ingresar
              </button>
            </div>
            <p style="font-size: var(--font-sm); margin-top: 0.35rem; font-weight: normal; opacity: 0.95;">
              Diga <strong>"ingresar"</strong> o <strong>"confirmar"</strong> para entrar, o <strong>"borrar código"</strong> para corregirlo.
            </p>
          `;

          const btnConfirmDirect = document.getElementById("btn-confirm-code-voice");
          if (btnConfirmDirect) {
            btnConfirmDirect.addEventListener("click", () => this.handleLoginSubmit());
          }
        }

        // Repetir el código para confirmación auditiva clara (dígito por dígito)
        const deletreado = deletrearCodigoParaVoz(payload);
        const mensajeConfirmacion = `Código recibido y unido: ${deletreado}. En pantalla se colocó: ${payload}. Diga 'ingresar' para confirmar su acceso, o 'borrar código' si desea corregirlo.`;
        speechSynthesisManager.speak(mensajeConfirmacion, true);
        accessibilityManager.announceAssertive(`Código ${payload} ingresado.`);
      }
    } else if (action === "REPETIR_CODIGO") {
      const inputCodigo = document.getElementById("input-codigo");
      const codActual = (inputCodigo && inputCodigo.value.trim()) || this.codigoValue;
      if (codActual) {
        const deletreado = deletrearCodigoParaVoz(codActual);
        speechSynthesisManager.speak(`El código actual colocado es: ${deletreado}. En pantalla: ${codActual}. Diga 'ingresar' para confirmar su acceso.`, true);
      } else {
        speechSynthesisManager.speak("La casilla de código está vacía. Dicte su código diciendo por ejemplo 'u 2 2 2 2 0 5 2 5'.", true);
      }
    } else if (action === "BORRAR_CODIGO") {
      const inputCodigo = document.getElementById("input-codigo");
      const feedbackBox = document.getElementById("codigo-feedback-box");
      if (inputCodigo) {
        inputCodigo.value = "";
        this.codigoValue = "";
        if (feedbackBox) {
          feedbackBox.style.display = "none";
        }
        accessibilityManager.playEarcon("cancel");
        speechSynthesisManager.speak("Código borrado. Casilla vacía.", true);
      }
    } else if (action === "INGRESAR") {
      this.handleLoginSubmit();
    } else if (action === "SOLICITAR_PIN") {
      this.handleSolicitarPin();
    } else if (action === "AYUDA") {
      speechSynthesisManager.speak(
        "Comandos en esta pantalla: dicte su código pausadamente como 'u 2 2 2 2 0 5 25' para juntarlo automáticamente, diga 'repetir código' para re-confirmarlo, 'borrar código' para vaciarlo, o 'ingresar' para confirmar y entrar.",
        true
      );
    }
  }

  executeCommand(action) {
    if (action === "dictar") {
      this.handleVoiceCommand("DICTAR_CODIGO", ESTUDIANTE.codigo);
    } else if (action === "u22") {
      this.handleVoiceCommand("DICTAR_CODIGO", "U22220525");
    } else if (action === "repetir") {
      this.handleVoiceCommand("REPETIR_CODIGO", null);
    } else if (action === "borrar") {
      this.handleVoiceCommand("BORRAR_CODIGO", null);
    } else if (action === "ingresar") {
      this.handleVoiceCommand("INGRESAR", null);
    } else if (action === "pin") {
      this.handleVoiceCommand("SOLICITAR_PIN", null);
    } else if (action === "silenciar") {
      speechRecognitionManager.stop();
      speechSynthesisManager.stop();
    } else if (action === "ayuda") {
      this.handleVoiceCommand("AYUDA", null);
    }
  }
}
