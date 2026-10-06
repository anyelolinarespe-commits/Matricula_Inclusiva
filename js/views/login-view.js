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
              <span aria-hidden="true">🎙️</span> <strong>Bienvenido al portal de matrícula accesible UTP.</strong>
              El asistente por voz está listo. Dicte su código o use el teclado.
            </div>
            <p style="font-size: var(--font-sm); margin-top: 0.25rem; color: var(--text-secondary);">
              Atajos: Presione <kbd>Enter</kbd> para ingresar, <kbd>Esc</kbd> para cancelar audio o <kbd>Alt + M</kbd> para alternar el micrófono.
            </p>
          </div>
          <button type="button" id="btn-play-welcome" class="btn-util btn-contrast-toggle" aria-label="Escuchar instrucciones de bienvenida por voz">
            <span aria-hidden="true">🔊</span> <span>Escuchar Instrucciones</span>
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
              <!-- Cuadro de credenciales institucionales por defecto para referencia rápida -->
              <div class="credentials-info-box" style="margin-bottom: 1.25rem; padding: 0.85rem 1rem; border-radius: 8px; background-color: var(--bg-hover); border: 2px solid var(--border-color); font-size: var(--font-sm);">
                <div style="font-weight: 800; color: var(--utp-red); margin-bottom: 0.25rem;">
                  <span aria-hidden="true">🔑</span> Credenciales por Defecto UTP:
                </div>
                <div style="color: var(--text-secondary); line-height: 1.5;">
                  • <strong>Código:</strong> <kbd style="padding: 0.15rem 0.4rem; background: rgba(0,0,0,0.1); border-radius: 4px;">U20211234</kbd> (o <kbd style="padding: 0.15rem 0.4rem; background: rgba(0,0,0,0.1); border-radius: 4px;">U22220525</kbd>)<br />
                  • <strong>Contraseña:</strong> <kbd style="padding: 0.15rem 0.4rem; background: rgba(0,0,0,0.1); border-radius: 4px;">password123</kbd> (o solicitar PIN <kbd style="padding: 0.15rem 0.4rem; background: rgba(0,0,0,0.1); border-radius: 4px;">8492</kbd>)
                </div>
              </div>

              <!-- Región de errores accesibles -->
              <div id="login-error-box" role="alert" aria-live="assertive" style="display: none; margin-bottom: 1.25rem; padding: 0.75rem 1rem; border-radius: 8px; background-color: #FEE2E2; border: 2px solid #EF4444; color: #991B1B; font-weight: 700;"></div>

              <div class="form-group">
                <label for="input-codigo" class="form-label">
                  Código de Estudiante <span aria-hidden="true">*</span>
                </label>
                <span id="codigo-hint" class="form-hint">
                  Ejemplo verbal: Diga <strong>"u 2 2 2 2 0 5 25"</strong> o <strong>"dictar código U20211234"</strong>.
                </span>
                <div class="voice-input-wrapper">
                  <input
                    type="text"
                    id="input-codigo"
                    class="form-input"
                    value="${this.codigoValue || 'U20211234'}"
                    autocomplete="username"
                    required
                    aria-describedby="codigo-hint codigo-feedback-box"
                    aria-required="true"
                  />
                  <button
                    type="button"
                    id="btn-voice-code"
                    class="btn-mic-inline"
                    title="Dictar código por voz"
                    aria-label="Activar dictado de código por voz"
                  >
                    <span aria-hidden="true">🎤</span>
                  </button>
                </div>
                <!-- Región en vivo para confirmación de código dictado -->
                <div id="codigo-feedback-box" role="status" aria-live="polite" style="display: none; margin-top: 0.75rem; padding: 0.75rem 1rem; border-radius: 8px; background-color: var(--color-success-bg); border: 2px solid var(--color-success-border); color: var(--color-success-text); font-weight: 700;"></div>
              </div>

              <div class="form-group">
                <label for="input-password" class="form-label">
                  Contraseña Institucional <span aria-hidden="true">*</span>
                </label>
                <span id="password-hint" class="form-hint">
                  Ingrese su contraseña institucional o solicite un PIN de acceso rápido.
                </span>
                <input
                  type="password"
                  id="input-password"
                  class="form-input"
                  value="password123"
                  autocomplete="current-password"
                  required
                  aria-describedby="password-hint"
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
                    <span aria-hidden="true">📲</span> <span>Solicitar PIN por SMS / Llamada</span>
                  </button>
                </div>
                <div id="pin-status-message" role="status" aria-live="polite" style="margin-top: 0.75rem; font-weight: 700; display: none;"></div>
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
              <span aria-hidden="true">🎙️</span> <span>Comandos de Voz</span>
            </h2>
            <p style="font-size: var(--font-sm); color: var(--text-secondary);">
              El sistema escucha activamente. Puede pronunciar o activar cada acción:
            </p>

            <ul class="command-list" role="list">
              <li class="command-item">
                <div>
                  <span class="command-trigger-badge">"dictar código U20211234"</span>
                  <div style="font-size: var(--font-sm); margin-top: 0.2rem;">Rellena el código de alumno</div>
                </div>
                <button type="button" class="btn-test-command" data-exec="dictar" aria-label="Probar comando dictar código" data-descripcion="Botón Probar: simula el dictado verbal del código de estudiante U20211234">Probar</button>
              </li>

              <li class="command-item">
                <div>
                  <span class="command-trigger-badge">"borrar código"</span>
                  <div style="font-size: var(--font-sm); margin-top: 0.2rem;">Limpia la casilla</div>
                </div>
                <button type="button" class="btn-test-command" data-exec="borrar" aria-label="Probar comando borrar código" data-descripcion="Botón Probar: limpia y vacía la casilla del código de estudiante">Probar</button>
              </li>

              <li class="command-item">
                <div>
                  <span class="command-trigger-badge">"u 2 2 2 2 0 5 25"</span>
                  <div style="font-size: var(--font-sm); margin-top: 0.2rem;">Une números en U22220525</div>
                </div>
                <button type="button" class="btn-test-command" data-exec="u22" aria-label="Probar comando u 2 2 2 2 0 5 25" data-descripcion="Botón Probar: simula la unión y tipeo de los números dictados individualmente">Probar</button>
              </li>

              <li class="command-item">
                <div>
                  <span class="command-trigger-badge">"repetir código"</span>
                  <div style="font-size: var(--font-sm); margin-top: 0.2rem;">Deletrea el código actual</div>
                </div>
                <button type="button" class="btn-test-command" data-exec="repetir" aria-label="Probar comando repetir código" data-descripcion="Botón Probar: deletrea en voz alta el código ingresado para confirmación auditiva">Probar</button>
              </li>

              <li class="command-item">
                <div>
                  <span class="command-trigger-badge">"ingresar"</span>
                  <div style="font-size: var(--font-sm); margin-top: 0.2rem;">Valida credenciales y entra</div>
                </div>
                <button type="button" class="btn-test-command" data-exec="ingresar" aria-label="Probar comando ingresar" data-descripcion="Botón Probar: valida las credenciales y accede al catálogo de matrícula">Probar</button>
              </li>

              <li class="command-item">
                <div>
                  <span class="command-trigger-badge">"solicitar pin"</span>
                  <div style="font-size: var(--font-sm); margin-top: 0.2rem;">Envía PIN de verificación</div>
                </div>
                <button type="button" class="btn-test-command" data-exec="pin" aria-label="Probar comando solicitar PIN" data-descripcion="Botón Probar: envía un código PIN de verificación rápida vía SMS">Probar</button>
              </li>

              <li class="command-item">
                <div>
                  <span class="command-trigger-badge">"silenciar voz"</span>
                  <div style="font-size: var(--font-sm); margin-top: 0.2rem;">Mutea el asistente</div>
                </div>
                <button type="button" class="btn-test-command" data-exec="silenciar" aria-label="Probar comando silenciar voz" data-descripcion="Botón Probar: silencia inmediatamente el asistente de voz">Probar</button>
              </li>

              <li class="command-item">
                <div>
                  <span class="command-trigger-badge">"ayuda"</span>
                  <div style="font-size: var(--font-sm); margin-top: 0.2rem;">Narra los comandos disponibles</div>
                </div>
                <button type="button" class="btn-test-command" data-exec="ayuda" aria-label="Probar comando ayuda" data-descripcion="Botón Probar: narra en voz alta la lista completa de comandos por voz">Probar</button>
              </li>
            </ul>
          </aside>
        </div>
      </section>
    `;

    this.bindEvents();
    // No reproducir bucle automático; el usuario solicita la voz con el botón o teclado
  }

  playAutoWelcome() {
    const welcomeMsg = "Portal de matrícula UTP. Dicte su código de estudiante o presione Enter para acceder.";
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

    const btnSubmit = document.getElementById("btn-submit-login");
    if (btnSubmit) {
      btnSubmit.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleLoginSubmit();
      });
    }

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
    const inputPassword = document.getElementById("input-password");
    const errorBox = document.getElementById("login-error-box");
    const valCodigo = (inputCodigo ? inputCodigo.value : "").trim().toUpperCase();
    const valPassword = (inputPassword ? inputPassword.value : "").trim();

    if (errorBox) {
      errorBox.style.display = "none";
      errorBox.textContent = "";
    }

    const showError = (msg) => {
      accessibilityManager.playEarcon("error");
      accessibilityManager.announceAssertive(`Error: ${msg}`);
      speechSynthesisManager.speak(`Error. ${msg}`, true);
      if (errorBox) {
        errorBox.textContent = `❌ ${msg}`;
        errorBox.style.display = "block";
      }
    };

    if (!valCodigo) {
      showError("El campo de código de estudiante no puede estar vacío. Por favor dígalo o escríbalo.");
      if (inputCodigo) inputCodigo.focus();
      return;
    }

    if (!valPassword) {
      showError("El campo de contraseña no puede estar vacío. Ingrese su contraseña institucional o solicite un PIN de acceso rápido.");
      if (inputPassword) inputPassword.focus();
      return;
    }

    // Actualizar código en datos del estudiante
    ESTUDIANTE.codigo = valCodigo;

    // Feedback sonoro y accesible
    accessibilityManager.playEarcon("success");
    accessibilityManager.announceAssertive(`Acceso concedido para el código ${valCodigo}. Ingresando al catálogo de matrícula.`);

    // Emitir mensaje por voz
    speechSynthesisManager.speak(`Identidad confirmada para el código ${valCodigo}. Ingresando al catálogo de matrícula.`, true);

    // Transición inmediata a la vista de matrícula para garantizar que siempre abra de inmediato
    if (typeof this.onLoginSuccess === "function") {
      this.onLoginSuccess();
    }
  }

  handleSolicitarPin() {
    this.pinRequested = true;
    const inputPassword = document.getElementById("input-password");
    if (inputPassword) {
      inputPassword.value = "8492";
    }
    const msgEl = document.getElementById("pin-status-message");
    if (msgEl) {
      msgEl.style.display = "block";
      msgEl.style.color = "var(--color-success-text)";
      msgEl.textContent = `✅ PIN de acceso rápido '8492' enviado a su móvil ${ESTUDIANTE.telefonoContacto}. El sistema lo aplicó automáticamente al campo de contraseña.`;
    }
    accessibilityManager.playEarcon("success");
    speechSynthesisManager.speak("PIN 8492 enviado con éxito. Se ha autocompletado en el campo de contraseña.", true);
  }

  handleVoiceCommand(action, payload) {
    if (action === "ENFOCAR_CODIGO") {
      const inputCodigo = document.getElementById("input-codigo");
      if (inputCodigo) {
        accessibilityManager.setFocus(inputCodigo, true);
        speechSynthesisManager.speak("Campo de código enfocado.", true);
      }
    } else if (action === "ENFOCAR_PASSWORD") {
      const inputPass = document.getElementById("input-password");
      if (inputPass) {
        accessibilityManager.setFocus(inputPass, true);
        speechSynthesisManager.speak("Campo de contraseña enfocado.", true);
      }
    } else if (action === "DICTAR_CODIGO") {
      const inputCodigo = document.getElementById("input-codigo");
      const feedbackBox = document.getElementById("codigo-feedback-box");
      if (inputCodigo) {
        inputCodigo.value = payload;
        this.codigoValue = payload;
        accessibilityManager.playEarcon("success");
        accessibilityManager.setFocus(inputCodigo, true);

        if (feedbackBox) {
          feedbackBox.style.display = "block";
          feedbackBox.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap;">
              <div>
                <span style="font-size: var(--font-sm); text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.9;">Código ingresado:</span>
                <div style="font-size: var(--font-xl); font-weight: 900; letter-spacing: 2px; color: var(--utp-red-dark);">${payload}</div>
              </div>
              <button type="button" id="btn-confirm-code-voice" class="btn-util active" style="border-radius: 6px; padding: 0.5rem 1rem; font-size: var(--font-sm); min-height: 48px;">
                <span aria-hidden="true">✅</span> <span>Confirmar e Ingresar</span>
              </button>
            </div>
            <p style="font-size: var(--font-sm); margin-top: 0.35rem; font-weight: normal; opacity: 0.95;">
              Diga <strong>"ingresar"</strong> para continuar o <strong>"borrar código"</strong> para corregirlo.
            </p>
          `;

          const btnConfirmDirect = document.getElementById("btn-confirm-code-voice");
          if (btnConfirmDirect) {
            btnConfirmDirect.addEventListener("click", () => this.handleLoginSubmit());
          }
        }

        // Mensaje auditivo conciso (máximo 1 o 2 oraciones)
        const deletreado = deletrearCodigoParaVoz(payload);
        const mensajeConfirmacion = `Código recibido: ${deletreado}. Diga 'ingresar' para continuar o 'borrar código'.`;
        speechSynthesisManager.speak(mensajeConfirmacion, true);
        accessibilityManager.announceAssertive(`Código ${payload} ingresado.`);
      }
    } else if (action === "REPETIR_CODIGO") {
      const inputCodigo = document.getElementById("input-codigo");
      const codActual = (inputCodigo && inputCodigo.value.trim()) || this.codigoValue;
      if (inputCodigo) accessibilityManager.setFocus(inputCodigo, true);
      if (codActual) {
        const deletreado = deletrearCodigoParaVoz(codActual);
        speechSynthesisManager.speak(`Código actual: ${deletreado}. Diga 'ingresar' para acceder.`, true);
      } else {
        speechSynthesisManager.speak("La casilla está vacía. Dicte su código de estudiante.", true);
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
        accessibilityManager.setFocus(inputCodigo, true);
        speechSynthesisManager.speak("Código borrado.", true);
      }
    } else if (action === "INGRESAR") {
      const btnSubmit = document.getElementById("btn-submit-login");
      if (btnSubmit) accessibilityManager.setFocus(btnSubmit, true);
      this.handleLoginSubmit();
    } else if (action === "SOLICITAR_PIN") {
      const btnPin = document.getElementById("btn-request-pin");
      if (btnPin) accessibilityManager.setFocus(btnPin, true);
      this.handleSolicitarPin();
    } else if (action === "AYUDA") {
      speechSynthesisManager.speak(
        "Dicte su código pausadamente, o diga 'ingresar' para acceder al sistema.",
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
