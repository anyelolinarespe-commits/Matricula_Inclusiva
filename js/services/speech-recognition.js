/**
 * speech-recognition.js - Administrador de Reconocimiento de Voz (Web Speech API)
 * Sistema de Matrícula Accesible UTP
 * WCAG 2.1 AAA: Diccionario controlado de intenciones y navegación hands-free
 */

import { accessibilityManager } from "./accessibility.js";
import { speechSynthesisManager } from "./speech-synthesis.js";

class SpeechRecognitionManager {
  constructor() {
    this.recognition = null;
    this.isSupported = false;
    this.isActive = true; // Activo por defecto según requerimiento
    this.isListening = false;
    this.isSpeakingPaused = false; // Bandera para eliminar eco y auto-escucha
    this.currentView = "login"; // "login" | "matricula" | "horario"
    this.commandListeners = [];
    this.manualStop = false;

    this.init();
  }

  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("SpeechRecognition no soportado en este navegador.");
      this.isSupported = false;
      this.updateStatusUI("unsupported", "Reconocimiento no soportado (use teclado)");
      return;
    }

    this.isSupported = true;
    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = "es-PE"; // Español de Perú
      this.recognition.maxAlternatives = 1;

      // Vincular con el sintetizador para silenciar el micrófono mientras habla
      speechSynthesisManager.setRecognitionController(this);

      this.setupEvents();
    } catch (err) {
      console.error("Error al inicializar SpeechRecognition:", err);
      this.isSupported = false;
      this.updateStatusUI("error", "Error al iniciar micrófono");
    }
  }

  setupEvents() {
    this.recognition.onstart = () => {
      this.isListening = true;
      this.updateStatusUI("listening", "Escuchando comandos...");
      accessibilityManager.playEarcon("listen");
    };

    this.recognition.onresult = (event) => {
      // Si el sintetizador está hablando, ignorar cualquier audio residual para evitar auto-escucha
      if (this.isSpeakingPaused) {
        return;
      }

      const lastIndex = event.results.length - 1;
      const transcript = event.results[lastIndex][0].transcript.trim().toLowerCase();
      console.log("[Voz Detectada]:", transcript);

      this.updateStatusUI("processing", "Procesando: " + transcript);
      this.updateLastCommandUI(transcript);

      // Procesar comando en el diccionario de intenciones
      this.processIntent(transcript);

      setTimeout(() => {
        if (this.isActive && this.isListening && !this.isSpeakingPaused) {
          this.updateStatusUI("listening", "Escuchando comandos...");
        }
      }, 1000);
    };

    this.recognition.onerror = (event) => {
      console.warn("Evento de error SpeechRecognition:", event.error);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        this.isActive = false;
        this.updateStatusUI("muted", "Micrófono bloqueado (Permiso denegado)");
        accessibilityManager.announceAssertive("Permiso de micrófono no otorgado. Puede usar el sistema con teclado o pantalla táctil.");
      } else if (event.error === "no-speech") {
        // Silencio normal, continuar escuchando si está activo y no silenciado
        if (this.isActive && !this.manualStop && !this.isSpeakingPaused) {
          this.updateStatusUI("listening", "Escuchando comandos...");
        }
      } else {
        this.updateStatusUI("error", `Aviso: ${event.error}`);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      // IMPORTANTE: Si el sintetizador está emitiendo voz, NO reanudar aquí para evitar eco
      if (this.isSpeakingPaused) {
        return;
      }

      // Reanudar automáticamente solo si el asistente sigue encendido y no fue apagado manualmente
      if (this.isActive && !this.manualStop) {
        setTimeout(() => {
          if (this.isActive && !this.manualStop && !this.isSpeakingPaused) {
            try {
              this.recognition.start();
            } catch (e) {
              // Ignorar si ya arrancó
            }
          }
        }, 150);
      } else {
        this.updateStatusUI("muted", "Asistente Silenciado");
      }
    };
  }

  /**
   * Pausar temporalmente el reconocimiento mientras el sintetizador habla (Elimina eco)
   */
  pauseForSpeaking() {
    if (!this.recognition || !this.isActive) return;
    this.isSpeakingPaused = true;
    try {
      this.recognition.abort();
    } catch (e) {}
    this.updateStatusUI("processing", "Asistente hablando...");
  }

  /**
   * Reactivar el reconocimiento de voz tras finalizar el habla del sintetizador
   */
  resumeAfterSpeaking() {
    this.isSpeakingPaused = false;
    if (!this.recognition || !this.isActive || this.manualStop) {
      this.updateStatusUI("muted", "Asistente Silenciado");
      return;
    }

    // Pequeño margen para asegurar que el eco de los parlantes se ha disipado
    setTimeout(() => {
      if (this.isActive && !this.manualStop && !this.isSpeakingPaused) {
        try {
          this.recognition.start();
        } catch (e) {}
      }
    }, 200);
  }

  start() {
    if (!this.isSupported || !this.recognition) return;
    this.manualStop = false;
    this.isActive = true;
    this.isSpeakingPaused = false;
    try {
      this.recognition.start();
    } catch (e) {
      // Si ya estaba activo, no fallar
    }
  }

  stop() {
    if (!this.recognition) return;
    this.manualStop = true;
    this.isActive = false;
    this.isSpeakingPaused = false;
    try {
      this.recognition.stop();
    } catch (e) {}
    this.updateStatusUI("muted", "Asistente Silenciado");
    accessibilityManager.playEarcon("cancel");
    accessibilityManager.announcePolite("Asistente por voz desactivado");
  }

  toggle() {
    if (this.isActive) {
      this.stop();
      speechSynthesisManager.stop();
    } else {
      this.start();
      speechSynthesisManager.speak("Asistente por voz activado.", false);
    }
    this.updateAssistantButtonUI();
  }

  setCurrentView(viewName) {
    this.currentView = viewName;
  }

  onCommand(callback) {
    this.commandListeners.push(callback);
  }

  dispatchCommand(action, payload = null) {
    accessibilityManager.playEarcon("success");
    this.commandListeners.forEach(cb => cb({ action, payload, view: this.currentView }));
  }

  /**
   * Diccionario de intenciones estructurado por vistas
   * @param {string} text - Frase transcrita en minúsculas
   */
  processIntent(text) {
    const cleanText = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();

    // 1. Comandos Globales (Disponibles en cualquier pantalla)
    if (cleanText.includes("silenciar voz") || cleanText.includes("apagar voz") || cleanText.includes("desactivar voz") || cleanText.includes("mutear")) {
      speechSynthesisManager.stop();
      this.stop();
      this.updateAssistantButtonUI();
      speechSynthesisManager.speak("Voz silenciada.", true);
      return;
    }

    if (cleanText.includes("activar voz") || cleanText.includes("encender voz")) {
      speechSynthesisManager.isEnabled = true;
      speechSynthesisManager.speak("Voz del sistema reactivada.", true);
      return;
    }

    // Comandos Globales Prioritarios (Asistencia Auditiva y de Orientación)
    if (
      cleanText === "probar" ||
      cleanText.includes("probar audio") ||
      cleanText.includes("probar sonido") ||
      cleanText.includes("prueba de sonido") ||
      cleanText.includes("probar voz")
    ) {
      accessibilityManager.executeSoundTest();
      return;
    }

    if (
      cleanText.includes("leer comandos") ||
      cleanText.includes("qué puedo decir") ||
      cleanText.includes("que puedo decir") ||
      cleanText.includes("cuáles son los comandos") ||
      cleanText.includes("cuales son los comandos") ||
      cleanText.includes("lista de comandos")
    ) {
      this.leerComandosPantalla();
      return;
    }

    if (
      cleanText.includes("dónde estoy") ||
      cleanText.includes("donde estoy") ||
      cleanText.includes("en qué pantalla estoy") ||
      cleanText.includes("ubicación")
    ) {
      this.narrarDondeEstoy();
      return;
    }

    if (
      cleanText.includes("qué hace este botón") ||
      cleanText.includes("que hace este boton") ||
      cleanText.includes("explicar botón") ||
      cleanText.includes("explicar boton") ||
      cleanText.includes("qué hace el botón") ||
      cleanText.includes("que hace el boton") ||
      cleanText.includes("describir botón")
    ) {
      this.explicarElementoEnfocado();
      return;
    }

    if (cleanText.includes("ayuda") || cleanText.includes("comandos")) {
      this.dispatchCommand("AYUDA");
      return;
    }

    if (cleanText.includes("alto contraste") || cleanText.includes("cambiar contraste")) {
      accessibilityManager.toggleHighContrast();
      return;
    }

    if (cleanText.includes("aumentar texto") || cleanText.includes("letra grande") || cleanText.includes("texto más grande")) {
      accessibilityManager.changeFontScale(1);
      return;
    }

    if (cleanText.includes("disminuir texto") || cleanText.includes("letra normal") || cleanText.includes("texto normal")) {
      accessibilityManager.changeFontScale(-1);
      return;
    }

    // 2. Comandos en Pantalla 1: Login
    if (this.currentView === "login") {
      // Navegación de foco por voz (Accesibilidad motriz)
      if (cleanText.includes("ir a código") || cleanText.includes("ir a codigo") || cleanText === "código" || cleanText === "codigo") {
        this.dispatchCommand("ENFOCAR_CODIGO");
        return;
      }
      if (cleanText.includes("ir a contraseña") || cleanText.includes("ir a clave") || cleanText === "contraseña" || cleanText === "clave") {
        this.dispatchCommand("ENFOCAR_PASSWORD");
        return;
      }

      // 1. Limpiar o borrar código
      if (cleanText.includes("borrar código") || cleanText.includes("limpiar código") || cleanText.includes("borrar codigo") || cleanText === "borrar" || cleanText === "limpiar") {
        this.dispatchCommand("BORRAR_CODIGO");
        return;
      }

      // 2. Confirmación o ingreso
      if (cleanText.includes("ingresar") || cleanText.includes("entrar") || cleanText.includes("iniciar sesión") || cleanText.includes("continuar") || cleanText.includes("confirmar código") || cleanText.includes("confirmar") || cleanText === "sí" || cleanText === "correcto") {
        this.dispatchCommand("INGRESAR");
        return;
      }

      // 3. Repetir código para re-confirmación
      if (cleanText.includes("repetir código") || cleanText.includes("repetir codigo") || cleanText.includes("qué código") || cleanText.includes("cual es mi codigo") || cleanText.includes("leer código")) {
        this.dispatchCommand("REPETIR_CODIGO");
        return;
      }

      // 4. Solicitar PIN
      if (cleanText.includes("sms") || cleanText.includes("llamada") || cleanText.includes("pin") || cleanText.includes("solicitar pin")) {
        this.dispatchCommand("SOLICITAR_PIN");
        return;
      }

      // 5. Dictado y unión inteligente de código de estudiante
      const codigoDetectado = this.parsearCodigoDictado(text);
      if (codigoDetectado) {
        this.dispatchCommand("DICTAR_CODIGO", codigoDetectado);
        return;
      }
    }

    // 3. Comandos en Pantalla 2: Selección y Matrícula de Asignaturas
    if (this.currentView === "matricula") {
      // Foco en perfil o encabezado
      if (cleanText.includes("ir a nombre") || cleanText.includes("nombre") || cleanText.includes("mi perfil")) {
        this.dispatchCommand("ENFOCAR_NOMBRE");
        return;
      }

      // 1. Consultar / Recordar qué curso era un número específico:
      const tieneTriggerConsulta = /(?:qué|que|cuál|cual|cómo|como|recordar|recuerda|recuérdame|información|informacion|info|detalles|detalle|de qué trata|de que trata)/i.test(cleanText);
      const mencionaCurso = /(?:curso|materia|asignatura|número|numero|era|es|había|habia|trata)/i.test(cleanText);
      if (tieneTriggerConsulta && mencionaCurso) {
        const item = this.extraerIdentificadorCurso(cleanText);
        if (item) {
          this.dispatchCommand("CONSULTAR_CURSO", item);
          return;
        }
      }

      // 2. Seleccionar / Agregar curso: "agrega 3", "agrega el curso 4", "agrega el 4", "selecciona 2", "inscribe el 3", "añade 4", etc.
      const tieneTriggerSeleccion = /(?:seleccionar|selecciona|seleccioname|agregar|agrega|agregame|añadir|añade|anadir|anade|inscribir|inscribe|inscribeme|poner|pon|marcar|marca|matricular|matricula)/i.test(cleanText);
      if (tieneTriggerSeleccion) {
        const item = this.extraerIdentificadorCurso(cleanText);
        if (item) {
          this.dispatchCommand("SELECCIONAR_CURSO", item);
          return;
        }
      }

      // 3. Quitar / Eliminar curso: "quita 3", "quita el 3", "elimina el curso 4", "borra el 1", "sacar 2", etc.
      const tieneTriggerQuitar = /(?:quitar|quita|quitame|eliminar|elimina|eliminame|remover|remueve|removerme|desmarcar|desmarca|borrar|borra|sacar|saca)/i.test(cleanText);
      if (tieneTriggerQuitar) {
        const item = this.extraerIdentificadorCurso(cleanText);
        if (item) {
          this.dispatchCommand("QUITAR_CURSO", item);
          return;
        }
      }

      // Filtrar turno: "filtrar turno mañana", "ver noche", "turno tarde", "todos"
      if (cleanText.includes("mañana")) {
        this.dispatchCommand("FILTRAR_TURNO", "mañana");
        return;
      }
      if (cleanText.includes("tarde")) {
        this.dispatchCommand("FILTRAR_TURNO", "tarde");
        return;
      }
      if (cleanText.includes("noche")) {
        this.dispatchCommand("FILTRAR_TURNO", "noche");
        return;
      }
      if (cleanText.includes("todos") || cleanText.includes("mostrar todos") || cleanText.includes("quitar filtros")) {
        this.dispatchCommand("FILTRAR_TURNO", "todos");
        return;
      }

      // Consultar cursos disponibles
      if (cleanText.includes("ver cursos") || cleanText.includes("leer cursos") || cleanText.includes("qué cursos hay") || cleanText.includes("que cursos hay") || cleanText.includes("listar cursos") || cleanText.includes("leer pantalla") || cleanText.includes("qué hay en pantalla") || cleanText.includes("resumen")) {
        this.dispatchCommand("LEER_PANTALLA_MATRICULA");
        return;
      }

      // Consultar créditos disponibles y acumulados
      if (cleanText.includes("ver créditos") || cleanText.includes("ver creditos") || cleanText.includes("mis créditos") || cleanText.includes("mis creditos") || cleanText.includes("cuántos créditos") || cleanText.includes("cuantos creditos") || cleanText.includes("consultar créditos") || cleanText === "créditos" || cleanText === "creditos" || cleanText.includes("ir a créditos")) {
        this.dispatchCommand("VER_CREDITOS");
        return;
      }

      // Preguntar qué hacer u opciones disponibles
      if (cleanText.includes("qué puedo hacer") || cleanText.includes("que puedo hacer") || cleanText.includes("opciones") || cleanText.includes("qué hago") || cleanText.includes("que hago") || cleanText.includes("qué hacer")) {
        this.dispatchCommand("NARRAR_OPCIONES");
        return;
      }

      if (cleanText.includes("ver horario") || cleanText.includes("ir al horario") || cleanText.includes("abrir horario") || cleanText.includes("mostrar horario")) {
        this.dispatchCommand("VER_HORARIO");
        return;
      }

      if (cleanText.includes("confirmar matrícula") || cleanText.includes("guardar matrícula") || cleanText.includes("finalizar matrícula") || cleanText.includes("registrar matrícula") || cleanText.includes("matricular")) {
        this.dispatchCommand("CONFIRMAR_MATRICULA");
        return;
      }
    }

    // 4. Comandos en Pantalla 3: Horario Consolidado
    if (this.currentView === "horario") {
      if (cleanText.includes("narrar todo") || cleanText.includes("leer todo") || cleanText.includes("narrar horario") || cleanText.includes("leer horario") || cleanText.includes("reproducir")) {
        this.dispatchCommand("NARRAR_TODO");
        return;
      }

      if (cleanText.includes("pausar") || cleanText.includes("pausa") || cleanText.includes("detener")) {
        speechSynthesisManager.pause();
        return;
      }

      if (cleanText.includes("reanudar") || cleanText.includes("continuar")) {
        speechSynthesisManager.resume();
        return;
      }

      if (cleanText.includes("repetir") || cleanText.includes("otra vez")) {
        speechSynthesisManager.repeatLast();
        return;
      }

      // "qué me toca el [día]" o "qué tengo el [día]"
      const dias = ["lunes", "martes", "miércoles", "miercoles", "jueves", "viernes", "sábado", "sabado", "hoy"];
      for (const d of dias) {
        if (cleanText.includes(d)) {
          this.dispatchCommand("NARRAR_DIA", d);
          return;
        }
      }

      if (cleanText.includes("descargar horario") || cleanText.includes("descargar") || cleanText.includes("imprimir") || cleanText.includes("guardar horario") || cleanText.includes("pdf")) {
        this.dispatchCommand("DESCARGAR_HORARIO");
        return;
      }

      if (cleanText.includes("volver") || cleanText.includes("regresar") || cleanText.includes("selección") || cleanText.includes("cambiar cursos")) {
        this.dispatchCommand("VOLVER_MATRICULA");
        return;
      }
    }

    // Evitar bucles de ruido ambiental o frases insignificantes
    if (cleanText.length < 3) {
      return;
    }

    // Si el comando no se entendió claramente, feedback conciso
    accessibilityManager.playEarcon("error");
    speechSynthesisManager.speak("Comando no reconocido. Diga 'ayuda' para escuchar las opciones.", false);
  }

  /**
   * Parser inteligente para reconocer y concatenar números dictados por voz
   * Soporta dictados como: "u 2 2 2 2 0 5 25", "u dos dos dos dos cero cinco veinticinco", "u 20 21 12 34", etc.
   * @param {string} rawText
   */
  parsearCodigoDictado(rawText) {
    if (!rawText) return null;
    let s = rawText.toLowerCase().trim();

    // 1. Convertir palabras numéricas compuestas (ej. "treinta y dos" -> 32)
    const decenas = {
      "treinta": 30, "cuarenta": 40, "cincuenta": 50, "sesenta": 60,
      "setenta": 70, "ochenta": 80, "noventa": 90
    };
    const unidades = {
      "un": 1, "uno": 1, "una": 1, "dos": 2, "tres": 3, "cuatro": 4,
      "cinco": 5, "seis": 6, "siete": 7, "ocho": 8, "nueve": 9
    };

    for (const [decStr, decVal] of Object.entries(decenas)) {
      for (const [uniStr, uniVal] of Object.entries(unidades)) {
        const regexComp = new RegExp(`\\b${decStr}\\s+y\\s+${uniStr}\\b`, "gi");
        s = s.replace(regexComp, ` ${decVal + uniVal} `);
      }
    }

    // 2. Reemplazos de palabras numéricas individuales en español
    const palabrasNumeros = [
      { regex: /\b(cero)\b/gi, num: "0" },
      { regex: /\b(uno|una|un)\b/gi, num: "1" },
      { regex: /\b(dos)\b/gi, num: "2" },
      { regex: /\b(tres)\b/gi, num: "3" },
      { regex: /\b(cuatro)\b/gi, num: "4" },
      { regex: /\b(cinco)\b/gi, num: "5" },
      { regex: /\b(seis)\b/gi, num: "6" },
      { regex: /\b(siete)\b/gi, num: "7" },
      { regex: /\b(ocho)\b/gi, num: "8" },
      { regex: /\b(nueve)\b/gi, num: "9" },
      { regex: /\b(diez)\b/gi, num: "10" },
      { regex: /\b(once)\b/gi, num: "11" },
      { regex: /\b(doce)\b/gi, num: "12" },
      { regex: /\b(trece)\b/gi, num: "13" },
      { regex: /\b(catorce)\b/gi, num: "14" },
      { regex: /\b(quince)\b/gi, num: "15" },
      { regex: /\b(dieciséis|dieciseis)\b/gi, num: "16" },
      { regex: /\b(diecisiete)\b/gi, num: "17" },
      { regex: /\b(dieciocho)\b/gi, num: "18" },
      { regex: /\b(diecinueve)\b/gi, num: "19" },
      { regex: /\b(veinte)\b/gi, num: "20" },
      { regex: /\b(veintiuno|veintiún|veintiun)\b/gi, num: "21" },
      { regex: /\b(veintidós|veintidos)\b/gi, num: "22" },
      { regex: /\b(veintitrés|veintitres)\b/gi, num: "23" },
      { regex: /\b(veinticuatro)\b/gi, num: "24" },
      { regex: /\b(veinticinco)\b/gi, num: "25" },
      { regex: /\b(veintiséis|veintiseis)\b/gi, num: "26" },
      { regex: /\b(veintisiete)\b/gi, num: "27" },
      { regex: /\b(veintiocho)\b/gi, num: "28" },
      { regex: /\b(veintinueve)\b/gi, num: "29" },
      { regex: /\b(treinta)\b/gi, num: "30" },
      { regex: /\b(cuarenta)\b/gi, num: "40" },
      { regex: /\b(cincuenta)\b/gi, num: "50" },
      { regex: /\b(sesenta)\b/gi, num: "60" },
      { regex: /\b(setenta)\b/gi, num: "70" },
      { regex: /\b(ochenta)\b/gi, num: "80" },
      { regex: /\b(noventa)\b/gi, num: "90" },
      { regex: /\b(cien)\b/gi, num: "100" }
    ];

    palabrasNumeros.forEach(item => {
      s = s.replace(item.regex, ` ${item.num} `);
    });

    // 3. Detectar si el usuario incluyó 'u', 'ú', 'letra u', o si es un dictado directo
    const tienePrefijoU = /\b(?:u|ú|letra\s*u)\b/i.test(s) || /^(?:u|ú)/i.test(s.trim());
    const esComandoCodigo = /dictar|código|codigo|digitar|estudiante|alumno|mi\s*código/i.test(s);

    // 4. Extraer todos los números encontrados
    const coincidenciasDigitos = s.match(/\d+/g);
    if (!coincidenciasDigitos || coincidenciasDigitos.length === 0) return null;

    // Concatenar todos los números juntos en un solo string
    const numerosJuntos = coincidenciasDigitos.join("");

    // Un código universitario UTP suele tener 8 dígitos (ej. U20211234, U22220525) o al menos 3 dígitos al ser dictado
    if (numerosJuntos.length >= 3 || tienePrefijoU || esComandoCodigo) {
      return "U" + numerosJuntos;
    }

    return null;
  }

  /**
   * Extrae el número de curso del 1 al 6 o nombre de materia de cualquier frase hablada
   * Soporta: "4", "el curso 4", "cuatro", "arquitectura", "el 3", etc.
   * @param {string} str
   * @returns {number|string|null}
   */
  extraerIdentificadorCurso(str) {
    if (!str) return null;
    const clean = String(str).toLowerCase().trim();

    // 1. Si contiene un dígito explícito del 1 al 6
    const matchDigito = clean.match(/\b([1-6])\b/) || clean.match(/\d+/);
    if (matchDigito) {
      return parseInt(matchDigito[0], 10);
    }

    // 2. Mapeo de nombres o palabras numéricas
    const mapa = {
      "uno": 1, "primero": 1, "algoritmos": 1, "estructuras": 1,
      "dos": 2, "segundo": 2, "base de datos": 2, "bases": 2, "base": 2,
      "tres": 3, "tercero": 3, "redes": 3, "comunicaciones": 3,
      "cuatro": 4, "cuarto": 4, "arquitectura": 4, "software": 4,
      "cinco": 5, "quinto": 5, "interacción": 5, "interaccion": 5, "humano": 5, "ihm": 5,
      "seis": 6, "sexto": 6, "seguridad": 6, "información": 6, "informacion": 6
    };

    for (const [clave, num] of Object.entries(mapa)) {
      if (new RegExp(`\\b${clave}\\b`, "i").test(clean)) {
        return num;
      }
    }

    return clean;
  }

  normalizarNumeroCurso(val) {
    return this.extraerIdentificadorCurso(val);
  }

  updateStatusUI(state, text) {
    const indicator = document.getElementById("voice-pulse-indicator");
    const statusText = document.getElementById("voice-status-text");

    if (indicator) {
      indicator.className = `pulse-indicator ${state}`;
    }
    if (statusText) {
      statusText.textContent = text;
    }
  }

  updateLastCommandUI(transcript) {
    const pill = document.getElementById("last-command-pill");
    if (pill) {
      pill.innerHTML = `🗣️ Último: <strong>"${transcript}"</strong>`;
    }
  }

  updateAssistantButtonUI() {
    const btn = document.getElementById("btn-toggle-assistant");
    if (btn) {
      btn.setAttribute("aria-pressed", this.isActive ? "true" : "false");
      btn.innerHTML = this.isActive
        ? `🎙️ <span>Asistente: ACTIVO</span>`
        : `🛑 <span>Asistente: APAGADO</span>`;
    }
  }

  /**
   * Lee claramente la lista de comandos disponibles en la pantalla actual
   */
  leerComandosPantalla() {
    let msg = "";
    if (this.currentView === "login") {
      msg = "Comandos en Login: Diga 'dictar código' seguido de sus números, 'borrar código', 'repetir código', 'solicitar pin', 'probar sonido', 'dónde estoy', o 'ingresar'.";
    } else if (this.currentView === "matricula") {
      msg = "Comandos en Matrícula: Diga 'ver cursos', 'ver créditos', 'filtrar turno mañana, tarde o noche', 'seleccionar' o 'quitar' seguido del número de asignatura, 'probar sonido', o 'confirmar matrícula'.";
    } else if (this.currentView === "horario") {
      msg = "Comandos en Horario: Diga 'narrar todo', 'qué me toca el lunes', 'pausar', 'repetir', 'descargar horario', 'probar sonido', o 'volver a matrícula'.";
    } else {
      msg = "Comandos disponibles: Diga 'probar sonido', 'dónde estoy', 'alto contraste', 'aumentar texto', o 'silenciar voz'.";
    }

    this.pauseForSpeaking();
    speechSynthesisManager.speak(msg, true, () => {
      this.resumeAfterSpeaking();
    });
  }

  /**
   * Indica con precisión la ubicación, vista actual y el elemento actualmente enfocado
   */
  narrarDondeEstoy() {
    const nombresVistas = {
      login: "Pantalla de Inicio de Sesión y Acceso a Matrícula",
      matricula: "Catálogo de Selección y Matrícula de Asignaturas",
      horario: "Horario Oficial Consolidado"
    };

    const vistaActual = nombresVistas[this.currentView] || this.currentView;
    const activeEl = document.activeElement;
    let infoElemento = "";

    if (activeEl && activeEl !== document.body && activeEl !== document.documentElement) {
      const desc = accessibilityManager.describeElement(activeEl);
      if (desc && desc.nombre) {
        infoElemento = ` El elemento enfocado actualmente es: ${desc.rol} ${desc.nombre}.`;
      }
    }

    const msg = `Te encuentras en: ${vistaActual}.${infoElemento} Diga 'leer comandos' para escuchar las acciones posibles.`;
    this.pauseForSpeaking();
    speechSynthesisManager.speak(msg, true, () => {
      this.resumeAfterSpeaking();
    });
  }

  /**
   * Explica en detalle qué hace el botón o elemento interactivo actualmente enfocado
   */
  explicarElementoEnfocado() {
    const activeEl = document.activeElement;
    if (!activeEl || activeEl === document.body || activeEl === document.documentElement) {
      const msg = "Ningún botón o control interactivo tiene el foco actualmente. Use la tecla Tabulador para navegar entre elementos.";
      this.pauseForSpeaking();
      speechSynthesisManager.speak(msg, true, () => {
        this.resumeAfterSpeaking();
      });
      return;
    }

    // Caso específico para botones Probar
    if (activeEl.id === "btn-test-sound" || activeEl.classList.contains("btn-test-command") || activeEl.textContent.trim().toLowerCase() === "probar") {
      const msg = "Botón Probar: ejecuta una prueba del sintetizador de voz y verifica el volumen del sistema.";
      this.pauseForSpeaking();
      speechSynthesisManager.speak(msg, true, () => {
        this.resumeAfterSpeaking();
      });
      return;
    }

    const desc = accessibilityManager.describeElement(activeEl);
    let msg = "";
    if (desc) {
      msg = `${desc.rol} ${desc.nombre}. ${desc.descripcion || "Permite activar la acción correspondiente."}`;
    } else {
      msg = "Elemento interactivo seleccionado.";
    }

    this.pauseForSpeaking();
    speechSynthesisManager.speak(msg, true, () => {
      this.resumeAfterSpeaking();
    });
  }
}

export const speechRecognitionManager = new SpeechRecognitionManager();
