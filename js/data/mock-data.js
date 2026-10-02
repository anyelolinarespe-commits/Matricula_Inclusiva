/**
 * Datos del estudiante y catálogo de asignaturas para el Sistema de Matrícula Accesible UTP
 * Universidad Tecnológica del Perú - Periodo Académico 2026-II
 */

export const ESTUDIANTE = {
  codigo: "U20211234",
  nombre: "Carlos Alberto Mendoza Peña",
  carrera: "Ingeniería de Sistemas e Informática",
  facultad: "Facultad de Ingeniería",
  sede: "Lima Centro",
  periodo: "2026 - Ciclo II",
  creditosMaximos: 22,
  creditosMinimos: 12,
  telefonoContacto: "+51 987 654 321"
};

export const CURSOS_CATALOGO = [
  {
    id: 1,
    numero: 1,
    codigo: "SI-301",
    nombre: "Algoritmos y Estructuras de Datos",
    creditos: 4,
    seccion: "01-MAÑANA",
    turno: "mañana",
    docente: "Mg. Roberto Carlos Gutiérrez",
    aula: "Pabellón A - Laboratorio 302",
    modalidad: "Presencial",
    diasHorario: "Lunes y Miércoles 08:00 - 10:00",
    diasTextoVoz: "Lunes y Miércoles de ocho a diez de la mañana",
    bloques: [
      { dia: "Lunes", diaNum: 1, inicio: "08:00", fin: "10:00", inicioMin: 480, finMin: 600 },
      { dia: "Miércoles", diaNum: 3, inicio: "08:00", fin: "10:00", inicioMin: 480, finMin: 600 }
    ],
    descripcion: "Estructuras no lineales, árboles balanceados, grafos y algoritmos de optimización."
  },
  {
    id: 2,
    numero: 2,
    codigo: "SI-305",
    nombre: "Base de Datos Avanzada",
    creditos: 3,
    seccion: "02-MAÑANA",
    turno: "mañana",
    docente: "Dra. Patricia Elena Morales",
    aula: "Pabellón B - Aula 405",
    modalidad: "Presencial",
    diasHorario: "Martes y Jueves 10:15 - 12:45",
    diasTextoVoz: "Martes y Jueves de diez y quince a doce y cuarenta y cinco de la mañana",
    bloques: [
      { dia: "Martes", diaNum: 2, inicio: "10:15", fin: "12:45", inicioMin: 615, finMin: 765 },
      { dia: "Jueves", diaNum: 4, inicio: "10:15", fin: "12:45", inicioMin: 615, finMin: 765 }
    ],
    descripcion: "Bases de datos NoSQL, procesamiento transaccional distribuido, optimización de queries y Big Data."
  },
  {
    id: 3,
    numero: 3,
    codigo: "SI-402",
    nombre: "Redes y Comunicaciones I",
    creditos: 4,
    seccion: "03-NOCHE",
    turno: "noche",
    docente: "Ing. Jorge Luis Valenzuela",
    aula: "Pabellón C - Laboratorio Cisco 201",
    modalidad: "Presencial",
    diasHorario: "Viernes 18:30 - 21:30",
    diasTextoVoz: "Viernes de seis y media a nueve y media de la noche",
    bloques: [
      { dia: "Viernes", diaNum: 5, inicio: "18:30", fin: "21:30", inicioMin: 1110, finMin: 1290 }
    ],
    descripcion: "Modelos OSI y TCP/IP, enrutamiento IPv4 e IPv6, switching y protocolos de capa de red."
  },
  {
    id: 4,
    numero: 4,
    codigo: "SI-404",
    nombre: "Arquitectura de Software",
    creditos: 4,
    seccion: "04-NOCHE",
    turno: "noche",
    docente: "Mg. Fernando Ruiz Aguilar",
    aula: "Pabellón B - Aula 301",
    modalidad: "Semipresencial",
    diasHorario: "Martes y Jueves 19:00 - 21:00",
    diasTextoVoz: "Martes y Jueves de siete a nueve de la noche",
    bloques: [
      { dia: "Martes", diaNum: 2, inicio: "19:00", fin: "21:00", inicioMin: 1140, finMin: 1260 },
      { dia: "Jueves", diaNum: 4, inicio: "19:00", fin: "21:00", inicioMin: 1140, finMin: 1260 }
    ],
    descripcion: "Patrones arquitectónicos de microservicios, Event-Driven, Clean Architecture y DDD."
  },
  {
    id: 5,
    numero: 5,
    codigo: "SI-408",
    nombre: "Interacción Hombre-Máquina",
    creditos: 3,
    seccion: "01-MAÑANA",
    turno: "mañana",
    docente: "Dra. Lucía Del Carmen Soto",
    aula: "Pabellón A - Laboratorio UX 104",
    modalidad: "Presencial",
    diasHorario: "Sábado 09:00 - 13:00",
    diasTextoVoz: "Sábado de nueve de la mañana a una de la tarde",
    bloques: [
      { dia: "Sábado", diaNum: 6, inicio: "09:00", fin: "13:00", inicioMin: 540, finMin: 780 }
    ],
    descripcion: "Accesibilidad universal WCAG 2.1 AAA, diseño centrado en el usuario, interfaces de voz y usabilidad."
  },
  {
    id: 6,
    numero: 6,
    codigo: "SI-410",
    nombre: "Seguridad de la Información",
    creditos: 4,
    seccion: "02-TARDE",
    turno: "tarde",
    docente: "Ing. Manuel Ramos Prieto",
    aula: "Pabellón C - Aula 502",
    modalidad: "Presencial",
    diasHorario: "Miércoles y Viernes 14:00 - 16:30",
    diasTextoVoz: "Miércoles y Viernes de dos a cuatro y media de la tarde",
    bloques: [
      { dia: "Miércoles", diaNum: 3, inicio: "14:00", fin: "16:30", inicioMin: 840, finMin: 990 },
      { dia: "Viernes", diaNum: 5, inicio: "14:00", fin: "16:30", inicioMin: 840, finMin: 990 }
    ],
    descripcion: "Criptografía aplicada, seguridad perimetral, gestión de vulnerabilidades y normas ISO 27001."
  }
];

/**
 * Función para verificar cruces de horario entre un curso propuesto y la lista de cursos ya matriculados
 */
export function detectarCruceHorario(cursoNuevo, cursosMatriculados) {
  for (const cursoExistente of cursosMatriculados) {
    if (cursoExistente.id === cursoNuevo.id) continue;

    for (const bNuevo of cursoNuevo.bloques) {
      for (const bExistente of cursoExistente.bloques) {
        if (bNuevo.dia === bExistente.dia) {
          const haySolapamiento = (bNuevo.inicioMin < bExistente.finMin) && (bNuevo.finMin > bExistente.inicioMin);
          if (haySolapamiento) {
            return {
              hayCruce: true,
              cursoExistente: cursoExistente,
              dia: bNuevo.dia,
              horario1: `${bNuevo.inicio} - ${bNuevo.fin}`,
              horario2: `${bExistente.inicio} - ${bExistente.fin}`
            };
          }
        }
      }
    }
  }
  return { hayCruce: false };
}
