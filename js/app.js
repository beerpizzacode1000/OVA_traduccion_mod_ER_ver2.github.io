/* =========================================================
   app.js · Navegación por hash, progreso, barra del proceso,
   visor del caso guiado (M4), lista de verificación, glosario
   e inicialización de los componentes de cada sección.
   ========================================================= */
(function () {
  "use strict";

  var SECCIONES = ["inicio", "m1", "m2", "m3", "m4", "m5", "m6", "taller", "glosario", "referencias"];
  var esc = function (s) { return OVA.EJ.esc(s); };

  /* ---------------------------------------------------------
     Persistencia (localStorage protegido con try/catch)
     --------------------------------------------------------- */
  var prog = { visto: {}, puntajes: {}, m4: { ctrl: {}, paso: 1 }, checklist: {}, taller: null };
  function cargar() {
    try {
      var t = window.localStorage.getItem(OVA.CONFIG.claveAlmacen);
      if (t) {
        var p = JSON.parse(t);
        prog.visto = p.visto || {}; prog.puntajes = p.puntajes || {};
        prog.m4 = p.m4 || prog.m4; prog.m4.ctrl = prog.m4.ctrl || {};
        prog.checklist = p.checklist || {}; prog.taller = p.taller || null;
      }
    } catch (e) { /* almacenamiento no disponible: el OVA sigue funcionando */ }
  }
  function persistir() {
    try { window.localStorage.setItem(OVA.CONFIG.claveAlmacen, JSON.stringify(prog)); } catch (e) { }
    actualizarMenu();
  }

  var APP = {
    registrarPuntaje: function (clave, ok, total) {
      var prev = prog.puntajes[clave];
      if (!prev || ok / total >= prev.ok / prev.total) prog.puntajes[clave] = { ok: ok, total: total };
      persistir();
    },
    guardarTaller: function (e) { prog.taller = e; persistir(); },
    leerTaller: function () { return prog.taller; },
    tallerDisponible: tallerDisponible
  };
  OVA.APP = APP;

  function m4Completo() {
    for (var i = 1; i <= 8; i++) if (!prog.m4.ctrl[i]) return false;
    return true;
  }
  function tallerDisponible() {
    if (OVA.CONFIG.tallerSiempreDisponible) return true;
    if (/[?&]docente=1/.test(window.location.search)) return true;
    return m4Completo();
  }

  function seccionCompleta(s) {
    var p = prog.puntajes;
    switch (s) {
      case "inicio": return !!prog.visto.inicio;
      case "m1": return !!p.m1;
      case "m2": return !!p.m2;
      case "m3": return !!p.m3;
      case "m4": return m4Completo();
      case "m5": return ["m5-clasificar", "m5-fk", "m5-constructor", "m5-llaves", "m5-detector", "m5-vf"].filter(function (k) { return p[k]; }).length >= 3;
      case "m6": return !!prog.visto.m6;
      case "taller": return !!(prog.taller && prog.taller.enviadoA && prog.taller.enviadoC);
      default: return false;
    }
  }

  /* ---------------------------------------------------------
     Menú lateral
     --------------------------------------------------------- */
  function actualizarMenu() {
    var principales = ["inicio", "m1", "m2", "m3", "m4", "m5", "m6", "taller"], hechas = 0;
    document.querySelectorAll(".menu a[data-sec]").forEach(function (a) {
      var s = a.getAttribute("data-sec");
      var comp = seccionCompleta(s);
      if (principales.indexOf(s) >= 0 && comp) hechas++;
      a.classList.toggle("completo", comp);
      a.classList.toggle("visto", !!prog.visto[s] && !comp);
      var marca = a.querySelector(".menu__marca");
      if (s === "taller" && !tallerDisponible()) { a.classList.add("bloqueado"); marca.textContent = "🔒"; }
      else { a.classList.remove("bloqueado"); marca.textContent = comp ? "✓" : ""; }
    });
    var pct = Math.round(100 * hechas / principales.length);
    var barra = document.querySelector(".menu .barra-avance > span");
    if (barra) barra.style.width = pct + "%";
    var txt = document.getElementById("avance-txt");
    if (txt) txt.textContent = pct + " % completado";
  }

  /* ---------------------------------------------------------
     Barra del proceso de 8 pasos
     --------------------------------------------------------- */
  function construirProceso() {
    var ol = document.getElementById("proceso-lista");
    ol.innerHTML = OVA.PASOS.map(function (p) {
      return '<li><button type="button" class="estacion" data-paso="' + p.n + '" aria-label="Paso ' + p.n + ': ' + esc(p.nombre) + '" aria-haspopup="dialog">' +
        '<span class="estacion__num"><span>' + p.n + '</span></span><span class="estacion__txt">' + esc(p.corto) + '</span></button></li>';
    }).join("");
    ol.querySelectorAll(".estacion").forEach(function (b) {
      b.addEventListener("click", function () { mostrarPopover(parseInt(b.getAttribute("data-paso"), 10), b); });
    });
  }
  function marcarProceso(seccion, pasoActivo) {
    var rel = OVA.PASOS_SECCION[seccion] || [];
    document.querySelectorAll(".estacion").forEach(function (b) {
      var n = parseInt(b.getAttribute("data-paso"), 10);
      b.classList.toggle("relevante", rel.indexOf(n) >= 0);
      b.classList.toggle("activa", n === pasoActivo);
      b.classList.toggle("hecha", seccion === "m4" && !!prog.m4.ctrl[n] && n !== pasoActivo);
      if (n === pasoActivo) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
    });
  }
  var popoverOrigen = null;
  function mostrarPopover(n, origen) {
    var p = OVA.PASOS[n - 1], pop = document.getElementById("popover-paso");
    pop.innerHTML = '<button type="button" class="btn-texto cerrar" aria-label="Cerrar">✕</button>' +
      '<h3>Paso ' + p.n + ' · ' + esc(p.nombre) + '</h3><p><b>Pregunta guía:</b> ' + esc(p.pregunta) + '</p>' +
      '<p><b>Regla:</b> ' + esc(p.regla) + '</p><p><b>Producto:</b> ' + esc(p.producto) + ' <small>(' + p.tema + ')</small></p>' +
      '<a class="btn btn--peq" href="#m4/' + p.n + '">Ver este paso en el caso guiado</a>';
    pop.hidden = false; popoverOrigen = origen;
    pop.querySelector(".cerrar").focus();
    pop.querySelector(".cerrar").addEventListener("click", cerrarPopover);
    pop.querySelector("a").addEventListener("click", cerrarPopover);
  }
  function cerrarPopover() {
    var pop = document.getElementById("popover-paso");
    if (pop.hidden) return;
    pop.hidden = true;
    if (popoverOrigen) popoverOrigen.focus();
  }

  /* ---------------------------------------------------------
     Navegación por hash: #m4/3
     --------------------------------------------------------- */
  var iniciadas = {};
  function ruta() {
    var h = (window.location.hash || "#inicio").slice(1).split("/");
    var s = SECCIONES.indexOf(h[0]) >= 0 ? h[0] : "inicio";
    return { sec: s, sub: h[1] ? parseInt(h[1], 10) : null };
  }
  function mostrar() {
    var r = ruta();
    SECCIONES.forEach(function (s) {
      var el = document.getElementById("sec-" + s);
      if (el) el.hidden = s !== r.sec;
    });
    document.querySelectorAll(".menu a[data-sec]").forEach(function (a) {
      if (a.getAttribute("data-sec") === r.sec) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    prog.visto[r.sec] = true; persistir();
    iniciarSeccion(r.sec);
    var pasoActivo = null;
    if (r.sec === "m4") { pasoActivo = irPaso(r.sub || prog.m4.paso || 1, !!r.sub); }
    marcarProceso(r.sec, pasoActivo);
    cerrarPopover();
    document.getElementById("menu").classList.remove("abierto");
    var titulo = document.querySelector("#sec-" + r.sec + " h1");
    document.title = (titulo ? titulo.textContent + " · " : "") + "OVA Traducción ER · Universidad de Córdoba";
    if (!r.sub) window.scrollTo(0, 0);
    var foco = document.getElementById("sec-" + r.sec);
    if (foco) { foco.setAttribute("tabindex", "-1"); foco.focus({ preventScroll: true }); }
  }

  function iniciarSeccion(s) {
    if (s === "taller") { renderTaller(); return; }
    if (iniciadas[s]) return;
    iniciadas[s] = true;
    var $ = function (id) { return document.getElementById(id); };
    switch (s) {
      case "m1":
        OVA.EJ.anatomia($("anatomia"));
        OVA.EJ.quiz($("quiz-m1"), OVA.QUIZ.m1, "m1");
        break;
      case "m2":
        OVA.EJ.cartesiano($("cartesiano"));
        OVA.EJ.buscadorLlaves($("buscador-m2"));
        OVA.EJ.quiz($("quiz-m2"), OVA.QUIZ.m2, "m2");
        break;
      case "m3":
        OVA.EJ.arbol($("arbol"));
        OVA.EJ.quiz($("quiz-m3"), OVA.QUIZ.m3, "m3");
        break;
      case "m4":
        construirCaso();
        break;
      case "m5":
        OVA.EJ.selectores($("lab-clasificar"), OVA.LAB.clasificar, OVA.CASO.categorias, "m5-clasificar");
        OVA.EJ.selectores($("lab-fk"), OVA.LAB.fk, OVA.LAB.opcionesFK, "m5-fk");
        OVA.EJ.constructor($("lab-constructor"));
        OVA.EJ.quiz($("lab-llaves-quiz"), [
          { q: "VEHICULO(placa, num_motor, num_chasis, color, modelo): placa, num_motor y num_chasis no se repiten. ¿Cuáles son las llaves candidatas?",
            opts: ["{placa}, {num_motor}, {num_chasis}", "Solo {placa}", "{placa, num_motor, num_chasis}", "{color, modelo}"], ok: 0,
            fb: "Cada uno identifica por sí solo y es minimal." },
          { q: "¿Es {color, modelo} una llave?", opts: ["Sí, es candidata", "Sí, es superclave", "No: muchos vehículos comparten color y modelo", "Solo si no hay nulos"], ok: 2,
            fb: "La combinación puede repetirse." },
          { q: "Si se elige placa como PK, ¿qué se hace con num_motor y num_chasis?", opts: ["Se eliminan", "Se marcan ÚNICO como llaves alternativas", "Se convierten en llaves foráneas", "Se dejan sin restricción"], ok: 1,
            fb: "Las candidatas no elegidas son alternativas y se declaran ÚNICO." }
        ], "m5-llaves");
        OVA.EJ.numerico($("lab-llaves-num"), 28, "m5-llaves-num", "3·2⁴ − 3·2³ + 2² = 48 − 24 + 4 = 28 superclaves.");
        OVA.EJ.detector($("lab-detector"), OVA.LAB.violaciones, "m5-detector");
        OVA.EJ.quiz($("lab-vf"), OVA.LAB.vf, "m5-vf");
        break;
      case "m6":
        construirChecklist();
        break;
      case "glosario":
        construirGlosario($("glosario-lista"), $("glosario-buscar"));
        break;
    }
  }

  /* ---------------------------------------------------------
     M4 · Visor del caso guiado
     --------------------------------------------------------- */
  var pasoActual = 1;

  function esquemaHTML(n) {
    var h = '<div class="esquema">';
    OVA.CASO.relaciones.forEach(function (r) {
      if (r.paso > n) return;
      var atrs = r.atrs.filter(function (a) { return a.paso <= n; }).map(function (a) {
        var cls = "atr" + (a.pk ? " pk" : "") + (a.fk ? " fk" : "") + (a.paso === n && r.paso !== n ? " recien" : "");
        var titulo = (a.pk ? "Llave primaria" : "") + (a.pk && a.fk ? " y " : "") + (a.fk ? "llave foránea → " + a.fk : "");
        var icono = a.pk ? '<span class="icono" aria-hidden="true">🔑</span>' : (a.fk ? '<span class="icono" aria-hidden="true">🔗</span>' : "");
        return '<span class="' + cls + '"' + (titulo ? ' title="' + titulo + '"' : "") + '>' + icono + a.n + (titulo ? '<span class="sr-only"> (' + titulo + ')</span>' : "") + '</span>';
      }).join(", ");
      var pend = r.pend && n < r.pend.hasta ? ' <span class="rel__pend">— ' + r.pend.t + '</span>' : "";
      var notas = (r.notas || []).filter(function (x) { return x.paso <= n; }).map(function (x) { return x.t; }).join(" · ");
      h += '<div class="rel' + (r.paso === n ? " nueva" : "") + '"><span class="rel__nombre">' + r.id + '</span>(' + atrs + ')' + pend +
        (notas ? '<span class="rel__notas">' + notas + '</span>' : "") + '</div>';
    });
    return h + '</div>';
  }

  function tablaSimple(enc, filas, caption) {
    return '<div class="tabla-env"><table class="tabla">' + (caption ? '<caption>' + caption + '</caption>' : "") +
      '<thead><tr>' + enc.map(function (e) { return '<th scope="col">' + e + '</th>'; }).join("") + '</tr></thead><tbody>' +
      filas.map(function (f) { return '<tr>' + f.map(function (c) { return '<td>' + c + '</td>'; }).join("") + '</tr>'; }).join("") +
      '</tbody></table></div>';
  }

  function regla(t) { return '<div class="recuadro recuadro--regla"><span class="recuadro__titulo">Regla aplicada</span>' + t + '</div>'; }
  function ysi(t) { return '<div class="recuadro recuadro--ysi"><span class="recuadro__titulo">¿Y si…?</span>' + t + '</div>'; }
  function porque(q, a) { return '<details class="despliega"><summary>' + q + '</summary><div><p>' + a + '</p></div></details>'; }

  function contenidoPaso(n) {
    var P = OVA.PASOS[n - 1];
    var h = '<p class="etiqueta" style="color:var(--uc-cafe);font-weight:700;margin:0">PASO ' + n + ' DE 8 · ' + P.tema.toUpperCase() + '</p>' +
      '<h2>' + esc(P.nombre) + '</h2><p class="pregunta-guia">Pregunta guía: ' + esc(P.pregunta) + '</p>';
    switch (n) {
      case 1:
        h += regla("<p>" + esc(P.regla) + "</p>") +
          '<p>Clasifique cada elemento del diagrama. Al comprobar verá la justificación de cada uno.</p><div id="caso-clasificar"></div>';
        break;
      case 2:
        h += regla("<p>Cada entidad fuerte genera una relación con sus atributos simples y su identificador como llave primaria. Los atributos especiales quedan <b>pendientes</b> para el paso 4.</p>") +
          '<h3>Esquema tras el paso 2</h3>' + esquemaHTML(2);
        break;
      case 3:
        h += regla("<p>La relación de la entidad débil recibe la PK de la propietaria; su PK es la combinación de esa FK con la clave parcial. La relación identificadora TIENE queda absorbida y <b>no genera relación propia</b>.</p>") +
          '<h3>Esquema tras el paso 3</h3>' + esquemaHTML(3) +
          porque("¿Por qué no basta num_salon como PK?", "Porque el salón 101 existe en Montería y en Lorica: num_salon se repite entre sedes. Solo la combinación {cod_sede, num_salon} identifica un salón.");
        break;
      case 4:
        h += regla("<p>Compuesto → una columna por componente · Multivalorado → nueva relación + FK · Derivado → no se almacena · Opcional → admite NULL.</p>") +
          tablaSimple(["Atributo", "Regla", "Resultado"], [
            ["nombre (compuesto)", "Una columna por componente", "DOCENTE y PARTICIPANTE reciben nombres y apellidos"],
            ["telefono de DOCENTE (multivalorado)", "Nueva relación con la PK de la entidad + el valor", '<span class="mono">TELEFONO_DOCENTE(<u><i>cedula</i>, telefono</u>)</span>'],
            ["edad (derivado)", "No se almacena", "Se conserva fecha_nac; la edad se calcula al consultar"],
            ["email de PARTICIPANTE (opcional)", "Admite NULL", "email ∈ dom(email) ∪ {NULL}"]
          ]) + '<h3>Esquema tras el paso 4</h3>' + esquemaHTML(4);
        break;
      case 5:
        h += regla("<p><b>OFRECE (AREA 1:N CURSO):</b> la FK va en el lado N. Como todo curso pertenece a un área (participación total), es obligatoria.</p><p><b>COORDINA (DOCENTE 1:1 SEDE):</b> la FK va en SEDE, el lado de participación total; se renombra según el rol (<i>ced_coordinador</i>) y se marca <b>ÚNICO</b> para que un docente no coordine dos sedes.</p>") +
          '<h3>Esquema tras el paso 5</h3>' + esquemaHTML(5) +
          porque("¿Qué pasaría si la FK de COORDINA se colocara en DOCENTE?", "La mayoría de docentes no coordinan, así que la columna quedaría en NULL en casi todas las tuplas. El diseño sería válido, pero menos conveniente.") +
          porque("¿Por qué ÚNICO en ced_coordinador?", "Sin esa restricción, el mismo docente podría coordinar dos sedes y la relación se degradaría a 1:N.");
        break;
      case 6:
        h += regla("<p><b>INSCRIBE (N:M):</b> relación intermedia con las dos PK; los atributos de la relación (fecha_insc, nota_final) viven aquí.</p><p><b>REQUIERE (reflexiva N:M):</b> la PK de CURSO aparece dos veces, renombrada según el rol (cod_curso, cod_curso_req).</p><p><b>IMPARTE (ternaria):</b> las PK de las tres participantes más el atributo horario. La PK de SALON es compuesta, así que llega como FK compuesta {cod_sede, num_salon} que referencia a <b>SALON</b>, no a SEDE.</p>") +
          '<h3>Esquema tras el paso 6</h3>' + esquemaHTML(6) +
          ysi("<p>Si el mismo docente impartiera el mismo curso en el mismo salón en dos periodos distintos, la PK actual lo impediría. La solución es añadir <i>periodo</i> a la relación y a su PK, igual que la llave sustituta del ejemplo de la biblioteca resuelve los préstamos repetidos.</p>");
        break;
      case 7:
        h += regla("<p>Se aplica el procedimiento del Módulo 2: dominio por atributo; superclave → candidata → primaria; alternativas marcadas ÚNICO; FK con el mismo dominio de la PK referenciada; acción referencial según la semántica.</p>") +
          tablaSimple(["Atributo", "Dominio", "Nulos"], [
            ["cod_sede", "Cadena de 3 letras mayúsculas, p. ej. {MON, BER, LOR}", "No"],
            ["num_salon", "{x ∈ ℕ | 100 ≤ x ≤ 499}", "No"],
            ["capacidad", "{x ∈ ℕ | 1 ≤ x ≤ 200}", "No"],
            ["tipo", "{Aula, Laboratorio, Auditorio}", "No"],
            ["cedula, doc_part, ced_coordinador", "Cadena numérica de 6 a 10 dígitos", "No"],
            ["email", "Cadena con formato usuario@dominio", "DOCENTE no; PARTICIPANTE sí"],
            ["fecha_nac", "Fechas válidas; regla: el docente es mayor de 18 años", "No"],
            ["categoria", "{Auxiliar, Asistente, Asociado, Titular}", "No"],
            ["cod_area", "Cadena de 3 letras mayúsculas", "No"],
            ["cod_curso, cod_curso_req", "«EXT» seguido de 3 dígitos", "No"],
            ["horas", "{x ∈ ℕ | 8 ≤ x ≤ 160}", "No"],
            ["valor", "{x ∈ ℝ | x ≥ 0}, pesos colombianos", "No"],
            ["fecha_insc", "Fechas válidas", "No"],
            ["nota_final", "{0.0, 0.1, …, 5.0}", "Sí, hasta que termina el curso"],
            ["horario", "Cadena «día hh:mm–hh:mm», p. ej. «Sáb 08:00–12:00»", "No"],
            ["telefono", "Cadena de 10 dígitos", "No"]
          ], "Dominios") +
          tablaSimple(["Relación", "Llave primaria", "Alternativas", "Llaves foráneas", "Al borrar la tupla referenciada"], [
            ["AREA", "cod_area", "nombre_area", "—", "—"],
            ["SEDE", "cod_sede", "nombre_sede, ced_coordinador", "ced_coordinador → DOCENTE", "Restringir: reasignar la coordinación antes"],
            ["DOCENTE", "cedula", "email", "—", "—"],
            ["TELEFONO_DOCENTE", "{cedula, telefono}", "—", "cedula → DOCENTE", "Cascada"],
            ["SALON", "{cod_sede, num_salon}", "—", "cod_sede → SEDE", "Cascada: el salón no existe sin su sede"],
            ["CURSO", "cod_curso", "—", "cod_area → AREA", "Restringir"],
            ["PARTICIPANTE", "doc_part", "email (si no es nulo)", "—", "—"],
            ["INSCRIPCION", "{doc_part, cod_curso}", "—", "doc_part → PARTICIPANTE; cod_curso → CURSO", "Cascada desde PARTICIPANTE; restringir desde CURSO"],
            ["PRERREQUISITO", "{cod_curso, cod_curso_req}", "—", "ambas → CURSO", "Cascada"],
            ["IMPARTE", "{cedula, cod_curso, cod_sede, num_salon}", "—", "cedula → DOCENTE; cod_curso → CURSO; (cod_sede, num_salon) → SALON", "Restringir en las tres"]
          ], "Llaves e integridad referencial") +
          '<h3>Esquema anotado tras el paso 7</h3>' + esquemaHTML(7);
        break;
      case 8:
        h += regla("<p>Se puebla el esquema con una instancia y se decide qué operaciones se aceptan y cuáles se rechazan, y qué restricción actúa en cada caso.</p>") +
          tablaSimple(["Relación", "Tuplas (extracto)"], [
            ["AREA", "⟨TIC, Tecnologías de la información, …⟩, ⟨ADM, Administración y gestión, …⟩"],
            ["SEDE", "⟨MON, Sede Central, Montería, 10670001⟩, ⟨BER, Sede Berástegui, Ciénaga de Oro, 10670002⟩, ⟨LOR, Sede Lorica, Lorica, 10670003⟩"],
            ["DOCENTE", "⟨10670001, Ana María, Pérez Díaz, …, Asociado⟩, ⟨10670002, Luis Carlos, Gómez Ruiz, …, Titular⟩, ⟨10670003, María José, Ruiz Petro, …, Asistente⟩, ⟨10670004, Jorge, Martínez Lora, …, Auxiliar⟩"],
            ["SALON", "⟨MON, 101, 40, Aula⟩, ⟨MON, 201, 25, Laboratorio⟩, ⟨LOR, 101, 35, Aula⟩, ⟨BER, 105, 30, Aula⟩"],
            ["CURSO", "⟨EXT101, Excel para la gestión empresarial, 40, 280000, TIC⟩, ⟨EXT102, Fundamentos de Python, 60, 350000, TIC⟩, ⟨EXT205, Gestión de proyectos ágiles, 48, 320000, ADM⟩"],
            ["PARTICIPANTE", "⟨1003456789, Camila, Ortiz Banda, NULL, 3005551234⟩, ⟨1067890123, Andrés, Lugo Hoyos, alugo@correo.com, 3015559876⟩"],
            ["INSCRIPCION", "⟨1003456789, EXT101, 2026-08-03, 4.5⟩, ⟨1003456789, EXT102, 2026-08-03, NULL⟩, ⟨1067890123, EXT101, 2026-08-05, 3.8⟩"],
            ["PRERREQUISITO", "⟨EXT205, EXT101⟩"],
            ["IMPARTE", "⟨10670003, EXT102, MON, 201, Sáb 08:00–12:00⟩, ⟨10670004, EXT101, LOR, 101, Vie 14:00–18:00⟩"]
          ], "Instancia de ejemplo") +
          '<h3>Operaciones a evaluar</h3><div id="caso-detector"></div>' +
          '<div class="recuadro recuadro--formal">deg(IMPARTE) = 5 · |imparte| = 2 · deg(SALON) = 4 · |salon| = 4<br>π<sub>cod_sede</sub>(salon) = {MON, LOR, BER} ⊆ π<sub>cod_sede</sub>(sede) ✓</div>' +
          '<div class="recuadro recuadro--aviso"><span class="recuadro__titulo">Verificación introductoria de calidad</span><p>Si CURSO guardara también nombre_area, «Tecnologías de la información» se repetiría en cada curso TIC. Cambiarlo exigiría actualizar varias tuplas (anomalía de modificación) y borrar el último curso del área haría perder el área (anomalía de eliminación). El esquema obtenido evita el problema porque cada dato se almacena una sola vez.</p></div>' +
          '<h3>Esquema relacional final</h3>' + esquemaHTML(8);
        break;
    }
    /* Pregunta de control */
    var c = OVA.CASO.control[n], resuelta = !!prog.m4.ctrl[n];
    h += '<div class="control"><p class="control__titulo">Pregunta de control · necesaria para avanzar</p><fieldset style="border:0;padding:0;margin:0"><legend style="font-weight:700;margin-bottom:6px">' + esc(c.q) + '</legend>';
    c.opts.forEach(function (o, i) {
      h += '<label class="opcion' + (resuelta && i === c.ok ? " correcta" : "") + '"><input type="radio" name="ctrl-' + n + '" value="' + i + '"' + (resuelta && i === c.ok ? " checked" : "") + '> <span>' + esc(o) + '</span></label>';
    });
    h += '</fieldset><div class="fila-botones"><button type="button" class="btn" data-acc="ctrl">Comprobar</button></div>' +
      '<div class="retro' + (resuelta ? " ok" : "") + '" aria-live="polite">' + (resuelta ? "Correcto. " + esc(c.fb) : "") + '</div></div>';

    h += '<div class="navegacion-pie" style="margin-top:16px">' +
      (n > 1 ? '<button type="button" class="btn btn--sec" data-ir="' + (n - 1) + '">← Paso ' + (n - 1) + '</button>' : '<span></span>') +
      (n < 8 ? '<button type="button" class="btn" data-ir="' + (n + 1) + '"' + (resuelta ? "" : " disabled") + '>Paso ' + (n + 1) + ' →</button>'
             : '<a class="btn" href="#m5"' + (resuelta ? "" : ' aria-disabled="true"') + '>Ir al laboratorio →</a>') + '</div>';
    return h;
  }

  function construirCaso() {
    var req = document.getElementById("caso-requisitos");
    req.innerHTML = OVA.CASO.requisitos.map(function (r) { return '<li><b>' + r[0] + '.</b> ' + esc(r[1]) + '</li>'; }).join("");
    OVA.DIAGRAMAS.dibujarER(document.getElementById("caso-er"), []);
    var nav = document.getElementById("pasos-caso");
    nav.innerHTML = OVA.PASOS.map(function (p) {
      return '<button type="button" data-paso="' + p.n + '">' + p.n + '. ' + esc(p.corto) + '</button>';
    }).join("");
    nav.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () { location.hash = "#m4/" + b.getAttribute("data-paso"); });
    });
  }

  function pasoHabilitado(n) {
    for (var i = 1; i < n; i++) if (!prog.m4.ctrl[i]) return false;
    return true;
  }

  function irPaso(n, desplazar) {
    if (!iniciadas.m4) { iniciadas.m4 = true; construirCaso(); }
    n = Math.max(1, Math.min(8, n || 1));
    while (n > 1 && !pasoHabilitado(n)) n--;
    pasoActual = n; prog.m4.paso = n; persistir();

    document.querySelectorAll("#pasos-caso button").forEach(function (b) {
      var k = parseInt(b.getAttribute("data-paso"), 10);
      b.disabled = !pasoHabilitado(k);
      b.classList.toggle("hecho", !!prog.m4.ctrl[k]);
      if (k === n) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
    });
    OVA.DIAGRAMAS.dibujarER(document.getElementById("caso-er"), OVA.CASO.resaltar[n]);
    document.getElementById("caso-er-pie").textContent = n === 1 || n >= 7
      ? "Se consideran todos los elementos del diagrama."
      : "Resaltado en verde: elementos que se traducen en el paso " + n + ".";

    var panel = document.getElementById("caso-panel");
    panel.innerHTML = contenidoPaso(n);
    if (n === 1) OVA.EJ.selectores(document.getElementById("caso-clasificar"), OVA.CASO.clasificar, OVA.CASO.categorias, "m4-clasificar");
    if (n === 8) OVA.EJ.detector(document.getElementById("caso-detector"), OVA.CASO.operaciones, "m4-detector");

    panel.querySelector('[data-acc="ctrl"]').addEventListener("click", function () {
      var c = OVA.CASO.control[n], m = panel.querySelector('input[name="ctrl-' + n + '"]:checked'), r = panel.querySelector(".control .retro");
      panel.querySelectorAll(".control .opcion").forEach(function (o) { o.classList.remove("correcta", "incorrecta"); });
      if (!m) { r.className = "retro info"; r.textContent = "Seleccione una opción."; return; }
      if (parseInt(m.value, 10) === c.ok) {
        m.closest(".opcion").classList.add("correcta");
        r.className = "retro ok"; r.textContent = "Correcto. " + c.fb;
        prog.m4.ctrl[n] = true; persistir();
        var sig = panel.querySelector('[data-ir="' + (n + 1) + '"]'); if (sig) sig.disabled = false;
        var lab = panel.querySelector('a[href="#m5"]'); if (lab) lab.removeAttribute("aria-disabled");
        actualizarTraza(); marcarProceso("m4", n);
        document.querySelectorAll("#pasos-caso button").forEach(function (b) {
          var k = parseInt(b.getAttribute("data-paso"), 10);
          b.disabled = !pasoHabilitado(k); b.classList.toggle("hecho", !!prog.m4.ctrl[k]);
        });
        if (n === 8) {
          r.textContent += " ¡Completó el caso guiado! El taller evaluativo ya está disponible.";
        }
      } else {
        m.closest(".opcion").classList.add("incorrecta");
        r.className = "retro mal"; r.textContent = "Revise la regla del paso y vuelva a intentarlo.";
      }
    });
    panel.querySelectorAll("[data-ir]").forEach(function (b) {
      b.addEventListener("click", function () { location.hash = "#m4/" + b.getAttribute("data-ir"); });
    });
    actualizarTraza();
    if (desplazar !== false) document.getElementById("pasos-caso").scrollIntoView({ block: "start" });
    return n;
  }

  function actualizarTraza() {
    var max = 0;
    for (var i = 1; i <= 8; i++) { if (prog.m4.ctrl[i]) max = i; else break; }
    var visible = Math.max(max, pasoActual);
    var filas = OVA.CASO.traza.filter(function (t) { return t.paso <= visible; });
    var cuerpo = document.getElementById("traza-cuerpo");
    cuerpo.innerHTML = filas.length ? filas.map(function (t) {
      return '<tr' + (t.paso === pasoActual ? ' class="nuevo"' : "") + '><td>' + esc(t.er) + '</td><td>' + esc(t.art) + '</td><td>' + esc(t.regla) + '</td><td>' + t.paso + '</td></tr>';
    }).join("") : '<tr><td colspan="4">La matriz se completa a partir del paso 2.</td></tr>';
  }

  /* ---------------------------------------------------------
     M6 · Lista de verificación
     --------------------------------------------------------- */
  function construirChecklist() {
    var ul = document.getElementById("checklist");
    ul.innerHTML = OVA.CHECKLIST.map(function (t, i) {
      return '<li><input type="checkbox" id="chk-' + i + '"' + (prog.checklist[i] ? " checked" : "") + '><label for="chk-' + i + '">' + esc(t) + '</label></li>';
    }).join("");
    ul.querySelectorAll("input").forEach(function (c, i) {
      c.addEventListener("change", function () { prog.checklist[i] = c.checked; persistir(); });
    });
  }

  /* ---------------------------------------------------------
     Glosario (sección y ventana contextual)
     --------------------------------------------------------- */
  function construirGlosario(cuerpoTabla, buscador) {
    function pintar(f) {
      var t = (f || "").toLowerCase();
      var filas = OVA.GLOSARIO.filter(function (g) { return !t || (g[0] + " " + g[1]).toLowerCase().indexOf(t) >= 0; });
      cuerpoTabla.innerHTML = filas.length ? filas.map(function (g) {
        return '<tr><td class="glosa-termino">' + esc(g[0]) + '</td><td>' + esc(g[1]) + '</td><td class="mono">' + esc(g[2]) + '</td></tr>';
      }).join("") : '<tr><td colspan="3">No hay términos que coincidan.</td></tr>';
    }
    buscador.addEventListener("input", function () { pintar(buscador.value); });
    pintar("");
  }
  var modalOrigen = null;
  function abrirModalGlosario() {
    var m = document.getElementById("modal-glosario");
    if (!m.dataset.listo) {
      construirGlosario(document.getElementById("modal-glosario-lista"), document.getElementById("modal-glosario-buscar"));
      m.dataset.listo = "1";
    }
    modalOrigen = document.activeElement;
    m.hidden = false;
    document.getElementById("modal-glosario-buscar").focus();
  }
  function cerrarModal() {
    var m = document.getElementById("modal-glosario");
    if (m.hidden) return;
    m.hidden = true;
    if (modalOrigen) modalOrigen.focus();
  }

  /* ---------------------------------------------------------
     Taller (con bloqueo hasta completar M4)
     --------------------------------------------------------- */
  function renderTaller() {
    var cont = document.getElementById("taller-app"), bloq = document.getElementById("taller-bloqueo");
    if (tallerDisponible()) {
      bloq.hidden = true; cont.hidden = false;
      if (!cont.dataset.listo) { OVA.TALLER_UI.render(cont); cont.dataset.listo = "1"; }
    } else {
      bloq.hidden = false; cont.hidden = true;
      var hechos = 0; for (var i = 1; i <= 8; i++) if (prog.m4.ctrl[i]) hechos++;
      document.getElementById("taller-avance").textContent = hechos + " de 8 pasos del caso guiado completados.";
    }
  }

  /* ---------------------------------------------------------
     Arranque
     --------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    cargar();
    construirProceso();

    /* Logo institucional: si el archivo no existe, se muestra el emblema textual */
    var logo = document.getElementById("logo-img");
    if (logo) {
      logo.addEventListener("error", function () { logo.hidden = true; document.getElementById("logo-texto").hidden = false; });
      if (logo.complete && logo.naturalWidth === 0) { logo.hidden = true; document.getElementById("logo-texto").hidden = false; }
    }

    document.getElementById("btn-menu").addEventListener("click", function () {
      var m = document.getElementById("menu"), abierto = m.classList.toggle("abierto");
      this.setAttribute("aria-expanded", abierto ? "true" : "false");
    });
    document.querySelectorAll("[data-abrir-glosario]").forEach(function (b) { b.addEventListener("click", abrirModalGlosario); });
    document.getElementById("modal-cerrar").addEventListener("click", cerrarModal);
    document.getElementById("modal-glosario").addEventListener("click", function (e) { if (e.target === this) cerrarModal(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { cerrarModal(); cerrarPopover(); } });
    document.addEventListener("click", function (e) {
      var pop = document.getElementById("popover-paso");
      if (!pop.hidden && !pop.contains(e.target) && !e.target.closest(".estacion")) cerrarPopover();
    });

    document.getElementById("version").textContent = OVA.CONFIG.version;
    window.addEventListener("hashchange", mostrar);
    actualizarMenu();
    mostrar();
  });
})();
