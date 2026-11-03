/**
 * Datos de estudiantes y catálogos de asignaturas por carreras UTP
 * Universidad Tecnológica del Perú - Periodo Académico 2026-II
 * WCAG 2.1 AAA
 */

export const USUARIOS_REGISTRADOS = [
  {
    codigo: "U22220525",
    nombre: "Linares Carmen, Anyelo Gianbranco",
    password: "123456",
    carrera: "Ingeniería de Sistemas e Informática",
    facultad: "Facultad de Ingeniería",
    sede: "Lima Centro",
    periodo: "2026 - Ciclo II",
    creditosMaximos: 22,
    creditosMinimos: 12,
    telefonoContacto: "+51 987 654 321"
  },
  {
    codigo: "U22212626",
    nombre: "Tuñoque Paredes, Jhoselyn",
    password: "123456",
    carrera: "Ingeniería de Sistemas e Informática",
    facultad: "Facultad de Ingeniería",
    sede: "Lima Centro",
    periodo: "2026 - Ciclo II",
    creditosMaximos: 22,
    creditosMinimos: 12,
    telefonoContacto: "+51 912 345 678"
  },
  {
    codigo: "U22301452",
    nombre: "Ramírez Salazar, Mateo Sebastián",
    password: "123456",
    carrera: "Ingeniería Industrial",
    facultad: "Facultad de Ingeniería",
    sede: "Lima Centro",
    periodo: "2026 - Ciclo II",
    creditosMaximos: 22,
    creditosMinimos: 12,
    telefonoContacto: "+51 976 543 210"
  },
  {
    codigo: "U22108743",
    nombre: "Quispe Mendoza, Valeria Sofía",
    password: "123456",
    carrera: "Administración y Marketing",
    facultad: "Facultad de Administración y Negocios",
    sede: "Lima Norte",
    periodo: "2026 - Ciclo II",
    creditosMaximos: 22,
    creditosMinimos: 12,
    telefonoContacto: "+51 965 432 109"
  },
  {
    codigo: "U22319024",
    nombre: "Flores Castillo, Diego Alonso",
    password: "123456",
    carrera: "Derecho",
    facultad: "Facultad de Derecho",
    sede: "San Juan de Lurigancho",
    periodo: "2026 - Ciclo II",
    creditosMaximos: 22,
    creditosMinimos: 12,
    telefonoContacto: "+51 954 321 098"
  },
  {
    codigo: "U20211234",
    nombre: "Carlos Alberto Mendoza Peña",
    password: "123456",
    carrera: "Ingeniería de Sistemas e Informática",
    facultad: "Facultad de Ingeniería",
    sede: "Lima Centro",
    periodo: "2026 - Ciclo II",
    creditosMaximos: 22,
    creditosMinimos: 12,
    telefonoContacto: "+51 987 654 321"
  }
];

export const ESTUDIANTE = { ...USUARIOS_REGISTRADOS[0] };

/**
 * Mallas curriculares oficiales UTP organizadas por carrera
 */
export const MALLAS_UTP = {
  "Ingeniería de Sistemas e Informática": [
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
  ],

  "Ingeniería Industrial": [
    {
      id: 1,
      numero: 1,
      codigo: "IND-501",
      nombre: "Investigación de Operaciones",
      creditos: 4,
      seccion: "01-MAÑANA",
      turno: "mañana",
      docente: "Ing. Ricardo Sánchez Vega",
      aula: "Pabellón B - Lab. Procesos 204",
      modalidad: "Presencial",
      diasHorario: "Lunes y Miércoles 08:00 - 10:00",
      diasTextoVoz: "Lunes y Miércoles de ocho a diez de la mañana",
      bloques: [
        { dia: "Lunes", diaNum: 1, inicio: "08:00", fin: "10:00", inicioMin: 480, finMin: 600 },
        { dia: "Miércoles", diaNum: 3, inicio: "08:00", fin: "10:00", inicioMin: 480, finMin: 600 }
      ],
      descripcion: "Programación lineal, método simplex, teoría de colas, simulación estocástica y toma de decisiones."
    },
    {
      id: 2,
      numero: 2,
      codigo: "IND-502",
      nombre: "Gestión y Control de Calidad",
      creditos: 3,
      seccion: "02-MAÑANA",
      turno: "mañana",
      docente: "Mg. Carmen Rosa Alarcón",
      aula: "Pabellón A - Aula 305",
      modalidad: "Presencial",
      diasHorario: "Martes y Jueves 10:15 - 12:45",
      diasTextoVoz: "Martes y Jueves de diez y quince a doce y cuarenta y cinco de la mañana",
      bloques: [
        { dia: "Martes", diaNum: 2, inicio: "10:15", fin: "12:45", inicioMin: 615, finMin: 765 },
        { dia: "Jueves", diaNum: 4, inicio: "10:15", fin: "12:45", inicioMin: 615, finMin: 765 }
      ],
      descripcion: "Metodologías Six Sigma, control estadístico de procesos (CEP), normas ISO 9001 y mejora continua."
    },
    {
      id: 3,
      numero: 3,
      codigo: "IND-601",
      nombre: "Procesos Industriales y Manufactura",
      creditos: 4,
      seccion: "03-NOCHE",
      turno: "noche",
      docente: "Ing. Víctor Hugo Salazar",
      aula: "Pabellón C - Planta Piloto 101",
      modalidad: "Presencial",
      diasHorario: "Viernes 18:30 - 21:30",
      diasTextoVoz: "Viernes de seis y media a nueve y media de la noche",
      bloques: [
        { dia: "Viernes", diaNum: 5, inicio: "18:30", fin: "21:30", inicioMin: 1110, finMin: 1290 }
      ],
      descripcion: "Transformación de materiales, procesos térmicos, automatización industrial y manufactura esbelta."
    },
    {
      id: 4,
      numero: 4,
      codigo: "IND-603",
      nombre: "Seguridad y Salud Ocupacional",
      creditos: 4,
      seccion: "04-NOCHE",
      turno: "noche",
      docente: "Dra. Mónica Del Pilar Paredes",
      aula: "Pabellón B - Aula 402",
      modalidad: "Semipresencial",
      diasHorario: "Martes y Jueves 19:00 - 21:00",
      diasTextoVoz: "Martes y Jueves de siete a nueve de la noche",
      bloques: [
        { dia: "Martes", diaNum: 2, inicio: "19:00", fin: "21:00", inicioMin: 1140, finMin: 1260 },
        { dia: "Jueves", diaNum: 4, inicio: "19:00", fin: "21:00", inicioMin: 1140, finMin: 1260 }
      ],
      descripcion: "Matriz IPERC, normas OHSAS 18001/ISO 45001, ergonomía laboral y prevención de riesgos ocupacionales."
    },
    {
      id: 5,
      numero: 5,
      codigo: "IND-605",
      nombre: "Ergonomía y Métodos de Trabajo",
      creditos: 3,
      seccion: "01-MAÑANA",
      turno: "mañana",
      docente: "Mg. Carlos Enrique Benavides",
      aula: "Pabellón A - Lab. Ergonomía 102",
      modalidad: "Presencial",
      diasHorario: "Sábado 09:00 - 13:00",
      diasTextoVoz: "Sábado de nueve de la mañana a una de la tarde",
      bloques: [
        { dia: "Sábado", diaNum: 6, inicio: "09:00", fin: "13:00", inicioMin: 540, finMin: 780 }
      ],
      descripcion: "Estudio del trabajo, cronometraje, balance de líneas, diseño ergonómico de puestos de trabajo."
    },
    {
      id: 6,
      numero: 6,
      codigo: "IND-702",
      nombre: "Logística y Cadena de Suministros",
      creditos: 4,
      seccion: "02-TARDE",
      turno: "tarde",
      docente: "Ing. Andrés Fernando Gómez",
      aula: "Pabellón C - Aula 501",
      modalidad: "Presencial",
      diasHorario: "Miércoles y Viernes 14:00 - 16:30",
      diasTextoVoz: "Miércoles y Viernes de dos a cuatro y media de la tarde",
      bloques: [
        { dia: "Miércoles", diaNum: 3, inicio: "14:00", fin: "16:30", inicioMin: 840, finMin: 990 },
        { dia: "Viernes", diaNum: 5, inicio: "14:00", fin: "16:30", inicioMin: 840, finMin: 990 }
      ],
      descripcion: "Gestión de compras, almacenamiento y distribución (SCM), gestión de inventarios y logística 4.0."
    }
  ],

  "Administración y Marketing": [
    {
      id: 1,
      numero: 1,
      codigo: "MKT-301",
      nombre: "Comportamiento del Consumidor",
      creditos: 4,
      seccion: "01-MAÑANA",
      turno: "mañana",
      docente: "Lic. Mariana Belén Cárdenas",
      aula: "Pabellón A - Aula 201",
      modalidad: "Presencial",
      diasHorario: "Lunes y Miércoles 08:00 - 10:00",
      diasTextoVoz: "Lunes y Miércoles de ocho a diez de la mañana",
      bloques: [
        { dia: "Lunes", diaNum: 1, inicio: "08:00", fin: "10:00", inicioMin: 480, finMin: 600 },
        { dia: "Miércoles", diaNum: 3, inicio: "08:00", fin: "10:00", inicioMin: 480, finMin: 600 }
      ],
      descripcion: "Psicología del consumidor, procesos de decisión de compra, factores socioculturales y neuromarketing."
    },
    {
      id: 2,
      numero: 2,
      codigo: "MKT-402",
      nombre: "Investigación de Mercados",
      creditos: 3,
      seccion: "02-MAÑANA",
      turno: "mañana",
      docente: "Mg. Gonzalo Javier Quiroz",
      aula: "Pabellón B - Lab. Cómputo 301",
      modalidad: "Presencial",
      diasHorario: "Martes y Jueves 10:15 - 12:45",
      diasTextoVoz: "Martes y Jueves de diez y quince a doce y cuarenta y cinco de la mañana",
      bloques: [
        { dia: "Martes", diaNum: 2, inicio: "10:15", fin: "12:45", inicioMin: 615, finMin: 765 },
        { dia: "Jueves", diaNum: 4, inicio: "10:15", fin: "12:45", inicioMin: 615, finMin: 765 }
      ],
      descripcion: "Diseño muestral, técnicas cuantitativas y cualitativas, análisis estadístico multivariado y SPSS."
    },
    {
      id: 3,
      numero: 3,
      codigo: "MKT-501",
      nombre: "Marketing Estratégico y Digital",
      creditos: 4,
      seccion: "03-NOCHE",
      turno: "noche",
      docente: "Dra. Rocío Elizabeth Morales",
      aula: "Pabellón C - Aula 404",
      modalidad: "Presencial",
      diasHorario: "Viernes 18:30 - 21:30",
      diasTextoVoz: "Viernes de seis y media a nueve y media de la noche",
      bloques: [
        { dia: "Viernes", diaNum: 5, inicio: "18:30", fin: "21:30", inicioMin: 1110, finMin: 1290 }
      ],
      descripcion: "Posicionamiento de mercado, análisis de la competencia, embudos de conversión y estrategias SEO/SEM."
    },
    {
      id: 4,
      numero: 4,
      codigo: "MKT-503",
      nombre: "Gestión de Marcas y Branding",
      creditos: 4,
      seccion: "04-NOCHE",
      turno: "noche",
      docente: "Lic. Renzo Paolo Carranza",
      aula: "Pabellón B - Lab. Digital 202",
      modalidad: "Semipresencial",
      diasHorario: "Martes y Jueves 19:00 - 21:00",
      diasTextoVoz: "Martes y Jueves de siete a nueve de la noche",
      bloques: [
        { dia: "Martes", diaNum: 2, inicio: "19:00", fin: "21:00", inicioMin: 1140, finMin: 1260 },
        { dia: "Jueves", diaNum: 4, inicio: "19:00", fin: "21:00", inicioMin: 1140, finMin: 1260 }
      ],
      descripcion: "Brand equity, arquitectura de marca, identidad corporativa y estrategias de fidelización emocional."
    },
    {
      id: 5,
      numero: 5,
      codigo: "MKT-602",
      nombre: "Comercio Electrónico y Omnicanalidad",
      creditos: 3,
      seccion: "01-MAÑANA",
      turno: "mañana",
      docente: "Mg. Claudia Patricia Vargas",
      aula: "Pabellón A - Aula Magna 101",
      modalidad: "Presencial",
      diasHorario: "Sábado 09:00 - 13:00",
      diasTextoVoz: "Sábado de nueve de la mañana a una de la tarde",
      bloques: [
        { dia: "Sábado", diaNum: 6, inicio: "09:00", fin: "13:00", inicioMin: 540, finMin: 780 }
      ],
      descripcion: "Modelos B2B/B2C, pasarelas de pago, experiencia omnicanal y analítica web en plataformas digitales."
    },
    {
      id: 6,
      numero: 6,
      codigo: "MKT-605",
      nombre: "Comunicación Integrada de Marketing",
      creditos: 4,
      seccion: "02-TARDE",
      turno: "tarde",
      docente: "Ing. Daniel Antonio Barreto",
      aula: "Pabellón C - Aula 302",
      modalidad: "Presencial",
      diasHorario: "Miércoles y Viernes 14:00 - 16:30",
      diasTextoVoz: "Miércoles y Viernes de dos a cuatro y media de la tarde",
      bloques: [
        { dia: "Miércoles", diaNum: 3, inicio: "14:00", fin: "16:30", inicioMin: 840, finMin: 990 },
        { dia: "Viernes", diaNum: 5, inicio: "14:00", fin: "16:30", inicioMin: 840, finMin: 990 }
      ],
      descripcion: "Campañas 360°, relaciones públicas, marketing de contenidos y métricas de impacto publicitario."
    }
  ],

  "Derecho": [
    {
      id: 1,
      numero: 1,
      codigo: "DER-401",
      nombre: "Derecho Procesal Penal y Litigación Oral",
      creditos: 4,
      seccion: "01-MAÑANA",
      turno: "mañana",
      docente: "Dr. Alejandro Martín Montenegro",
      aula: "Pabellón D - Sala de Audiencias 1",
      modalidad: "Presencial",
      diasHorario: "Lunes y Miércoles 08:00 - 10:00",
      diasTextoVoz: "Lunes y Miércoles de ocho a diez de la mañana",
      bloques: [
        { dia: "Lunes", diaNum: 1, inicio: "08:00", fin: "10:00", inicioMin: 480, finMin: 600 },
        { dia: "Miércoles", diaNum: 3, inicio: "08:00", fin: "10:00", inicioMin: 480, finMin: 600 }
      ],
      descripcion: "Código Procesal Penal, etapas de investigación y juzgamiento, técnicas de litigación oral y alegatos."
    },
    {
      id: 2,
      numero: 2,
      codigo: "DER-403",
      nombre: "Derecho Civil V: Obligaciones",
      creditos: 3,
      seccion: "02-MAÑANA",
      turno: "mañana",
      docente: "Dra. Sandra Milagros Farfán",
      aula: "Pabellón D - Aula 204",
      modalidad: "Presencial",
      diasHorario: "Martes y Jueves 10:15 - 12:45",
      diasTextoVoz: "Martes y Jueves de diez y quince a doce y cuarenta y cinco de la mañana",
      bloques: [
        { dia: "Martes", diaNum: 2, inicio: "10:15", fin: "12:45", inicioMin: 615, finMin: 765 },
        { dia: "Jueves", diaNum: 4, inicio: "10:15", fin: "12:45", inicioMin: 615, finMin: 765 }
      ],
      descripcion: "Teoría de las obligaciones, modalidades, efectos jurídicos, inejecución y responsabilidad contractual."
    },
    {
      id: 3,
      numero: 3,
      codigo: "DER-502",
      nombre: "Derecho Laboral y Relaciones Colectivas",
      creditos: 4,
      seccion: "03-NOCHE",
      turno: "noche",
      docente: "Mg. César Augusto Villanueva",
      aula: "Pabellón C - Aula 303",
      modalidad: "Presencial",
      diasHorario: "Viernes 18:30 - 21:30",
      diasTextoVoz: "Viernes de seis y media a nueve y media de la noche",
      bloques: [
        { dia: "Viernes", diaNum: 5, inicio: "18:30", fin: "21:30", inicioMin: 1110, finMin: 1290 }
      ],
      descripcion: "Contratos de trabajo, derechos individuales y colectivos, negociación colectiva y huelga."
    },
    {
      id: 4,
      numero: 4,
      codigo: "DER-504",
      nombre: "Derecho Constitucional y Amparo",
      creditos: 4,
      seccion: "04-NOCHE",
      turno: "noche",
      docente: "Dr. Guillermo Prado Valdivia",
      aula: "Pabellón D - Aula 301",
      modalidad: "Semipresencial",
      diasHorario: "Martes y Jueves 19:00 - 21:00",
      diasTextoVoz: "Martes y Jueves de siete a nueve de la noche",
      bloques: [
        { dia: "Martes", diaNum: 2, inicio: "19:00", fin: "21:00", inicioMin: 1140, finMin: 1260 },
        { dia: "Jueves", diaNum: 4, inicio: "19:00", fin: "21:00", inicioMin: 1140, finMin: 1260 }
      ],
      descripcion: "Control constitucional, procesos de tutela de derechos fundamentales, hábeas corpus y proceso de amparo."
    },
    {
      id: 5,
      numero: 5,
      codigo: "DER-601",
      nombre: "Argumentación y Deontología Jurídica",
      creditos: 3,
      seccion: "01-MAÑANA",
      turno: "mañana",
      docente: "Dra. Carmen Rosa Vizcarra",
      aula: "Pabellón A - Aula 105",
      modalidad: "Presencial",
      diasHorario: "Sábado 09:00 - 13:00",
      diasTextoVoz: "Sábado de nueve de la mañana a una de la tarde",
      bloques: [
        { dia: "Sábado", diaNum: 6, inicio: "09:00", fin: "13:00", inicioMin: 540, finMin: 780 }
      ],
      descripcion: "Lógica jurídica, razonamiento judicial, ética del ejercicio profesional y código de ética de los colegios de abogados."
    },
    {
      id: 6,
      numero: 6,
      codigo: "DER-603",
      nombre: "Derecho Administrativo y Procedimientos",
      creditos: 4,
      seccion: "02-TARDE",
      turno: "tarde",
      docente: "Mg. Javier Oswaldo Benites",
      aula: "Pabellón D - Aula 402",
      modalidad: "Presencial",
      diasHorario: "Miércoles y Viernes 14:00 - 16:30",
      diasTextoVoz: "Miércoles y Viernes de dos a cuatro y media de la tarde",
      bloques: [
        { dia: "Miércoles", diaNum: 3, inicio: "14:00", fin: "16:30", inicioMin: 840, finMin: 990 },
        { dia: "Viernes", diaNum: 5, inicio: "14:00", fin: "16:30", inicioMin: 840, finMin: 990 }
      ],
      descripcion: "Ley del Procedimiento Administrativo General (LPAG), actos administrativos y proceso contencioso administrativo."
    }
  ]
};

export function obtenerCursosPorCarrera(carrera) {
  return MALLAS_UTP[carrera] || MALLAS_UTP["Ingeniería de Sistemas e Informática"];
}

// Catálogo mutable exportado para las vistas
export const CURSOS_CATALOGO = [...obtenerCursosPorCarrera(ESTUDIANTE.carrera)];

/**
 * Actualiza el catálogo activo según la carrera del estudiante
 * @param {object} estudiante
 * @returns {Array}
 */
export function actualizarCatalogoPorEstudiante(estudiante) {
  const cursos = obtenerCursosPorCarrera(estudiante ? estudiante.carrera : "");
  CURSOS_CATALOGO.length = 0;
  CURSOS_CATALOGO.push(...cursos);
  return CURSOS_CATALOGO;
}

/**
 * Valida las credenciales de ingreso (código y contraseña o PIN)
 * @param {string} codigo
 * @param {string} password
 * @returns {{ valido: boolean, usuario?: object, mensaje?: string }}
 */
export function autenticarUsuario(codigo, password) {
  const codLimpio = String(codigo || "").trim().toUpperCase();
  const passLimpio = String(password || "").trim();

  const usuario = USUARIOS_REGISTRADOS.find(u => u.codigo.toUpperCase() === codLimpio);

  if (!usuario) {
    return {
      valido: false,
      mensaje: `El código '${codigo}' no se encuentra registrado en el sistema institucional.`
    };
  }

  // Acepta la contraseña del usuario, 123456 o PIN accesible 8492
  if (passLimpio !== usuario.password && passLimpio !== "123456" && passLimpio !== "8492") {
    return {
      valido: false,
      mensaje: "Contraseña incorrecta. Verifique sus credenciales (123456) o solicite un PIN de acceso rápido."
    };
  }

  // Sincronizar catálogo a la carrera del usuario
  actualizarCatalogoPorEstudiante(usuario);

  return {
    valido: true,
    usuario: usuario
  };
}

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
