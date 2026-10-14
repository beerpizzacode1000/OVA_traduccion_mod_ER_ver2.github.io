/* =========================================================
   contenido.js · Datos del OVA: pasos del proceso, preguntas,
   caso guiado, laboratorio, taller y glosario.
   Se carga con <script> clásico para funcionar con file://.
   ========================================================= */
window.OVA = window.OVA || {};

/* Configuración editable por el docente */
OVA.CONFIG = {
  // true: el taller está disponible sin completar el caso guiado (M4)
  tallerSiempreDisponible: false,
  version: "1.0 · octubre de 2026",
  claveAlmacen: "ova-traduccion-er-v1"
};

/* ---------------------------------------------------------
   Hilo conductor: proceso de traducción en 8 pasos
   --------------------------------------------------------- */
OVA.PASOS = [
  { n: 1, corto: "Inventariar ER", nombre: "Inventariar el diagrama ER", tema: "Tema 05",
    pregunta: "¿Qué elementos tiene el modelo y de qué tipo es cada uno?",
    regla: "Clasificar entidades (fuertes, débiles), atributos (simple, compuesto, multivalorado, derivado, opcional) y relaciones (grado, cardinalidad, participación).",
    producto: "Tabla de inventario de elementos ER." },
  { n: 2, corto: "Entidades fuertes", nombre: "Traducir entidades fuertes", tema: "Tema 05",
    pregunta: "¿Qué entidades existen por sí mismas?",
    regla: "Cada entidad fuerte genera una relación con sus atributos simples; su identificador pasa a llave primaria.",
    producto: "Relaciones base con PK propia." },
  { n: 3, corto: "Entidades débiles", nombre: "Traducir entidades débiles", tema: "Tema 05",
    pregunta: "¿Qué entidades dependen de otra para identificarse?",
    regla: "Relación con la clave parcial más la PK de la propietaria; PK compuesta; FK hacia la propietaria.",
    producto: "Relaciones con PK compuesta." },
  { n: 4, corto: "Atributos especiales", nombre: "Traducir atributos especiales", tema: "Temas 05 y 06",
    pregunta: "¿Hay atributos compuestos, multivalorados, derivados u opcionales?",
    regla: "Compuesto → una columna por componente; multivalorado → nueva relación + FK; derivado → se omite; opcional → admite NULL.",
    producto: "Columnas expandidas y relaciones de atributos multivalorados." },
  { n: 5, corto: "Relaciones 1:1 y 1:N", nombre: "Traducir relaciones binarias 1:1 y 1:N", tema: "Tema 05",
    pregunta: "¿Dónde se ubica la llave foránea?",
    regla: "1:N → FK en el lado N; 1:1 → FK en el lado de participación total, marcada como ÚNICO.",
    producto: "Llaves foráneas incorporadas a relaciones existentes." },
  { n: 6, corto: "N:M, n-arias, reflexivas", nombre: "Traducir relaciones N:M, n-arias y reflexivas", tema: "Tema 05",
    pregunta: "¿La relación necesita su propia tabla?",
    regla: "N:M y n-aria → relación intermedia con las PK participantes; reflexiva → roles renombrados.",
    producto: "Relaciones intermedias con PK compuesta." },
  { n: 7, corto: "Dominios y llaves", nombre: "Definir dominios, llaves e integridad", tema: "Temas 06 y 07",
    pregunta: "¿Qué valores son válidos y qué identifica cada tupla?",
    regla: "dom(A) por atributo; superclave → candidata → primaria; alternativas únicas; FK con dominio compatible; integridad de entidad y referencial; acción referencial.",
    producto: "Esquema relacional anotado." },
  { n: 8, corto: "Validar instancia", nombre: "Validar con una instancia", tema: "Temas 06 y 07",
    pregunta: "¿El esquema admite datos correctos y rechaza los incorrectos?",
    regla: "Poblar con tuplas, calcular grado y cardinalidad, verificar propiedades y detectar violaciones; revisión introductoria de redundancia.",
    producto: "Esquema validado y lista de verificación cumplida." }
];

/* Pasos que ejercita cada sección (para resaltar la barra del proceso) */
OVA.PASOS_SECCION = {
  inicio: [], m1: [8], m2: [7], m3: [1, 2, 3, 4, 5, 6], m4: [1, 2, 3, 4, 5, 6, 7, 8],
  m5: [1, 2, 3, 4, 5, 6, 7, 8], m6: [2, 3, 4, 5, 6, 7, 8], taller: [1, 2, 3, 4, 5, 6, 7, 8],
  glosario: [], referencias: []
};

/* ---------------------------------------------------------
   Cuestionarios formativos de M1, M2 y M3
   ok = índice de la opción correcta
   --------------------------------------------------------- */
OVA.QUIZ = {
  m1: [
    { q: "Una relación tiene 5 columnas y 3 filas. ¿Cuál es su grado y su cardinalidad?",
      opts: ["Grado 5, cardinalidad 3", "Grado 3, cardinalidad 5", "Grado 15, cardinalidad 1", "Grado 8, cardinalidad 8"], ok: 0,
      fb: "El grado cuenta atributos (columnas); la cardinalidad cuenta tuplas (filas)." },
    { q: "¿Qué cambia con más frecuencia, el esquema o la instancia?",
      opts: ["El esquema", "La instancia", "Ambos cambian con cada inserción", "Ninguno cambia"], ok: 1,
      fb: "El esquema solo cambia si se modifica el diseño; la instancia cambia con cada inserción, modificación o eliminación." },
    { q: "Una celda contiene «3104567890, 3001234567». ¿Qué propiedad de la relación se viola?",
      opts: ["Sin orden en atributos", "Nombre único", "Atomicidad de los valores", "Sin tuplas duplicadas"], ok: 2,
      fb: "Cada celda debe guardar un único valor indivisible. Varios teléfonos exigen otra relación (paso 4)." },
    { q: "El email de un participante está en NULL. ¿Qué significa?",
      opts: ["Que el email es la cadena vacía", "Que el email vale cero", "Valor desconocido o no aplicable", "Que la tupla es inválida"], ok: 2,
      fb: "NULL es una marca de valor desconocido, inexistente o no aplicable; no equivale a cadena vacía ni a cero." },
    { q: "Si se reordenan las filas de CURSO, ¿se obtiene otra relación?",
      opts: ["Sí, porque cambia la primera tupla", "No, el orden de las tuplas no tiene significado lógico", "Sí, si cambia la llave primaria", "Depende del SGBD"], ok: 1,
      fb: "Una relación es un conjunto de tuplas: el orden no tiene significado lógico." }
  ],
  m2: [
    { q: "¿Toda llave candidata es superclave? ¿Y a la inversa?",
      opts: ["Sí; a la inversa, no", "No; a la inversa, sí", "Sí en ambos sentidos", "No en ningún sentido"], ok: 0,
      fb: "La candidata es una superclave minimal; una superclave puede tener atributos sobrantes." },
    { q: "En DOCENTE(cedula, nombres, apellidos, email, fecha_nac, categoria), el conjunto {cedula, categoria} es…",
      opts: ["Llave candidata", "Superclave no candidata", "Llave foránea", "No es superclave"], ok: 1,
      fb: "Contiene a {cedula}, que ya identifica por sí sola: no es minimal." },
    { q: "¿Por qué la llave primaria no admite valores nulos?",
      opts: ["Por la integridad referencial", "Por la integridad de entidad", "Porque ocupa más espacio", "Por la restricción de dominio"], ok: 1,
      fb: "Una tupla sin identificador no puede distinguirse ni ser referenciada: lo prohíbe la integridad de entidad." },
    { q: "¿Puede una llave foránea tomar el valor NULL?",
      opts: ["Nunca", "Sí, si la participación en la relación es parcial", "Solo si es compuesta", "Solo si es llave primaria"], ok: 1,
      fb: "Indica que la tupla aún no está asociada. Si la participación es total, la FK es obligatoria (NO NULO)." },
    { q: "¿Qué acción referencial conviene para INSCRIPCION cuando se elimina un PARTICIPANTE?",
      opts: ["Restringir", "Cascada", "Fijar a nulo", "Valor por defecto"], ok: 1,
      fb: "Una inscripción no tiene sentido sin su participante; además su FK forma parte de la PK y no puede ser nula." }
  ],
  m3: [
    { q: "DEPARTAMENTO 1:N EMPLEADO. ¿Dónde va la llave foránea?",
      opts: ["En DEPARTAMENTO", "En EMPLEADO", "En una relación intermedia", "En ambas relaciones"], ok: 1,
      fb: "En una relación 1:N la FK siempre va en el lado N." },
    { q: "¿Cuántas relaciones genera una relación N:M entre dos entidades fuertes?",
      opts: ["Dos", "Tres", "Una", "Cuatro"], ok: 1,
      fb: "Una por cada entidad y una relación intermedia." },
    { q: "La entidad débil HABITACION (clave parcial num_hab) depende de SALA(cod_sala). ¿Cuál es su PK?",
      opts: ["{num_hab}", "{cod_sala}", "{cod_sala, num_hab}", "Una llave sustituta obligatoria"], ok: 2,
      fb: "La clave parcial solo distingue habitaciones de la misma sala; se combina con la PK de la propietaria." },
    { q: "Un atributo Edad calculable desde FechaNac se traduce…",
      opts: ["Como columna obligatoria", "Como relación aparte", "No se almacena", "Como llave alternativa"], ok: 2,
      fb: "Es derivado: almacenarlo genera inconsistencias cuando pasa el tiempo." },
    { q: "Un estudiante puede tener varios correos. ¿Qué se hace?",
      opts: ["Una columna con los correos separados por comas", "Columnas correo1, correo2, correo3", "Nueva relación CORREO con PK {Matricula, Correo}", "Se guarda solo el primero"], ok: 2,
      fb: "Un atributo multivalorado nunca se guarda en una celda ni en columnas repetidas." }
  ]
};

/* ---------------------------------------------------------
   Árbol de decisión (M3)
   --------------------------------------------------------- */
OVA.ARBOL = {
  inicio: { q: "Tome un elemento del diagrama ER. ¿Qué tipo de elemento es?",
    ops: [["Entidad", "ent"], ["Atributo", "atr"], ["Relación", "rel"]] },
  ent: { q: "¿La entidad tiene identificador propio?",
    ops: [["Sí, existe por sí misma (fuerte)", "r_fuerte"], ["No, solo una clave parcial (débil)", "r_debil"]] },
  atr: { q: "¿De qué tipo es el atributo?",
    ops: [["Simple", "r_simple"], ["Compuesto", "r_comp"], ["Multivalorado", "r_multi"], ["Derivado", "r_deriv"], ["Opcional", "r_opc"]] },
  rel: { q: "¿Cuál es su grado?",
    ops: [["Binaria entre entidades distintas", "bin"], ["Reflexiva (una entidad consigo misma)", "refl"], ["Ternaria o n-aria", "r_tern"]] },
  bin: { q: "¿Cuál es su cardinalidad?",
    ops: [["1:1", "r_11"], ["1:N", "r_1n"], ["N:M", "r_nm"]] },
  refl: { q: "¿Cuál es su cardinalidad?",
    ops: [["1:N (p. ej., cada profesor tiene a lo sumo un supervisor)", "r_refl1n"], ["N:M (p. ej., prerrequisitos)", "r_reflnm"]] },
  r_fuerte: { res: "Paso 2 · Una relación con sus atributos simples; el identificador es la llave primaria.", ej: "CLIENTE(<u>ID_Cliente</u>, Nombre, Email)" },
  r_debil: { res: "Paso 3 · Relación con la clave parcial + la PK de la propietaria; la PK es compuesta y la PK heredada es también FK.", ej: "FACTURA(<u><i>ID_Cliente</i>, Num_Fac</u>, Fecha), ID_Cliente → CLIENTE" },
  r_simple: { res: "Paso 2 · Una columna directa en la relación de su entidad.", ej: "Nombre en CLIENTE" },
  r_comp: { res: "Paso 4 · Una columna por componente; el atributo «padre» desaparece.", ej: "Nombre_Completo{Nombre, Apellido} → columnas Nombre, Apellido" },
  r_multi: { res: "Paso 4 · Nueva relación con la PK de la entidad + el valor; ambos forman la PK.", ej: "TELEFONO(<u><i>Matricula</i>, Telefono</u>), Matricula → ESTUDIANTE" },
  r_deriv: { res: "Paso 4 · No se almacena: se calcula cuando se consulta.", ej: "Edad se omite; se conserva FechaNac" },
  r_opc: { res: "Paso 4 · La columna admite NULL: v ∈ dom(A) ∪ {NULL}.", ej: "Email de un participante" },
  r_11: { res: "Paso 5 · FK en el lado de participación total, marcada ÚNICO para preservar la cardinalidad 1:1.", ej: "PASAPORTE(<u>Num_Pasaporte</u>, FechaExp, <i>ID_Persona</i>), ÚNICO(ID_Persona)" },
  r_1n: { res: "Paso 5 · FK en la relación del lado N, hacia la PK del lado 1.", ej: "CURSO(<u>CodCurso</u>, Nombre, NHoras, <i>ID_Profesor</i>)" },
  r_nm: { res: "Paso 6 · Relación intermedia con las dos PK como FK; su PK es la combinación. Los atributos de la relación van aquí.", ej: "INSCRIPCION(<u><i>Matricula</i>, <i>CodCurso</i></u>, Fecha_Insc)" },
  r_refl1n: { res: "Paso 5 · Basta una FK renombrada según el rol dentro de la misma relación; admite NULL.", ej: "PROFESOR(<u>ID_Profesor</u>, Nombre, <i>ID_Supervisor</i>), ID_Supervisor → PROFESOR" },
  r_reflnm: { res: "Paso 6 · Relación intermedia con la PK repetida y renombrada según los roles.", ej: "SUPERVISA(<u><i>ID_Supervisor</i>, <i>ID_Supervisado</i></u>)" },
  r_tern: { res: "Paso 6 · Relación con las PK de todas las participantes + atributos propios. Si una participa con cardinalidad 1, su PK puede salir de la llave.", ej: "IMPARTE(<u><i>ID_Profesor</i>, <i>CodCurso</i>, <i>CodAula</i></u>, Semestre)" }
};

/* ---------------------------------------------------------
   Opciones de restricciones para los detectores de violaciones
   --------------------------------------------------------- */
OVA.RESTRICCIONES = [
  ["", "— Seleccione la restricción —"],
  ["entidad", "Integridad de entidad (PK nula o repetida)"],
  ["referencial", "Integridad referencial (FK sin tupla referenciada)"],
  ["dominio", "Restricción de dominio"],
  ["unico", "Restricción ÚNICO (llave alternativa)"],
  ["semantica", "Regla semántica del negocio"],
  ["restringir", "Acción restringir (borrado bloqueado)"],
  ["cascada", "Acción cascada"],
  ["fijar_nulo", "Acción fijar a nulo"],
  ["ninguna", "Ninguna restricción se viola"]
];

/* ---------------------------------------------------------
   CASO GUIADO · «Educación Continua Unicórdoba»
   Cada relación y atributo registra el paso en que aparece.
   --------------------------------------------------------- */
OVA.CASO = {};

OVA.CASO.requisitos = [
  ["R1", "Cada sede tiene código, nombre y municipio. Cada sede es coordinada por exactamente un docente, y un docente coordina como máximo una sede."],
  ["R2", "Cada sede tiene salones numerados dentro de ella: el salón 101 existe en Montería y también en Lorica. De cada salón se registra su capacidad y su tipo (aula, laboratorio o auditorio). Un salón no existe sin su sede."],
  ["R3", "De cada docente se registra cédula, nombre completo (nombres y apellidos), correo institucional (no se repite), fecha de nacimiento, categoría y uno o varios teléfonos. Se desea conocer su edad."],
  ["R4", "Los cursos se agrupan en áreas (código, nombre, descripción). Cada curso pertenece a una sola área y un área ofrece varios cursos. De cada curso se registra código, nombre, horas y valor."],
  ["R5", "Un curso puede exigir otros cursos como prerrequisito, y un curso puede ser prerrequisito de varios."],
  ["R6", "Los participantes (documento, nombres, apellidos, correo opcional y teléfono) se inscriben en varios cursos, y cada curso recibe muchos participantes. Se registra la fecha de inscripción y la nota final, que permanece vacía hasta que el curso termina."],
  ["R7", "Un docente imparte un curso en un salón con un horario; un mismo curso puede ser impartido por distintos docentes en distintos salones."]
];

/* Esquema final con el paso de aparición de cada elemento */
OVA.CASO.relaciones = [
  { id: "AREA", paso: 2, atrs: [
      { n: "cod_area", pk: 1, paso: 2 }, { n: "nombre_area", paso: 2 }, { n: "descripcion", paso: 2 }],
    notas: [{ paso: 7, t: "ÚNICO(nombre_area)" }] },
  { id: "SEDE", paso: 2, atrs: [
      { n: "cod_sede", pk: 1, paso: 2 }, { n: "nombre_sede", paso: 2 }, { n: "municipio", paso: 2 },
      { n: "ced_coordinador", fk: "eyJBIjpbMCwwLDAsMCwwLDAsMCwwLDAsMF0sIkMxIjpbWyJyZWNoYXphIiwiZW50aWRhZCJdLFsicmVjaGF6YSIsInNlbWFudGljYSJdLFsicmVjaGF6YSIsInJlZmVyZW5jaWFsIl0sWyJyZWNoYXphIiwidW5pY28iXSxbImFjZXB0YSIsIm5pbmd1bmEiXSxbImFjZXB0YSIsImZpamFyX251bG8iXV0sIkMyIjpbNCwzLDgsMl0sIkMzIjpbMjQsMjhdfQ==", paso: 5 }],
    notas: [{ paso: 5, t: "ced_coordinador → DOCENTE · NO NULO · ÚNICO(ced_coordinador)" },
            { paso: 7, t: "ÚNICO(nombre_sede) · al borrar DOCENTE: <b>restringir</b>" }] },
  { id: "DOCENTE", paso: 2, atrs: [
      { n: "cedula", pk: 1, paso: 2 }, { n: "nombres", paso: 4 }, { n: "apellidos", paso: 4 },
      { n: "email", paso: 2 }, { n: "fecha_nac", paso: 2 }, { n: "categoria", paso: 2 }],
    pend: { t: "pendientes: nombre, telefono, edad", hasta: 4 },
    notas: [{ paso: 7, t: "ÚNICO(email) · llave alternativa" }] },
  { id: "TELEFONO_DOCENTE", paso: 4, atrs: [
      { n: "cedula", pk: 1, fk: "DOCENTE", paso: 4 }, { n: "telefono", pk: 1, paso: 4 }],
    notas: [{ paso: 4, t: "cedula → DOCENTE" }, { paso: 7, t: "al borrar DOCENTE: <b>cascada</b>" }] },
  { id: "SALON", paso: 3, atrs: [
      { n: "cod_sede", pk: 1, fk: "SEDE", paso: 3 }, { n: "num_salon", pk: 1, paso: 3 },
      { n: "capacidad", paso: 3 }, { n: "tipo", paso: 3 }],
    notas: [{ paso: 3, t: "cod_sede → SEDE" }, { paso: 7, t: "al borrar SEDE: <b>cascada</b>" }] },
  { id: "CURSO", paso: 2, atrs: [
      { n: "cod_curso", pk: 1, paso: 2 }, { n: "nombre_curso", paso: 2 }, { n: "horas", paso: 2 },
      { n: "valor", paso: 2 }, { n: "cod_area", fk: "AREA", paso: 5 }],
    notas: [{ paso: 5, t: "cod_area → AREA · NO NULO" }, { paso: 7, t: "al borrar AREA: <b>restringir</b>" }] },
  { id: "PARTICIPANTE", paso: 2, atrs: [
      { n: "doc_part", pk: 1, paso: 2 }, { n: "nombres", paso: 4 }, { n: "apellidos", paso: 4 },
      { n: "email", paso: 2 }, { n: "telefono", paso: 2 }],
    pend: { t: "pendiente: nombre", hasta: 4 },
    notas: [{ paso: 4, t: "email admite NULL" }, { paso: 7, t: "ÚNICO(email) cuando no es nulo" }] },
  { id: "INSCRIPCION", paso: 6, atrs: [
      { n: "doc_part", pk: 1, fk: "PARTICIPANTE", paso: 6 }, { n: "cod_curso", pk: 1, fk: "CURSO", paso: 6 },
      { n: "fecha_insc", paso: 6 }, { n: "nota_final", paso: 6 }],
    notas: [{ paso: 6, t: "doc_part → PARTICIPANTE · cod_curso → CURSO · nota_final admite NULL" },
            { paso: 7, t: "al borrar PARTICIPANTE: <b>cascada</b> · al borrar CURSO: <b>restringir</b>" }] },
  { id: "PRERREQUISITO", paso: 6, atrs: [
      { n: "cod_curso", pk: 1, fk: "CURSO", paso: 6 }, { n: "cod_curso_req", pk: 1, fk: "CURSO", paso: 6 }],
    notas: [{ paso: 6, t: "ambas → CURSO · regla: cod_curso ≠ cod_curso_req" }, { paso: 7, t: "al borrar CURSO: <b>cascada</b>" }] },
  { id: "IMPARTE", paso: 6, atrs: [
      { n: "cedula", pk: 1, fk: "DOCENTE", paso: 6 }, { n: "cod_curso", pk: 1, fk: "CURSO", paso: 6 },
      { n: "cod_sede", pk: 1, fk: "SALON", paso: 6 }, { n: "num_salon", pk: 1, fk: "SALON", paso: 6 },
      { n: "horario", paso: 6 }],
    notas: [{ paso: 6, t: "cedula → DOCENTE · cod_curso → CURSO · (cod_sede, num_salon) → SALON" },
            { paso: 7, t: "al borrar DOCENTE, CURSO o SALON: <b>restringir</b>" }] }
];

/* Elementos del diagrama ER que se resaltan en cada paso */
OVA.CASO.resaltar = {
  1: ["DOCENTE", "SEDE", "SALON", "CURSO", "AREA", "PARTICIPANTE", "COORDINA", "TIENE", "IMPARTE", "OFRECE", "INSCRIBE", "REQUIERE"],
  2: ["DOCENTE", "SEDE", "CURSO", "AREA", "PARTICIPANTE"],
  3: ["SALON", "TIENE"],
  4: ["DOCENTE", "PARTICIPANTE"],
  5: ["COORDINA", "OFRECE"],
  6: ["INSCRIBE", "REQUIERE", "IMPARTE"],
  7: ["DOCENTE", "SEDE", "SALON", "CURSO", "AREA", "PARTICIPANTE", "COORDINA", "TIENE", "IMPARTE", "OFRECE", "INSCRIBE", "REQUIERE"],
  8: ["DOCENTE", "SEDE", "SALON", "CURSO", "AREA", "PARTICIPANTE", "COORDINA", "TIENE", "IMPARTE", "OFRECE", "INSCRIBE", "REQUIERE"]
};

/* Matriz de trazabilidad */
OVA.CASO.traza = [
  { paso: 2, er: "SEDE, DOCENTE, AREA, CURSO, PARTICIPANTE", art: "Relaciones SEDE, DOCENTE, AREA, CURSO, PARTICIPANTE", regla: "Entidad fuerte" },
  { paso: 3, er: "SALON + TIENE", art: "Relación SALON con PK compuesta", regla: "Entidad débil" },
  { paso: 4, er: "nombre", art: "Columnas nombres, apellidos", regla: "Atributo compuesto" },
  { paso: 4, er: "telefono de DOCENTE", art: "Relación TELEFONO_DOCENTE", regla: "Atributo multivalorado" },
  { paso: 4, er: "edad", art: "Sin columna", regla: "Atributo derivado" },
  { paso: 5, er: "OFRECE", art: "FK cod_area en CURSO", regla: "1:N" },
  { paso: 5, er: "COORDINA", art: "FK única ced_coordinador en SEDE", regla: "1:1" },
  { paso: 6, er: "INSCRIBE", art: "Relación INSCRIPCION", regla: "N:M" },
  { paso: 6, er: "REQUIERE", art: "Relación PRERREQUISITO", regla: "Reflexiva N:M" },
  { paso: 6, er: "IMPARTE", art: "Relación IMPARTE", regla: "Ternaria" },
  { paso: 7, er: "Todos los atributos e identificadores", art: "Dominios, llaves alternativas, acciones referenciales", regla: "Dominios y llaves" },
  { paso: 8, er: "Esquema completo", art: "Instancia validada", regla: "Validación" }
];

/* Paso 1: clasificador */
OVA.CASO.categorias = [
  ["", "— Clasifique —"],
  ["fuerte", "Entidad fuerte"], ["debil", "Entidad débil"],
  ["compuesto", "Atributo compuesto"], ["multi", "Atributo multivalorado"], ["derivado", "Atributo derivado"], ["opcional", "Atributo opcional"],
  ["r11", "Relación 1:1"], ["r1n", "Relación 1:N"], ["ident", "Relación identificadora"], ["rnm", "Relación N:M"],
  ["refl", "Relación reflexiva N:M"], ["tern", "Relación ternaria"]
];
OVA.CASO.clasificar = [
  ["SEDE", "fuerte", "Tiene identificador propio: cod_sede."],
  ["DOCENTE", "fuerte", "Tiene identificador propio: cedula."],
  ["SALON", "debil", "num_salon solo distingue salones de una misma sede."],
  ["AREA", "fuerte", "Tiene identificador propio: cod_area."],
  ["CURSO", "fuerte", "Tiene identificador propio: cod_curso."],
  ["PARTICIPANTE", "fuerte", "Tiene identificador propio: doc_part."],
  ["nombre (de DOCENTE y PARTICIPANTE)", "compuesto", "Se divide en nombres y apellidos."],
  ["telefono (de DOCENTE)", "multi", "Un docente tiene uno o varios teléfonos."],
  ["edad (de DOCENTE)", "derivado", "Se calcula desde fecha_nac."],
  ["nota_final (de INSCRIBE)", "opcional", "Permanece vacía hasta que el curso termina."],
  ["COORDINA", "r11", "Una sede, un coordinador; un docente coordina a lo sumo una sede."],
  ["TIENE", "ident", "Une a SALON con su propietaria SEDE."],
  ["OFRECE", "r1n", "Un área ofrece varios cursos; cada curso pertenece a una sola área."],
  ["REQUIERE", "refl", "CURSO se relaciona consigo mismo en los roles curso y prerrequisito."],
  ["INSCRIBE", "rnm", "Muchos participantes en muchos cursos."],
  ["IMPARTE", "tern", "Involucra a DOCENTE, CURSO y SALON."]
];

/* Preguntas de control por paso (deben responderse para avanzar) */
OVA.CASO.control = {
  1: { q: "¿Por qué SALON es una entidad débil y no fuerte?",
       opts: ["Porque tiene pocos atributos", "Porque num_salon solo distingue salones de una misma sede", "Porque participa en una relación ternaria", "Porque no tiene atributos compuestos"], ok: 1,
       fb: "Para identificar un salón se necesita también cod_sede: el salón 101 existe en varias sedes." },
  2: { q: "¿Por qué no se usa email como PK de DOCENTE si también es único?",
       opts: ["Porque email puede ser nulo", "Porque cedula es más estable: un correo puede cambiar", "Porque una relación solo puede tener una llave candidata", "Porque email es un atributo derivado"], ok: 1,
       fb: "Se elige la candidata más estable y corta; email será llave alternativa (ÚNICO) en el paso 7." },
  3: { q: "¿Puede existir la tupla ⟨NULL, 101, 40, Aula⟩ en SALON?",
       opts: ["Sí, porque num_salon identifica el salón", "No: cod_sede forma parte de la PK y la integridad de entidad prohíbe nulos", "Sí, si la sede se asigna después", "Solo si el salón es de tipo Aula"], ok: 1,
       fb: "Además, la participación de SALON en TIENE es total: todo salón pertenece a una sede." },
  4: { q: "¿Por qué no crear columnas telefono1, telefono2 y telefono3 en DOCENTE?",
       opts: ["Porque fija un máximo arbitrario, deja columnas vacías y complica las búsquedas", "Porque los teléfonos son derivados", "Porque viola la integridad referencial", "No hay problema; es una solución válida"], ok: 0,
       fb: "La relación TELEFONO_DOCENTE admite cualquier cantidad de teléfonos sin columnas vacías." },
  5: { q: "¿Por qué la FK de COORDINA se ubica en SEDE y no en DOCENTE?",
       opts: ["Porque SEDE tiene menos atributos", "Porque SEDE tiene participación total: toda sede tiene coordinador y la FK nunca queda nula", "Porque DOCENTE es entidad débil", "Porque la FK de una 1:1 siempre va en la segunda entidad"], ok: 1,
       fb: "En DOCENTE la columna quedaría en NULL para casi todos los docentes, que no coordinan." },
  6: { q: "¿Por qué IMPARTE no se reemplaza por tres relaciones binarias?",
       opts: ["Porque las binarias ocupan más espacio", "Porque tres binarias no registran qué docente dicta qué curso en qué salón a la vez", "Porque las relaciones binarias no admiten atributos", "Porque SALON es débil"], ok: 1,
       fb: "La relación ternaria conserva el hecho completo; las binarias pierden la combinación." },
  7: { q: "Si se intenta borrar la sede de Lorica y uno de sus salones aparece en IMPARTE, ¿qué ocurre?",
       opts: ["Se borran la sede, sus salones y las tuplas de IMPARTE", "La operación se rechaza: restringir en IMPARTE detiene la cascada", "Se borra la sede y los salones quedan con cod_sede nulo", "Se borra solo la sede"], ok: 1,
       fb: "Las acciones se combinan: la cascada hacia SALON choca con la acción restringir de IMPARTE." },
  8: { q: "¿Qué evita el esquema al no guardar nombre_area dentro de CURSO?",
       opts: ["Anomalías de modificación y eliminación por datos repetidos", "La integridad de entidad", "El uso de llaves compuestas", "Los valores nulos en horas"], ok: 0,
       fb: "Cada dato se almacena una sola vez; la normalización formal se estudiará más adelante." }
};

/* Paso 8: operaciones a evaluar sobre la instancia */
OVA.CASO.operaciones = [
  { op: "Insertar SALON ⟨MON, 101, 30, Aula⟩", res: "rechaza", r: "entidad", fb: "La PK {MON, 101} ya existe." },
  { op: "Insertar INSCRIPCION ⟨1067890123, EXT999, 2026-08-06, NULL⟩", res: "rechaza", r: "referencial", fb: "EXT999 no existe en CURSO." },
  { op: "Insertar CURSO ⟨EXT300, Taller exprés, 4, 200000, TIC⟩", res: "rechaza", r: "dominio", fb: "horas debe estar entre 8 y 160." },
  { op: "Insertar SEDE ⟨SAH, Sede Sahagún, Sahagún, 10670001⟩", res: "rechaza", r: "unico", fb: "10670001 ya coordina MON: ÚNICO(ced_coordinador) preserva la cardinalidad 1:1." },
  { op: "Insertar PRERREQUISITO ⟨EXT102, EXT102⟩", res: "rechaza", r: "semantica", fb: "Un curso no puede ser prerrequisito de sí mismo." },
  { op: "Insertar INSCRIPCION ⟨1003456789, EXT205, 2026-08-10, NULL⟩", res: "acepta", r: "ninguna", fb: "nota_final admite NULL y ambas referencias existen." },
  { op: "Borrar DOCENTE 10670003", res: "rechaza", r: "restringir", fb: "Coordina LOR e imparte EXT102: la acción restringir bloquea el borrado." },
  { op: "Borrar PARTICIPANTE 1003456789", res: "acepta", r: "cascada", fb: "Se eliminan también sus 2 inscripciones." }
];

/* ---------------------------------------------------------
   Buscador de llaves (M2): instancia de DOCENTE
   --------------------------------------------------------- */
OVA.LLAVES = {
  cols: ["cedula", "nombres", "apellidos", "email", "fecha_nac", "categoria"],
  unicasPorRequisito: ["cedula", "email"],
  filas: [
    ["10670001", "Ana María", "Pérez Díaz", "aperez@correo.unicordoba.edu.co", "1980-03-14", "Asociado"],
    ["10670002", "Luis Carlos", "Gómez Ruiz", "lgomez@correo.unicordoba.edu.co", "1975-11-02", "Titular"],
    ["10670003", "María José", "Ruiz Petro", "mruiz@correo.unicordoba.edu.co", "1988-07-21", "Asistente"],
    ["10670004", "Jorge", "Martínez Lora", "jmartinez@correo.unicordoba.edu.co", "1990-01-30", "Auxiliar"],
    ["10670005", "Ana María", "Pérez Díaz", "amperez@correo.unicordoba.edu.co", "1985-06-09", "Asistente"]
  ]
};

/* ---------------------------------------------------------
   M5 · Laboratorio de práctica
   --------------------------------------------------------- */
OVA.LAB = {};
OVA.LAB.clasificar = [
  ["DEPARTAMENTO", "fuerte", "Tiene identificador propio."],
  ["EMPLEADO", "fuerte", "Tiene identificador propio."],
  ["PROYECTO", "fuerte", "Tiene identificador propio."],
  ["ESCRITORIO", "fuerte", "Tiene identificador propio: num_escritorio."],
  ["DEPENDIENTE", "debil", "Se identifica por su nombre dentro de la familia del empleado."],
  ["PERTENECE (DEPARTAMENTO–EMPLEADO)", "r1n", "Un departamento, varios empleados."],
  ["TRABAJA_EN (EMPLEADO–PROYECTO), con horas", "rnm", "Muchos empleados en muchos proyectos."],
  ["ASIGNADO (EMPLEADO–ESCRITORIO)", "r11", "Un escritorio por empleado como máximo."],
  ["TIENE_DEPENDIENTE", "ident", "Une a DEPENDIENTE con su propietario EMPLEADO."]
];
OVA.LAB.opcionesFK = [["", "— Seleccione —"], ["A", "En la primera entidad (A)"], ["B", "En la segunda entidad (B)"], ["inter", "Relación intermedia"], ["misma", "FK renombrada dentro de la misma relación"], ["cualquiera", "En cualquiera, marcada ÚNICO (o fusionar)"]];
OVA.LAB.fk = [
  ["A = DEPARTAMENTO 1:N B = EMPLEADO", "B", "FK en el lado N: EMPLEADO."],
  ["A = EMPLEADO 1:1 B = ESCRITORIO (todo escritorio está asignado)", "B", "FK en el lado de participación total (ESCRITORIO), marcada ÚNICO."],
  ["A = EMPLEADO N:M B = PROYECTO", "inter", "Una N:M siempre genera relación propia."],
  ["A = CIUDAD 1:N B = SUCURSAL", "B", "FK en el lado N: SUCURSAL."],
  ["A = PAÍS 1:1 B = CAPITAL (ambas participaciones totales)", "cualquiera", "Con ambas participaciones totales, la FK puede ir en cualquiera (ÚNICO) o se fusionan."],
  ["EMPLEADO «jefe de» EMPLEADO, 1:N", "misma", "Reflexiva 1:N: basta id_jefe dentro de EMPLEADO; admite NULL."]
];
/* Constructor: rol esperado de cada atributo en cada relación.
   Valores: "" no incluir · "a" atributo · "pk" · "fk" · "pkfk" */
OVA.LAB.constructor = [
  { t: "DEPARTAMENTO", atrs: { cod_depto: "pk", nombre_depto: "a", id_emp: "" } },
  { t: "EMPLEADO", atrs: { id_emp: "pk", nombres: "a", apellidos: "a", salario: "a", cod_depto: "fk", horas_semana: "", num_escritorio: "" } },
  { t: "PROYECTO", atrs: { cod_proy: "pk", nombre_proy: "a", presupuesto: "a", horas_semana: "" } },
  { t: "ASIGNACION", atrs: { id_emp: "pkfk", cod_proy: "pkfk", horas_semana: "a", salario: "" } },
  { t: "ESCRITORIO", atrs: { num_escritorio: "pk", piso: "a", id_emp: "fk" } },
  { t: "DEPENDIENTE", atrs: { id_emp: "pkfk", nombre_dep: "pk", parentesco: "a", fecha_nac: "a" } }
];
OVA.LAB.pistasConstructor = {
  "DEPARTAMENTO.id_emp": "En una 1:N la FK va en el lado N (EMPLEADO), no en DEPARTAMENTO.",
  "EMPLEADO.horas_semana": "horas_semana describe la relación TRABAJA_EN: va en ASIGNACION.",
  "PROYECTO.horas_semana": "horas_semana describe la relación TRABAJA_EN: va en ASIGNACION.",
  "EMPLEADO.num_escritorio": "En la 1:1 la FK va en ESCRITORIO, el lado de participación total.",
  "EMPLEADO.cod_depto": "cod_depto es FK hacia DEPARTAMENTO (lado N de PERTENECE).",
  "DEPENDIENTE.id_emp": "La entidad débil hereda la PK de su propietario: id_emp es PK y FK.",
  "ASIGNACION.salario": "salario describe al empleado, no a la asignación.",
  "ESCRITORIO.id_emp": "id_emp es FK (y debe marcarse ÚNICO para preservar la 1:1)."
};
OVA.LAB.violaciones = [
  { op: "Insertar EMPLEADO ⟨E12, …, D09⟩", res: "rechaza", r: "referencial", fb: "D09 no existe en DEPARTAMENTO." },
  { op: "Insertar ASIGNACION ⟨E10, P1, 8⟩", res: "rechaza", r: "entidad", fb: "La PK {E10, P1} ya existe." },
  { op: "Insertar DEPENDIENTE ⟨NULL, Sofía, Hija, …⟩", res: "rechaza", r: "entidad", fb: "id_emp forma parte de la PK y no admite nulos." },
  { op: "Insertar ESCRITORIO ⟨S-3, 1, E10⟩", res: "rechaza", r: "unico", fb: "E10 ya tiene escritorio: ÚNICO(id_emp)." },
  { op: "Borrar DEPARTAMENTO D01", res: "rechaza", r: "restringir", fb: "E10 pertenece a D01 y la acción es restringir." },
  { op: "Insertar ASIGNACION ⟨E11, P1, 6⟩ (P1 existe)", res: "acepta", r: "ninguna", fb: "Ambas referencias existen y la PK {E11, P1} es nueva." }
];
OVA.LAB.vf = [
  { q: "Una relación N:M puede traducirse con una FK en una de las dos tablas.", opts: ["Verdadero", "Falso"], ok: 1, fb: "Exigiría varios valores en una celda o filas repetidas." },
  { q: "La relación identificadora de una entidad débil genera su propia tabla.", opts: ["Verdadero", "Falso"], ok: 1, fb: "Se absorbe en la tabla de la entidad débil." },
  { q: "Una llave foránea debe tener el mismo dominio que la PK que referencia.", opts: ["Verdadero", "Falso"], ok: 0, fb: "Si no, la comparación de valores carece de sentido." },
  { q: "Toda superclave es llave candidata.", opts: ["Verdadero", "Falso"], ok: 1, fb: "Falta la minimalidad." },
  { q: "En el diseño lógico, los atributos derivados se almacenan para acelerar consultas.", opts: ["Verdadero", "Falso"], ok: 1, fb: "En el diseño lógico se omiten; almacenarlos es una decisión de diseño físico." }
];

/* ---------------------------------------------------------
   M6 · Lista de verificación
   --------------------------------------------------------- */
OVA.CHECKLIST = [
  "Cada entidad fuerte tiene su relación y su PK.",
  "Cada entidad débil tiene PK compuesta con la PK de su propietaria.",
  "No hay atributos compuestos sin expandir ni multivalorados en una celda.",
  "Ningún atributo derivado se almacena.",
  "Cada 1:N tiene su FK en el lado N; cada 1:1 tiene FK marcada ÚNICO.",
  "Cada N:M, n-aria y reflexiva N:M tiene su relación intermedia con PK compuesta.",
  "Cada atributo tiene dominio y se indica si admite NULL.",
  "Las llaves alternativas están marcadas ÚNICO.",
  "Cada FK tiene el mismo dominio que la PK referenciada y una acción referencial justificada.",
  "El esquema se probó con al menos una instancia y una operación que debe rechazarse.",
  "Cada elemento ER aparece en la matriz de trazabilidad."
];

/* ---------------------------------------------------------
   Glosario
   --------------------------------------------------------- */
OVA.GLOSARIO = [
  ["Atributo", "Nombre de una columna; papel que un dominio cumple en una relación.", "horas en CURSO"],
  ["Atributo compuesto", "Atributo ER divisible en componentes.", "nombre {nombres, apellidos}"],
  ["Atributo derivado", "Atributo calculable a partir de otros.", "edad desde fecha_nac"],
  ["Atributo multivalorado", "Atributo ER con varios valores por entidad.", "telefono de DOCENTE"],
  ["Cardinalidad de una relación", "Número de tuplas de la instancia.", "|salon| = 4"],
  ["Cardinalidad de una relación ER", "Número máximo de asociaciones: 1:1, 1:N, N:M.", "OFRECE es 1:N"],
  ["Clave parcial", "Atributo que distingue entidades débiles de una misma propietaria.", "num_salon"],
  ["Dominio", "Conjunto de valores atómicos permitidos para un atributo.", "dom(tipo) = {Aula, Laboratorio, Auditorio}"],
  ["Entidad débil", "Entidad que depende de otra para identificarse.", "SALON"],
  ["Esquema (intensión)", "Descripción estable: nombre, atributos y dominios.", "CURSO(cod_curso, …)"],
  ["Grado", "Número de atributos de una relación.", "deg(IMPARTE) = 5"],
  ["Instancia (extensión)", "Conjunto de tuplas en un instante.", "Las 3 tuplas de CURSO"],
  ["Integridad de entidad", "La PK no es nula ni se repite.", "Rechazo de ⟨MON, 101⟩ duplicado"],
  ["Integridad referencial", "Toda FK coincide con una PK existente o es nula.", "Rechazo de EXT999"],
  ["Llave alternativa", "Candidata no elegida como primaria; se marca ÚNICO.", "email de DOCENTE"],
  ["Llave candidata", "Superclave minimal.", "{cedula}, {email}"],
  ["Llave compuesta", "Llave formada por dos o más atributos.", "{cod_sede, num_salon}"],
  ["Llave foránea", "Atributos que referencian la PK de otra relación.", "cod_area en CURSO"],
  ["Llave primaria", "Candidata elegida para identificar las tuplas.", "cod_curso"],
  ["Llave sustituta", "Identificador generado sin significado de negocio.", "id_aplicacion (variante del taller)"],
  ["NULL", "Marca de valor desconocido, inexistente o no aplicable.", "nota_final antes de terminar el curso"],
  ["Participación total", "Toda entidad del tipo debe participar en la relación.", "Toda SEDE tiene coordinador"],
  ["Relación (modelo relacional)", "Conjunto de tuplas sobre un esquema; r ⊆ D1 × … × Dn.", "INSCRIPCION"],
  ["Relación reflexiva", "Relación ER de una entidad consigo misma con roles distintos.", "REQUIERE"],
  ["Relación ternaria", "Relación ER entre tres entidades.", "IMPARTE"],
  ["Superclave", "Conjunto de atributos que identifica cada tupla.", "{cedula, categoria}"],
  ["Tupla", "Fila de una relación; un hecho concreto.", "⟨EXT101, Excel…, 40, 280000, TIC⟩"]
];

/* ---------------------------------------------------------
   TALLER EVALUATIVO
   Las claves de A y C1 se guardan codificadas (no en texto plano).
   --------------------------------------------------------- */
OVA.TALLER = {
  A: [
    { q: "ESTUDIANTE(cod_est, nombre, programa, semestre) tiene 25 tuplas. Su grado es:", opts: ["4", "25", "29", "100"] },
    { q: "CURSO(cod_curso: Códigos, nombre: Nombres, horas: Horas) describe…", opts: ["la intensión de la relación", "la extensión de la relación", "una tupla", "un dominio"] },
    { q: "Una superclave en la que ningún subconjunto propio identifica las tuplas es una…", opts: ["llave candidata", "llave foránea", "llave compuesta", "superclave trivial"] },
    { q: "La condición πFK(r2) ⊆ πPK(r1) ∪ {NULL} expresa la…", opts: ["integridad referencial", "integridad de entidad", "restricción de dominio", "minimalidad"] },
    { q: "En AUTOR 1:N LIBRO, la llave foránea se ubica en…", opts: ["LIBRO", "AUTOR", "una relación intermedia", "ambas relaciones"] },
    { q: "La entidad débil CUOTA (clave parcial num_cuota) depende de PRESTAMO(id_prestamo). Su PK es…", opts: ["{id_prestamo, num_cuota}", "{num_cuota}", "{id_prestamo}", "una llave sustituta obligatoria"] },
    { q: "MEDICO N:M PACIENTE con atributo fecha_cita se traduce…", opts: ["con una relación intermedia que incluye fecha_cita", "con una FK en PACIENTE", "con una FK en MEDICO", "guardando fecha_cita en PACIENTE"] },
    { q: "Una relación ternaria con las tres participaciones «muchos» tiene como PK…", opts: ["las tres llaves foráneas", "la PK de la primera entidad", "una sola FK", "cualquier atributo propio"] },
    { q: "Un atributo multivalorado correos de CLIENTE se traduce…", opts: ["en una nueva relación con PK {id_cliente, correo}", "en una columna con valores separados por comas", "en tres columnas correo1, correo2, correo3", "se omite"] },
    { q: "La acción referencial más adecuada para DETALLE_FACTURA cuando se elimina su FACTURA es…", opts: ["cascada", "fijar a nulo", "ninguna", "valor por defecto"] }
  ],
  requisitos: [
    ["R1", "Cada finca tiene código, nombre, municipio y área en hectáreas. Cada finca es administrada por exactamente un empleado, y un empleado administra como máximo una finca."],
    ["R2", "Cada finca se divide en potreros, numerados dentro de la finca. De cada potrero se registra el área y el tipo de pasto. Un potrero no existe sin su finca."],
    ["R3", "De cada empleado se registra cédula, nombre completo (nombres y apellidos), cargo, fecha de ingreso y uno o varios teléfonos. Se desea conocer su antigüedad en la granja."],
    ["R4", "De cada animal se registra número de chapeta (único), raza, sexo, fecha de nacimiento y peso actual. Cada animal está ubicado en un potrero, y un potrero alberga muchos animales. Se registra la madre de cada animal cuando se conoce; una vaca puede ser madre de varios animales."],
    ["R5", "De cada vacuna se registra código, nombre y laboratorio."],
    ["R6", "Un empleado aplica una vacuna a un animal en una fecha y con una dosis en mililitros. Un mismo animal puede recibir la misma vacuna del mismo empleado en fechas distintas."],
    ["R7", "Los empleados laboran en varias fincas y cada finca cuenta con varios empleados; se registra la fecha de inicio y el turno."]
  ],
  C1: [
    "Insertar POTRERO ⟨F01, 2, 15, Angleton⟩",
    "Insertar ANIMAL ⟨A102, Cebú, H, 2025-01-20, 180, F02, 1, A101⟩",
    "Insertar ANIMAL ⟨A103, Cebú, M, 2025-02-11, 175, F02, 3, A100⟩",
    "Insertar FINCA ⟨F03, La Palma, Lorica, 60, 7801⟩",
    "Insertar dos aplicaciones de V1 a A101 por el mismo empleado (2026-03-01 y 2026-09-01)",
    "Borrar ANIMAL A100"
  ],
  /* Claves codificadas en base64 (no en texto plano). Ver taller.js */
  k: "eyJBIjpbMCwwLDAsMCwwLDAsMCwwLDAsMF0sIkMxIjpbWyJyZWNoYXphIiwiZW50aWRhZCJdLFsicmVjaGF6YSIsInNlbWFudGljYSJdLFsicmVjaGF6YSIsInJlZmVyZW5jaWFsIl0sWyJyZWNoYXphIiwidW5pY28iXSxbImFjZXB0YSIsIm5pbmd1bmEiXSxbImFjZXB0YSIsImZpamFyX251bG8iXV0sIkMyIjpbNCwzLDgsMl0sIkMzIjpbMjQsMjhdfQ=="
};
