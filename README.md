# Sistema de Matrícula Accesible UTP (Versión V-01)
## Universidad Tecnológica del Perú • Conformidad WCAG 2.1 Nivel AAA

Prototipo funcional integral de matrícula universitaria diseñado y optimizado para **estudiantes con discapacidad visual** (baja visión, ceguera) y **limitaciones motoras severas o moderadas**, permitiendo una experiencia de interacción autónoma, controlada por voz hands-free y 100% navegable por teclado.

---

## 🚀 Cómo Ejecutar el Prototipo

El proyecto está construido con **HTML5 Semántico, CSS3 con tokens de alto contraste y JavaScript ES6 Modular**, por lo que **no requiere compilación previa**.

### Opción 1: Servidor Local Rápido (Recomendada para Speech APIs)
Debido a que las APIs de reconocimiento de voz del navegador (`SpeechRecognition`) requieren un origen seguro (`localhost` o `https`), ejecute desde esta carpeta:

```bash
npm start
# O alternativamente:
npx serve -l 3000 .
```
Luego abra su navegador (Google Chrome, Microsoft Edge o Safari) en:
👉 `http://localhost:3000`

### Opción 2: Abrir directamente el archivo
Puede abrir `index.html` en cualquier navegador web. *(Nota: Chrome puede limitar el reconocimiento continuo de micrófono en protocolo `file://` debido a políticas de seguridad; use la Opción 1 para la experiencia completa con micrófono).*

---

## 🎙️ Diccionario de Comandos por Voz (Hands-Free)

El sistema cuenta con un **gestor de reconocimiento de voz activo por defecto** con push-to-talk rápido mediante la **Barra Espaciadora** o escucha continua:

### 1. Pantalla 1: Login Accesible
| Comando Verbal | Acción Ejecutada |
| :--- | :--- |
| `"dictar código [código]"` o `"mi código es [U20211234]"` | Escribe automáticamente el código de estudiante |
| `"borrar código"` o `"limpiar código"` | Vacía la casilla de código |
| `"ingresar"` o `"iniciar sesión"` | Valida credenciales e ingresa al catálogo |
| `"solicitar pin"` o `"sms"` | Envía un PIN de acceso rápido por llamada/SMS accesible |
| `"silenciar voz"` | Desactiva el asistente de voz |
| `"ayuda"` | Narra la lista de comandos disponibles en esta vista |

### 2. Pantalla 2: Selección y Matrícula de Asignaturas
| Comando Verbal | Acción Ejecutada |
| :--- | :--- |
| `"seleccionar [1 a 6]"` o `"seleccionar [nombre]"` | Agrega el curso indicado al horario (ej. `"seleccionar 1"`) |
| `"quitar [1 a 6]"` o `"quitar [nombre]"` | Remueve el curso del horario (ej. `"quitar 1"`) |
| `"filtrar turno mañana"` / `"tarde"` / `"noche"` / `"todos"` | Filtra el catálogo por turno horario |
| `"leer pantalla"` o `"leer cursos"` | Narra el balance de créditos y lista de cursos disponibles |
| `"ver horario"` o `"ir al horario"` | Abre la vista del Horario Consolidado |
| `"confirmar matrícula"` | Inscribe oficialmente los cursos y genera el horario |
| `"ayuda"` | Narra las instrucciones de la pantalla |

### 3. Pantalla 3: Horario Consolidado y Narración Asistida
| Comando Verbal | Acción Ejecutada |
| :--- | :--- |
| `"narrar todo"` o `"leer todo"` | Sintetiza en lenguaje natural el horario completo día por día |
| `"qué me toca el [lunes, martes, etc.]"` | Narra exclusivamente las clases del día solicitado |
| `"qué me toca hoy"` | Narra las clases del día actual |
| `"pausar"` / `"detener"` | Pausa la lectura de voz del sistema |
| `"reanudar"` / `"continuar"` | Continúa la lectura pausada |
| `"repetir"` | Vuelve a narrar la última explicación |
| `"descargar horario"` o `"guardar horario"` | Abre el cuadro accesible de impresión / descarga en PDF |
| `"volver"` o `"volver a selección"` | Regresa a la pantalla de catálogo de materias |

---

## ⌨️ Atajos de Teclado Globales (Accesibilidad Motriz)

| Tecla / Atajo | Función |
| :--- | :--- |
| <kbd>Barra Espaciadora</kbd> | Push-to-Talk: Activar / Pausar escucha del micrófono |
| <kbd>Enter</kbd> | Confirmar / Ingresar a la siguiente pantalla |
| <kbd>Alt + P</kbd> | Pausar / Reanudar la narración de voz (TTS) |
| <kbd>Alt + R</kbd> | Repetir narración del horario |
| <kbd>Alt + H</kbd> | Narrar únicamente las clases de hoy |
| <kbd>Alt + M</kbd> | Alternar micrófono del Asistente |
| <kbd>Alt + C</kbd> | Alternar Modo Alto Contraste (Amarillo sobre Negro) |
| <kbd>Alt + A</kbd> | Escuchar ayuda auditiva global de comandos |
| <kbd>Alt + 1</kbd> | Tamaño de texto Normal (100%) |
| <kbd>Alt + 2</kbd> | Tamaño de texto Grande (125%) |
| <kbd>Alt + 3</kbd> | Tamaño de texto Extra Grande (150%) |
| <kbd>Alt + S</kbd> | Salto directo al contenido principal (Skip-link) |

---

## ♿ Características Técnicas WCAG 2.1 AAA Implementadas

1. **Contraste de Color Superior**:
   - Rojo institucional UTP calibrado (`#A60C25`) que supera un ratio de **7.2:1** sobre blanco.
   - Textos oscuros (`#121212`) con ratio de **16:1** sobre fondo `#F8F9FA`.
   - **Modo Alto Contraste dedicado**: Fondo `#000000`, textos `#FFFFFF` y elementos de acento en Amarillo Neón `#FFFF00` con bordes nítidos.
2. **Focus Rings Forzados de 3px a 4px**:
   - `outline: 3px solid var(--focus-ring-color); outline-offset: 3px;` forzado para cualquier elemento interactivo bajo navegación con `Tab`.
3. **Escalador Dinámico de Fuentes**:
   - Selectores `A- / Normal / A+` recalculan la interfaz con `--font-scale` sin romper los contenedores ni provocar scrolls horizontales destructivos.
4. **Zonas de Clic y Destinos Táctiles Amplios (Fitts's Law)**:
   - Todos los botones y entradas cuentan con una altura mínima de **48px a 56px**.
5. **Regiones en Vivo ARIA Duales**:
   - `aria-live="assertive"` para emergencias, cruces de horarios y alertas críticas.
   - `aria-live="polite"` para confirmaciones y lectura de estado de voz.
6. **Señales Auditivas Sintetizadas (Earcons)**:
   - Uso de `Web Audio API` nativo para reproducir tonos armónicos de inicio de escucha, éxito, advertencia de cruce y cancelación.
7. **Prevención Activa de Cruces de Horario**:
   - Validación automática al vuelo de solapamiento de minutos y días con aviso descriptivo inmediato por voz y pantalla.
