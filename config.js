// ============================================================
// CONFIGURACIÓN — Generador de Códigos SENERCOM
// Edita aquí los valores sin tocar app.js
// ============================================================

const CONFIG = {
  // OAuth — mismo Client ID de las otras apps SENERCOM
  GOOGLE_CLIENT_ID: '72369192874-rgv4vqjl243p39fv0dntkl5a4m13s8k6.apps.googleusercontent.com',

  // Planilla maestra
  SPREADSHEET_ID: '1N6BmSf_3pjdmUmIcIl_BVknBi9sdvQBDKSgkxoCjIV0',
  SHEET_GENERAL: 'General',
  SHEET_CENTRO_COSTOS: 'Centros de Costos',
  RANGE_GENERAL_READ: 'General!A2:E1000',
  RANGE_CC_READ: 'Centros de Costos!A4:T3000',

  // Carpeta raíz "obras" en Drive
  // https://drive.google.com/drive/folders/1Lm2X3Uz_H_sUkD7Zll0JjKPSdaa1EW9n
  DRIVE_OBRAS_ROOT: '1Lm2X3Uz_H_sUkD7Zll0JjKPSdaa1EW9n',

  // Ingenieros activos — agrega o quita sin tocar app.js
  INGENIEROS: [
    { iniciales: 'CB', nombre: 'Carlos Braun' },
    { iniciales: 'OG', nombre: 'Oscar Gallo' },
    { iniciales: 'MA', nombre: 'Manuel Aro' },
    { iniciales: 'PS', nombre: 'Pablo Salas' },
    { iniciales: 'CR', nombre: 'Cristian Raddatz' },
    { iniciales: 'DV', nombre: 'Dario Valdivia' },
    { iniciales: 'PM', nombre: 'Pablo Muñoz' },
  ],

  VALIDADOR: 'Carlos Braun',

  // ── Estructura de carpetas que se crea para cada presupuesto ──────────────
  //
  // Para cada PRESUPUESTO ORIGINAL se crea:
  //   [año] / [cod cliente] [nombre cliente] / [código presupuesto] /
  //       01 - ESTUDIO PROYECTO  /  (subcarpetas de estudio)
  //       02 - EJECUCIÓN PROYECTO / (subcarpetas de ejecución)
  //
  // Para cada ADICIONAL se crea:
  //   (misma ruta del original) / 02 - EJECUCIÓN PROYECTO / 04 - ADICIONALES /
  //       [código adicional] /
  //           01 - ESTUDIO PROYECTO  /  (subcarpetas de estudio)
  //           02 - EJECUCIÓN PROYECTO / (subcarpetas de ejecución)

  SUBCARPETAS_ESTUDIO: [
    '01 - PLANOS',
    '02 - EETT',
    '03 - CONSULTAS Y ACLARACIONES',
    '04 - CUBICACIÓN DETALLADA',
    '05 - PPTOS MATERIALES QUE SE UTILIZARON',
    '06 - PPTO ENVIADO',
    '07 - ESPECIALIDADES',
  ],

  SUBCARPETAS_EJECUCION: [
    '01 - CONTRATO',
    '02 - RECUBICACIÓN',
    '03 - RDI EDI',
    '04 - ADICIONALES',
    '05 - PROGRAMA',
    '06 - ESTADO DE PAGO',
    '07 - PLANIMETRIA DE EJECUCION',
    '08 - FICHAS TECNICAS',
    '09 - PROTOCOLOS DE ENTREGA',
    '10 - ESPECIALIDADES',
    '11 - DOCUMENTOS MANDANTE',
    '12 - EXTERNOS (DOCUMENTACIÓN PARA COMPARTIR)',
    '13 - RIESGOS Y OPORTUNIDADES',
    '14 - MATRIZ HIPER (MATRIZ RIESGOS OBRA)',
    '15 - DOCUMENTOS A COMPARTIR CON EL MANDANTE',
    '16 - BRÔNE',
    '17 - OTROS',
    '18 - DOCUMENTOS CARGADOS POR CARLOS BRAUN',
  ],
};
