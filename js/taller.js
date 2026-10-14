/* =========================================================
   taller.js · Taller evaluativo final: cuestionario (A),
   traducción del caso (B), validación (C), reflexión (D),
   calificación automática de A y C1, e informe imprimible.
   ========================================================= */
(function () {
  "use strict";

  var T = {};
  var esc = function (s) { return OVA.EJ.esc(s == null ? "" : s); };
  var estado = null, detectorC1 = null;

  function claves() {
    try { return JSON.parse(atob(OVA.TALLER.k)); } catch (e) { return null; }
  }
  function guardar() { if (OVA.APP) OVA.APP.guardarTaller(estado); }

  /* Suma de verificación FNV-1a de 32 bits */
  function hash(texto) {
    var h = 0x811c9dc5;
    for (var i = 0; i < texto.length; i++) {
      h ^= texto.charCodeAt(i);
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return ("0000000" + h.toString(16)).slice(-8).toUpperCase();
  }

  function estadoInicial() {
    return {
      nombre: "", codigo: "", grupo: "",
      ordenA: OVA.TALLER.A.map(function (p) { return OVA.EJ.mezclar(p.opts.map(function (_, i) { return i; })); }),
      respA: OVA.TALLER.A.map(function () { return null; }),
      enviadoA: false, puntosA: null,
      B1: "", B2: "", B3: "",
      C1: [], C2: ["", "", "", ""], C3a: "", C3b: "", enviadoC: false, puntosC1: null,
      D1: "", D2: "",
      inicio: new Date().toISOString()
    };
  }

  /* ---------------------------------------------------------
     Construcción de la interfaz
     --------------------------------------------------------- */
  T.render = function (cont) {
    if (!cont) return;
    estado = (OVA.APP && OVA.APP.leerTaller()) || estadoInicial();
    if (!estado.ordenA || estado.ordenA.length !== OVA.TALLER.A.length) estado = estadoInicial();

    var h = "";
    /* Datos del estudiante */
    h += '<div class="tarjeta"><h3>Datos del estudiante</h3><div class="rejilla">' +
      campoTexto("t-nombre", "Nombre completo", estado.nombre) +
      campoTexto("t-codigo", "Código estudiantil", estado.codigo) +
      campoTexto("t-grupo", "Grupo", estado.grupo) + '</div>' +
      '<p class="ayuda" style="color:var(--uc-gris);font-size:.9rem;margin:0">Sus respuestas se guardan automáticamente en este navegador. Al final, genere el informe y guárdelo como PDF para subirlo a la plataforma del curso.</p></div>';

    /* Enunciado */
    h += '<div class="tarjeta tarjeta--cafe"><h3>Enunciado del caso «Granja Experimental»</h3><p>La granja experimental de la Facultad de Medicina Veterinaria y Zootecnia requiere una base de datos para su hato bovino:</p><ul>';
    OVA.TALLER.requisitos.forEach(function (r) { h += '<li><b>' + r[0] + '.</b> ' + esc(r[1]) + '</li>'; });
    h += '</ul></div>';

    /* Parte A */
    h += '<section class="tarjeta parte-taller" aria-labelledby="pA"><div class="encab"><h3 id="pA">Parte A · Cuestionario</h3><span class="pts">20 puntos · 2 por pregunta</span></div>' +
      '<p>Seleccione una respuesta por pregunta. Al enviar la parte A se muestra el puntaje, pero no las respuestas correctas, y ya no podrá modificarla.</p><div class="quiz" id="t-quizA">';
    OVA.TALLER.A.forEach(function (p, i) {
      h += '<div class="preg"><fieldset><legend>' + esc(p.q) + '</legend>';
      estado.ordenA[i].forEach(function (oi) {
        var marcado = estado.respA[i] === oi ? " checked" : "";
        h += '<label class="opcion"><input type="radio" name="tA-' + i + '" value="' + oi + '"' + marcado + (estado.enviadoA ? " disabled" : "") + '> <span>' + esc(p.opts[oi]) + '</span></label>';
      });
      h += '</fieldset></div>';
    });
    h += '</div><div class="fila-botones"><button type="button" class="btn" id="t-enviarA"' + (estado.enviadoA ? " disabled" : "") + '>Enviar parte A</button></div>' +
      '<div id="t-resA" aria-live="polite">' + (estado.enviadoA ? resultadoA() : "") + '</div></section>';

    /* Parte B */
    h += '<section class="tarjeta parte-taller" aria-labelledby="pB"><div class="encab"><h3 id="pB">Parte B · Traducción del caso</h3><span class="pts">50 puntos · calificación docente</span></div>' +
      '<div class="recuadro recuadro--regla"><span class="recuadro__titulo">Notación del OVA (sin SQL)</span>Escriba cada relación como <span class="mono">NOMBRE(atr1, atr2, …)</span>. Marque la PK con guiones bajos alrededor: <span class="mono">_cod_finca_</span>; la FK con asterisco y su destino: <span class="mono">*ced_admin* → EMPLEADO</span>. Use ÚNICO(…), NO NULO(…) y dom(atr) = {…}.</div>' +
      campoArea("t-B1", "B1 · Inventario del diagrama ER (paso 1 · 10 puntos)", "Clasifique entidades (fuertes/débiles), atributos especiales y relaciones con su cardinalidad y participación.", estado.B1,
        "Entidades fuertes: …\nEntidad débil: … (clave parcial: …, propietaria: …)\nAtributos especiales: …\nRelaciones: NOMBRE, ENTIDAD_A 1:N ENTIDAD_B (participación …)") +
      campoArea("t-B2", "B2 · Esquema relacional (pasos 2 a 6 · 25 puntos)", "Escriba todas las relaciones, marque PK y FK, e indique la regla aplicada en cada una.", estado.B2,
        "1. FINCA(_cod_finca_, …)  — regla: …\n2. …") +
      campoArea("t-B3", "B3 · Dominios, llaves e integridad (paso 7 · 15 puntos)", "Dominio y nulos de al menos 12 atributos; candidatas, PK y alternativas por relación; acción referencial justificada para cada FK; al menos dos reglas semánticas.", estado.B3,
        "dom(sexo) = {…}  · nulos: no\n…\nFINCA: candidatas …; PK …; alternativas …\nFK ced_admin → EMPLEADO: al borrar …, porque …\nReglas semánticas: …") +
      '</section>';

    /* Parte C */
    h += '<section class="tarjeta parte-taller" aria-labelledby="pC"><div class="encab"><h3 id="pC">Parte C · Validación y análisis</h3><span class="pts">20 puntos</span></div>' +
      '<h4>C1 · Operaciones sobre una instancia (paso 8 · 12 puntos)</h4>' +
      '<div class="recuadro recuadro--formal" style="text-align:left">FINCA = {⟨F01, La Esperanza, Montería, 120, 7801⟩, ⟨F02, El Recreo, Cereté, 85, 7802⟩}<br>' +
      'POTRERO = {⟨F01, 1, 20, Angleton⟩, ⟨F01, 2, 18, Brachiaria⟩, ⟨F02, 1, 25, Brachiaria⟩}<br>' +
      'ANIMAL = {⟨A100, Romosinuano, H, 2021-02-10, 410, F01, 1, NULL⟩, ⟨A101, Romosinuano, M, 2024-03-05, 260, F01, 2, A100⟩}<br>' +
      'VACUNA = {⟨V1, Aftosa, …⟩}</div>' +
      '<p>Decida si cada operación se acepta o se rechaza y qué restricción actúa, según el esquema que usted propuso en B.</p>' +
      '<div id="t-C1"></div>' +
      '<h4 style="margin-top:20px">C2 · Grado y cardinalidad (paso 8 · 3 puntos)</h4><div class="rejilla">' +
      campoNum("t-C2-0", "deg(POTRERO)", estado.C2[0]) + campoNum("t-C2-1", "|potrero|", estado.C2[1]) +
      campoNum("t-C2-2", "deg(ANIMAL)", estado.C2[2]) + campoNum("t-C2-3", "|animal|", estado.C2[3]) + '</div>' +
      '<h4>C3 · Conteo de superclaves (paso 7 · 5 puntos)</h4><p>FINCA(cod_finca, nombre_finca, municipio, area_ha, ced_admin).</p>' +
      campoArea("t-C3a", "Llaves candidatas y procedimiento", "", estado.C3a, "Candidatas: …\nProcedimiento (inclusión–exclusión): …") +
      campoNum("t-C3b", "Número de superclaves", estado.C3b) +
      '<div class="fila-botones"><button type="button" class="btn" id="t-enviarC"' + (estado.enviadoC ? " disabled" : "") + '>Enviar parte C1</button></div>' +
      '<div id="t-resC" aria-live="polite">' + (estado.enviadoC ? resultadoC() : "") + '</div></section>';

    /* Parte D */
    h += '<section class="tarjeta parte-taller" aria-labelledby="pD"><div class="encab"><h3 id="pD">Parte D · Reflexión</h3><span class="pts">10 puntos · calificación docente</span></div>' +
      campoArea("t-D1", "D1. ¿Por qué la FK de la relación «administra» se ubica en FINCA y no en EMPLEADO? ¿Qué restricción adicional necesita y qué ocurriría sin ella?", "", estado.D1, "") +
      campoArea("t-D2", "D2. Explique por qué la fecha forma parte de la llave primaria de la relación de aplicación de vacunas y compare esa decisión con el uso de una llave sustituta.", "", estado.D2, "") +
      '</section>';

    /* Cierre */
    h += '<div class="tarjeta tarjeta--verde"><h3>Finalizar</h3><p>Revise la lista de verificación del Módulo 6 antes de generar el informe. El informe incluye sus respuestas, los puntajes automáticos, la fecha y una suma de verificación.</p>' +
      '<div class="fila-botones"><button type="button" class="btn btn--cafe" id="t-informe">Generar informe imprimible</button>' +
      '<button type="button" class="btn btn--sec" id="t-borrar">Borrar mis respuestas</button></div><div id="t-avisos" class="retro" aria-live="polite"></div></div>';

    cont.innerHTML = h;

    /* Detector C1 en modo taller */
    detectorC1 = OVA.EJ.detector(cont.querySelector("#t-C1"), OVA.TALLER.C1, "taller-c1", true);
    detectorC1.fijar(estado.C1);
    if (estado.enviadoC) detectorC1.bloquear();

    enlazar(cont);
  };

  function campoTexto(id, etiqueta, valor) {
    return '<div class="campo"><label for="' + id + '">' + etiqueta + '</label><input type="text" id="' + id + '" value="' + esc(valor) + '" autocomplete="off"></div>';
  }
  function campoNum(id, etiqueta, valor) {
    return '<div class="campo"><label for="' + id + '">' + etiqueta + '</label><input type="number" min="0" step="1" id="' + id + '" value="' + esc(valor) + '"></div>';
  }
  function campoArea(id, etiqueta, ayuda, valor, ph) {
    return '<div class="campo"><label for="' + id + '">' + etiqueta + '</label>' + (ayuda ? '<span class="ayuda">' + esc(ayuda) + '</span>' : "") +
      '<textarea id="' + id + '" placeholder="' + esc(ph) + '">' + esc(valor) + '</textarea></div>';
  }

  function resultadoA() {
    return '<p class="estado-envio">Parte A enviada. Puntaje automático: ' + estado.puntosA + ' de 20.</p>';
  }
  function resultadoC() {
    return '<p class="estado-envio">Parte C1 enviada. Puntaje automático: ' + estado.puntosC1 + ' de 12 (el docente revisa la coherencia con su esquema). C2 y C3 los califica el docente.</p>';
  }

  /* ---------------------------------------------------------
     Eventos y guardado automático
     --------------------------------------------------------- */
  function enlazar(cont) {
    var mapa = { "t-nombre": "nombre", "t-codigo": "codigo", "t-grupo": "grupo", "t-B1": "B1", "t-B2": "B2", "t-B3": "B3", "t-C3a": "C3a", "t-C3b": "C3b", "t-D1": "D1", "t-D2": "D2" };
    Object.keys(mapa).forEach(function (id) {
      var el = cont.querySelector("#" + id);
      if (el) el.addEventListener("input", function () { estado[mapa[id]] = el.value; guardar(); });
    });
    [0, 1, 2, 3].forEach(function (i) {
      var el = cont.querySelector("#t-C2-" + i);
      el.addEventListener("input", function () { estado.C2[i] = el.value; guardar(); });
    });
    cont.querySelectorAll('#t-quizA input[type="radio"]').forEach(function (r) {
      r.addEventListener("change", function () {
        var i = parseInt(r.name.split("-")[1], 10);
        estado.respA[i] = parseInt(r.value, 10); guardar();
      });
    });
    cont.querySelector("#t-C1").addEventListener("change", function () { estado.C1 = detectorC1.respuestas(); guardar(); });

    cont.querySelector("#t-enviarA").addEventListener("click", function () {
      var faltan = estado.respA.filter(function (v) { return v === null; }).length;
      if (faltan && !confirm("Hay " + faltan + " pregunta(s) sin responder. ¿Desea enviar la parte A de todos modos?")) return;
      var k = claves(); if (!k) return;
      var buenas = 0;
      estado.respA.forEach(function (v, i) { if (v === k.A[i]) buenas++; });
      estado.puntosA = buenas * 2; estado.enviadoA = true; guardar();
      cont.querySelectorAll('#t-quizA input').forEach(function (r) { r.disabled = true; });
      this.disabled = true;
      cont.querySelector("#t-resA").innerHTML = resultadoA();
    });

    cont.querySelector("#t-enviarC").addEventListener("click", function () {
      estado.C1 = detectorC1.respuestas();
      var incompletas = estado.C1.filter(function (r) { return !r[0] || !r[1]; }).length;
      if (incompletas && !confirm("Hay " + incompletas + " operación(es) incompletas. ¿Desea enviar C1 de todos modos?")) return;
      var k = claves(); if (!k) return;
      var buenas = 0;
      estado.C1.forEach(function (r, i) { if (r[0] === k.C1[i][0] && r[1] === k.C1[i][1]) buenas++; });
      estado.puntosC1 = buenas * 2; estado.enviadoC = true; guardar();
      detectorC1.bloquear(); this.disabled = true;
      cont.querySelector("#t-resC").innerHTML = resultadoC();
    });

    cont.querySelector("#t-informe").addEventListener("click", function () { generarInforme(cont); });
    cont.querySelector("#t-borrar").addEventListener("click", function () {
      if (!confirm("Se borrarán todas sus respuestas del taller en este navegador. ¿Continuar?")) return;
      if (OVA.APP) OVA.APP.guardarTaller(null);
      T.render(cont);
    });
  }

  /* ---------------------------------------------------------
     Informe imprimible
     --------------------------------------------------------- */
  function generarInforme(cont) {
    var avisos = cont.querySelector("#t-avisos");
    var faltan = [];
    if (!estado.nombre.trim()) faltan.push("nombre");
    if (!estado.codigo.trim()) faltan.push("código");
    if (!estado.enviadoA) faltan.push("enviar la parte A");
    if (!estado.enviadoC) faltan.push("enviar la parte C1");
    if (faltan.length) {
      avisos.className = "retro mal";
      avisos.textContent = "Antes de generar el informe complete: " + faltan.join(", ") + ".";
      return;
    }
    avisos.className = "retro"; avisos.textContent = "";

    var k = claves();
    var c2 = estado.C2.map(function (v, i) { return parseInt(v, 10) === k.C2[i]; }).filter(Boolean).length;
    var c3 = k.C3.indexOf(parseInt(estado.C3b, 10)) >= 0;
    var ahora = new Date();
    var respuestas = JSON.stringify([estado.nombre, estado.codigo, estado.respA, estado.B1, estado.B2, estado.B3, estado.C1, estado.C2, estado.C3a, estado.C3b, estado.D1, estado.D2]);
    var suma = hash(respuestas + "|" + ahora.toISOString());
    var etiquetaR = {}; OVA.RESTRICCIONES.forEach(function (r) { etiquetaR[r[0]] = r[1]; });

    var h = '<h1>Taller evaluativo · Traducción del Modelo ER al Modelo Relacional</h1>' +
      '<table class="meta"><tr><td><b>Estudiante:</b></td><td>' + esc(estado.nombre) + '</td></tr>' +
      '<tr><td><b>Código:</b></td><td>' + esc(estado.codigo) + '</td></tr>' +
      '<tr><td><b>Grupo:</b></td><td>' + esc(estado.grupo) + '</td></tr>' +
      '<tr><td><b>Fecha:</b></td><td>' + ahora.toLocaleString("es-CO") + '</td></tr>' +
      '<tr><td><b>Curso:</b></td><td>Bases de Datos (FDOC-088) · Universidad de Córdoba · Ing. Alexander Fernández Arango, Mg.S.I.</td></tr></table>';

    h += '<h2>Resumen de puntajes</h2><table class="tabla"><thead><tr><th>Parte</th><th>Puntaje</th><th>Máximo</th></tr></thead><tbody>' +
      '<tr><td>A · Cuestionario (automático)</td><td>' + estado.puntosA + '</td><td>20</td></tr>' +
      '<tr><td>B · Traducción del caso</td><td>Por calificar (docente)</td><td>50</td></tr>' +
      '<tr><td>C1 · Operaciones (automático)</td><td>' + estado.puntosC1 + '</td><td>12</td></tr>' +
      '<tr><td>C2 · Grado y cardinalidad</td><td>Por calificar (' + c2 + ' de 4 valores coinciden con la clave)</td><td>3</td></tr>' +
      '<tr><td>C3 · Superclaves</td><td>Por calificar (conteo ' + (c3 ? "coincide" : "no coincide") + ' con la clave)</td><td>5</td></tr>' +
      '<tr><td>D · Reflexión</td><td>Por calificar (docente)</td><td>10</td></tr></tbody></table>';

    h += '<h2>Parte A · Respuestas</h2><ol>';
    OVA.TALLER.A.forEach(function (p, i) {
      var r = estado.respA[i];
      h += '<li>' + esc(p.q) + '<br><i>' + (r === null ? "Sin responder" : esc(p.opts[r])) + '</i></li>';
    });
    h += '</ol>';
    h += '<h2>B1 · Inventario</h2><div class="resp">' + esc(estado.B1 || "—") + '</div>';
    h += '<h2>B2 · Esquema relacional</h2><div class="resp">' + esc(estado.B2 || "—") + '</div>';
    h += '<h2>B3 · Dominios, llaves e integridad</h2><div class="resp">' + esc(estado.B3 || "—") + '</div>';
    h += '<h2>C1 · Operaciones</h2><ol>';
    OVA.TALLER.C1.forEach(function (o, i) {
      var r = estado.C1[i] || ["", ""];
      h += '<li>' + esc(o) + ' → <b>' + (r[0] === "acepta" ? "Se acepta" : r[0] === "rechaza" ? "Se rechaza" : "—") + '</b> · ' + esc(etiquetaR[r[1]] || "—") + '</li>';
    });
    h += '</ol>';
    h += '<h2>C2 · Grado y cardinalidad</h2><p>deg(POTRERO) = ' + esc(estado.C2[0] || "—") + ' · |potrero| = ' + esc(estado.C2[1] || "—") +
      ' · deg(ANIMAL) = ' + esc(estado.C2[2] || "—") + ' · |animal| = ' + esc(estado.C2[3] || "—") + '</p>';
    h += '<h2>C3 · Superclaves</h2><div class="resp">' + esc(estado.C3a || "—") + '</div><p>Número de superclaves: ' + esc(estado.C3b || "—") + '</p>';
    h += '<h2>D · Reflexión</h2><p><b>D1.</b></p><div class="resp">' + esc(estado.D1 || "—") + '</div><p><b>D2.</b></p><div class="resp">' + esc(estado.D2 || "—") + '</div>';
    h += '<p class="firma">Suma de verificación: <b>' + suma + '</b> · Generado por el OVA «Traducción del Modelo ER», versión ' + esc(OVA.CONFIG.version) + '. Universidad de Córdoba · Vigilada MinEducación.</p>';

    var inf = document.getElementById("informe");
    inf.innerHTML = h;
    document.body.classList.add("imprimiendo-informe");
    var limpiar = function () { document.body.classList.remove("imprimiendo-informe"); window.removeEventListener("afterprint", limpiar); };
    window.addEventListener("afterprint", limpiar);
    setTimeout(function () { window.print(); setTimeout(limpiar, 1000); }, 50);
  }

  OVA.TALLER_UI = T;
})();
