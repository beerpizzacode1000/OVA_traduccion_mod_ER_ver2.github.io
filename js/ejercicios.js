/* =========================================================
   ejercicios.js · Motores de los ejercicios interactivos:
   cuestionarios, selectores (clasificador y FK), detector de
   violaciones, producto cartesiano, buscador de llaves, árbol
   de decisión, constructor de esquemas y anatomía.
   ========================================================= */
(function () {
  "use strict";

  var EJ = {};
  var contador = 0;

  function uid(p) { contador += 1; return (p || "ej") + "-" + contador; }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function registrar(clave, ok, total) {
    if (OVA.APP && OVA.APP.registrarPuntaje) OVA.APP.registrarPuntaje(clave, ok, total);
  }
  function mezclar(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  EJ.mezclar = mezclar;
  EJ.esc = esc;

  /* ---------------------------------------------------------
     Cuestionario formativo de selección única
     items: [{q, opts, ok, fb}]
     --------------------------------------------------------- */
  EJ.quiz = function (cont, items, clave) {
    if (!cont) return;
    var id = uid("quiz");
    var html = '<div class="quiz">';
    items.forEach(function (it, i) {
      html += '<div class="preg" data-i="' + i + '"><fieldset><legend>' + esc(it.q) + '</legend>';
      it.opts.forEach(function (o, j) {
        html += '<label class="opcion"><input type="radio" name="' + id + '-' + i + '" value="' + j + '"> <span>' + esc(o) + '</span></label>';
      });
      html += '</fieldset><div class="retro" aria-live="polite"></div></div>';
    });
    html += '<div class="fila-botones"><button type="button" class="btn" data-acc="comprobar">Comprobar respuestas</button>' +
            '<button type="button" class="btn btn--sec" data-acc="reiniciar">Reiniciar</button></div>' +
            '<div class="resultado" aria-live="polite"></div></div>';
    cont.innerHTML = html;

    cont.querySelector('[data-acc="comprobar"]').addEventListener("click", function () {
      var buenas = 0, sinResponder = 0;
      items.forEach(function (it, i) {
        var preg = cont.querySelector('.preg[data-i="' + i + '"]');
        var marcada = preg.querySelector("input:checked");
        var retro = preg.querySelector(".retro");
        preg.querySelectorAll(".opcion").forEach(function (o) { o.classList.remove("correcta", "incorrecta"); });
        if (!marcada) { sinResponder++; retro.className = "retro info"; retro.textContent = "Seleccione una opción."; return; }
        var v = parseInt(marcada.value, 10);
        if (v === it.ok) {
          buenas++;
          marcada.closest(".opcion").classList.add("correcta");
          retro.className = "retro ok"; retro.textContent = "Correcto. " + it.fb;
        } else {
          marcada.closest(".opcion").classList.add("incorrecta");
          retro.className = "retro mal"; retro.textContent = "Revise su respuesta. " + it.fb;
        }
      });
      var res = cont.querySelector(".resultado");
      res.innerHTML = '<span class="puntaje">Resultado: ' + buenas + ' de ' + items.length + (sinResponder ? ' · ' + sinResponder + ' sin responder' : '') + '</span>';
      if (!sinResponder) registrar(clave, buenas, items.length);
    });
    cont.querySelector('[data-acc="reiniciar"]').addEventListener("click", function () { EJ.quiz(cont, items, clave); });
  };

  /* ---------------------------------------------------------
     Selectores: cada elemento se asigna a una categoría
     items: [[texto, valorCorrecto, retroalimentación]]
     --------------------------------------------------------- */
  EJ.selectores = function (cont, items, opciones, clave, alCompletar) {
    if (!cont) return;
    var opts = opciones.map(function (o) { return '<option value="' + o[0] + '">' + esc(o[1]) + '</option>'; }).join("");
    var html = '<div class="ejercicio-lista">';
    items.forEach(function (it, i) {
      var sid = uid("sel");
      html += '<div class="ejercicio-fila" data-i="' + i + '"><label for="' + sid + '">' + esc(it[0]) + '</label>' +
              '<select id="' + sid + '">' + opts + '</select><div class="retro" aria-live="polite"></div></div>';
    });
    html += '</div><div class="fila-botones"><button type="button" class="btn" data-acc="comprobar">Comprobar</button>' +
            '<button type="button" class="btn btn--sec" data-acc="solucion">Ver solución</button></div><div class="resultado" aria-live="polite"></div>';
    cont.innerHTML = html;

    function comprobar(mostrarSolucion) {
      var buenas = 0;
      items.forEach(function (it, i) {
        var fila = cont.querySelector('.ejercicio-fila[data-i="' + i + '"]');
        var sel = fila.querySelector("select");
        var retro = fila.querySelector(".retro");
        if (mostrarSolucion) sel.value = it[1];
        var ok = sel.value === it[1];
        fila.classList.toggle("ok", ok);
        fila.classList.toggle("mal", !ok && sel.value !== "");
        if (ok) { buenas++; retro.className = "retro ok"; retro.textContent = it[2]; }
        else if (sel.value === "") { retro.className = "retro info"; retro.textContent = "Sin responder."; }
        else { retro.className = "retro mal"; retro.textContent = "No corresponde. Pista: " + it[2]; }
      });
      cont.querySelector(".resultado").innerHTML = '<span class="puntaje">' + buenas + ' de ' + items.length + ' correctas</span>';
      if (!mostrarSolucion) registrar(clave, buenas, items.length);
      if (buenas === items.length && alCompletar) alCompletar();
    }
    cont.querySelector('[data-acc="comprobar"]').addEventListener("click", function () { comprobar(false); });
    cont.querySelector('[data-acc="solucion"]').addEventListener("click", function () { comprobar(true); });
  };

  /* ---------------------------------------------------------
     Detector de violaciones
     ops: [{op, res, r, fb}] · modo taller: sin retroalimentación
     Devuelve un objeto con respuestas() para el taller.
     --------------------------------------------------------- */
  EJ.detector = function (cont, ops, clave, modoTaller) {
    if (!cont) return null;
    var restr = OVA.RESTRICCIONES.map(function (o) { return '<option value="' + o[0] + '">' + esc(o[1]) + '</option>'; }).join("");
    var html = '<div class="ejercicio-lista">';
    ops.forEach(function (o, i) {
      var texto = typeof o === "string" ? o : o.op;
      html += '<div class="detector-fila" data-i="' + i + '"><span class="op">' + (i + 1) + '. ' + esc(texto) + '</span>' +
        '<select aria-label="Resultado de la operación ' + (i + 1) + '" data-campo="res"><option value="">— Resultado —</option><option value="acepta">Se acepta</option><option value="rechaza">Se rechaza</option></select>' +
        '<select aria-label="Restricción que actúa en la operación ' + (i + 1) + '" data-campo="r">' + restr + '</select>' +
        '<div class="retro" aria-live="polite"></div></div>';
    });
    html += '</div>';
    if (!modoTaller) {
      html += '<div class="fila-botones"><button type="button" class="btn" data-acc="comprobar">Comprobar</button>' +
              '<button type="button" class="btn btn--sec" data-acc="solucion">Ver solución</button></div><div class="resultado" aria-live="polite"></div>';
    }
    cont.innerHTML = html;

    function comprobar(sol) {
      var buenas = 0;
      ops.forEach(function (o, i) {
        var fila = cont.querySelector('.detector-fila[data-i="' + i + '"]');
        var sRes = fila.querySelector('[data-campo="res"]'), sR = fila.querySelector('[data-campo="r"]');
        var retro = fila.querySelector(".retro");
        if (sol) { sRes.value = o.res; sR.value = o.r; }
        var okRes = sRes.value === o.res, okR = sR.value === o.r;
        fila.classList.toggle("ok", okRes && okR);
        fila.classList.toggle("mal", !(okRes && okR));
        if (okRes && okR) { buenas++; retro.className = "retro ok"; retro.textContent = "Correcto. " + o.fb; }
        else if (okRes) { retro.className = "retro mal"; retro.textContent = "El resultado es correcto, pero revise la restricción que actúa."; }
        else { retro.className = "retro mal"; retro.textContent = "Revise el resultado de la operación."; }
      });
      cont.querySelector(".resultado").innerHTML = '<span class="puntaje">' + buenas + ' de ' + ops.length + ' correctas</span>';
      if (!sol) registrar(clave, buenas, ops.length);
    }
    if (!modoTaller) {
      cont.querySelector('[data-acc="comprobar"]').addEventListener("click", function () { comprobar(false); });
      cont.querySelector('[data-acc="solucion"]').addEventListener("click", function () { comprobar(true); });
    }
    return {
      respuestas: function () {
        return ops.map(function (o, i) {
          var fila = cont.querySelector('.detector-fila[data-i="' + i + '"]');
          return [fila.querySelector('[data-campo="res"]').value, fila.querySelector('[data-campo="r"]').value];
        });
      },
      fijar: function (resps) {
        (resps || []).forEach(function (r, i) {
          var fila = cont.querySelector('.detector-fila[data-i="' + i + '"]');
          if (!fila || !r) return;
          fila.querySelector('[data-campo="res"]').value = r[0] || "";
          fila.querySelector('[data-campo="r"]').value = r[1] || "";
        });
      },
      bloquear: function () { cont.querySelectorAll("select").forEach(function (s) { s.disabled = true; }); }
    };
  };

  /* ---------------------------------------------------------
     Anatomía de la relación (M1)
     --------------------------------------------------------- */
  EJ.anatomia = function (cont) {
    if (!cont) return;
    var tabla = cont.querySelector("table"), rotulo = cont.querySelector(".anatomia__rotulo");
    var cols = [];
    tabla.querySelectorAll("thead th").forEach(function (th) { cols.push(th.textContent); });
    function decir(t) { rotulo.textContent = t; }
    tabla.querySelectorAll("thead th").forEach(function (th) {
      th.tabIndex = 0;
      var f = function () { decir("Atributo «" + th.textContent + "»: nombre de una columna; toma valores de dom(" + th.textContent + ")."); };
      th.addEventListener("mouseenter", f); th.addEventListener("focus", f);
    });
    tabla.querySelectorAll("tbody td").forEach(function (td) {
      td.tabIndex = 0;
      var f = function () {
        var fila = td.parentNode, n = Array.prototype.indexOf.call(fila.parentNode.children, fila) + 1;
        var c = Array.prototype.indexOf.call(fila.children, td);
        decir("Tupla t" + n + " (fila). Celda: valor atómico «" + td.textContent + "» ∈ dom(" + cols[c] + ").");
      };
      td.addEventListener("mouseenter", f); td.addEventListener("focus", f);
    });
  };

  /* ---------------------------------------------------------
     Producto cartesiano (M2): D1 = {MON, LOR}, D2 = {101, 102, 103}
     --------------------------------------------------------- */
  EJ.cartesiano = function (cont) {
    if (!cont) return;
    var D1 = ["MON", "LOR"], D2 = ["101", "102", "103"];
    var existentes = ["MON-101", "MON-102", "LOR-101", "LOR-103"];
    var html = '<div class="cartesiano" role="group" aria-label="Producto cartesiano D1 × D2"><span></span>';
    D2.forEach(function (d) { html += '<span class="enc">' + d + '</span>'; });
    D1.forEach(function (a) {
      html += '<span class="enc">' + a + '</span>';
      D2.forEach(function (b) {
        html += '<button type="button" class="celda-cp" aria-pressed="false" data-t="' + a + '-' + b + '">(' + a + ', ' + b + ')</button>';
      });
    });
    html += '</div><p class="mono" data-cuenta>|D1 × D2| = 2 · 3 = 6 · |r| = 0</p>' +
      '<div class="fila-botones"><button type="button" class="btn" data-acc="comprobar">Comprobar</button></div><div class="retro" aria-live="polite"></div>';
    cont.innerHTML = html;
    function contar() {
      var n = cont.querySelectorAll('.celda-cp[aria-pressed="true"]').length;
      cont.querySelector("[data-cuenta]").textContent = "|D1 × D2| = 2 · 3 = 6 · r ⊆ D1 × D2 · |r| = " + n;
    }
    cont.querySelectorAll(".celda-cp").forEach(function (b) {
      b.addEventListener("click", function () {
        b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true");
        contar();
      });
    });
    cont.querySelector('[data-acc="comprobar"]').addEventListener("click", function () {
      var marcadas = [];
      cont.querySelectorAll('.celda-cp[aria-pressed="true"]').forEach(function (b) { marcadas.push(b.getAttribute("data-t")); });
      var ok = marcadas.length === existentes.length && existentes.every(function (e) { return marcadas.indexOf(e) >= 0; });
      var r = cont.querySelector(".retro");
      if (ok) { r.className = "retro ok"; r.textContent = "Correcto: la relación SALON (en estos dominios) contiene 4 de las 6 combinaciones posibles; |r| = 4 ≤ |D1 × D2| = 6."; registrar("m2-cartesiano", 1, 1); }
      else { r.className = "retro mal"; r.textContent = "Aún no. Los salones existentes son: Montería 101 y 102; Lorica 101 y 103."; }
    });
  };

  /* ---------------------------------------------------------
     Buscador de llaves (M2 y M5)
     --------------------------------------------------------- */
  EJ.buscadorLlaves = function (cont) {
    if (!cont) return;
    var L = OVA.LLAVES;
    var html = '<p>Seleccione uno o más atributos de DOCENTE y pulse «Evaluar».</p><div class="buscador-cols">';
    L.cols.forEach(function (c, i) { html += '<label class="chip-col"><input type="checkbox" value="' + i + '"> ' + c + '</label>'; });
    html += '</div><div class="fila-botones"><button type="button" class="btn" data-acc="evaluar">Evaluar</button></div>' +
      '<div class="retro" aria-live="polite"></div><div class="tabla-env"><table class="tabla"><caption>Instancia de DOCENTE</caption><thead><tr>';
    L.cols.forEach(function (c) { html += '<th scope="col">' + c + '</th>'; });
    html += '</tr></thead><tbody>';
    L.filas.forEach(function (f) { html += '<tr>' + f.map(function (v) { return '<td>' + esc(v) + '</td>'; }).join("") + '</tr>'; });
    html += '</tbody></table></div>';
    cont.innerHTML = html;

    cont.querySelector('[data-acc="evaluar"]').addEventListener("click", function () {
      var sel = [];
      cont.querySelectorAll(".chip-col input:checked").forEach(function (c) { sel.push(parseInt(c.value, 10)); });
      var filas = cont.querySelectorAll("tbody tr"), ths = cont.querySelectorAll("thead th");
      filas.forEach(function (tr) { tr.classList.remove("choque"); tr.querySelectorAll("td").forEach(function (td) { td.classList.remove("sel"); }); });
      ths.forEach(function (th, i) { th.classList.toggle("sel", sel.indexOf(i) >= 0); });
      filas.forEach(function (tr) { sel.forEach(function (i) { tr.children[i].classList.add("sel"); }); });
      var r = cont.querySelector(".retro");
      if (!sel.length) { r.className = "retro info"; r.textContent = "Seleccione al menos un atributo."; return; }

      // ¿Se repite la combinación en la instancia?
      var vistos = {}, choque = null;
      L.filas.forEach(function (f, k) {
        var clave = sel.map(function (i) { return f[i]; }).join("|");
        if (vistos[clave] !== undefined && !choque) choque = [vistos[clave], k];
        vistos[clave] = k;
      });
      var nombres = "{" + sel.map(function (i) { return L.cols[i]; }).join(", ") + "}";
      var contieneUnica = sel.some(function (i) { return L.unicasPorRequisito.indexOf(L.cols[i]) >= 0; });
      if (choque) {
        filas[choque[0]].classList.add("choque"); filas[choque[1]].classList.add("choque");
        r.className = "retro mal";
        r.textContent = nombres + " no es superclave: las tuplas " + (choque[0] + 1) + " y " + (choque[1] + 1) + " (resaltadas) coinciden en esos atributos.";
        return;
      }
      if (!contieneUnica) {
        r.className = "retro info";
        r.textContent = nombres + " no se repite en esta instancia, pero el requisito no garantiza su unicidad (por ejemplo, dos docentes pueden nacer el mismo día). Una llave se define por la semántica del problema, no por los datos de un momento: no es llave.";
        return;
      }
      if (sel.length === 1) {
        r.className = "retro ok";
        r.textContent = nombres + " es llave candidata: identifica cada tupla y es minimal." + (L.cols[sel[0]] === "cedula" ? " Es la PK elegida por ser corta y estable." : " Es llave alternativa: se marca ÚNICO.");
        registrar("m2-llaves", 1, 1);
      } else {
        r.className = "retro ok";
        r.textContent = nombres + " es superclave, pero no candidata: contiene a {cedula} o a {email}, que ya identifican por sí solas (no es minimal).";
      }
    });
  };

  /* ---------------------------------------------------------
     Árbol de decisión (M3)
     --------------------------------------------------------- */
  EJ.arbol = function (cont) {
    if (!cont) return;
    var ruta = [];
    function pintar(nodoId) {
      var n = OVA.ARBOL[nodoId];
      var html = '<div class="arbol__ruta">' + ruta.map(function (r) { return '<span>' + esc(r) + '</span>'; }).join("") + '</div>';
      if (n.res) {
        html += '<div class="recuadro recuadro--regla arbol__resultado"><span class="recuadro__titulo">Regla que se aplica</span><p>' + esc(n.res) + '</p><p class="mono">' + n.ej + '</p></div>';
        html += '<button type="button" class="btn btn--sec" data-acc="reiniciar">Tomar otro elemento</button>';
      } else {
        html += '<p class="arbol__preg">' + esc(n.q) + '</p><div class="arbol__opciones">';
        n.ops.forEach(function (o, i) { html += '<button type="button" class="btn btn--sec" data-i="' + i + '">' + esc(o[0]) + '</button>'; });
        html += '</div>';
        if (ruta.length) html += '<p style="margin-top:12px"><button type="button" class="btn-texto" data-acc="reiniciar">Volver al inicio</button></p>';
      }
      cont.innerHTML = html;
      cont.querySelectorAll("[data-i]").forEach(function (b) {
        b.addEventListener("click", function () {
          var o = n.ops[parseInt(b.getAttribute("data-i"), 10)];
          ruta.push(o[0]); pintar(o[1]);
          var foco = cont.querySelector("button"); if (foco) foco.focus();
        });
      });
      var rein = cont.querySelector('[data-acc="reiniciar"]');
      if (rein) rein.addEventListener("click", function () { ruta = []; pintar("inicio"); });
    }
    pintar("inicio");
  };

  /* ---------------------------------------------------------
     Constructor de esquemas (M5)
     --------------------------------------------------------- */
  EJ.constructor = function (cont) {
    if (!cont) return;
    var roles = [["", "No incluir"], ["a", "Atributo"], ["pk", "PK"], ["fk", "FK"], ["pkfk", "PK y FK"]];
    var opts = roles.map(function (r) { return '<option value="' + r[0] + '">' + r[1] + '</option>'; }).join("");
    var html = "";
    OVA.LAB.constructor.forEach(function (t, ti) {
      html += '<div class="constructor-tabla tarjeta" data-t="' + ti + '"><h4>' + t.t + '</h4><div class="constructor-atrs">';
      Object.keys(t.atrs).forEach(function (a) {
        var sid = uid("con");
        html += '<div class="constructor-atr" data-a="' + a + '"><label for="' + sid + '">' + a + '</label><select id="' + sid + '">' + opts + '</select></div>';
      });
      html += '</div><div class="retro" aria-live="polite"></div></div>';
    });
    html += '<div class="fila-botones"><button type="button" class="btn" data-acc="comprobar">Comprobar esquema</button><button type="button" class="btn btn--sec" data-acc="solucion">Ver solución</button></div><div class="resultado" aria-live="polite"></div>';
    cont.innerHTML = html;

    function comprobar(sol) {
      var tablasOk = 0;
      OVA.LAB.constructor.forEach(function (t, ti) {
        var caja = cont.querySelector('.constructor-tabla[data-t="' + ti + '"]');
        var errores = [];
        Object.keys(t.atrs).forEach(function (a) {
          var s = caja.querySelector('.constructor-atr[data-a="' + a + '"] select');
          if (sol) s.value = t.atrs[a];
          if (s.value !== t.atrs[a]) {
            var pista = OVA.LAB.pistasConstructor[t.t + "." + a];
            errores.push(pista || ("Revise el papel de «" + a + "» en " + t.t + "."));
          }
        });
        var r = caja.querySelector(".retro");
        if (!errores.length) { tablasOk++; r.className = "retro ok"; r.textContent = "Relación correcta."; }
        else { r.className = "retro mal"; r.textContent = errores.join(" "); }
      });
      cont.querySelector(".resultado").innerHTML = '<span class="puntaje">' + tablasOk + ' de ' + OVA.LAB.constructor.length + ' relaciones correctas</span>' +
        (tablasOk === OVA.LAB.constructor.length ? '<p style="margin-top:8px">Recuerde: en ESCRITORIO, id_emp debe marcarse además <b>ÚNICO</b> y <b>NO NULO</b>.</p>' : '');
      if (!sol) registrar("m5-constructor", tablasOk, OVA.LAB.constructor.length);
    }
    cont.querySelector('[data-acc="comprobar"]').addEventListener("click", function () { comprobar(false); });
    cont.querySelector('[data-acc="solucion"]').addEventListener("click", function () { comprobar(true); });
  };

  /* ---------------------------------------------------------
     Respuesta numérica (conteo de superclaves)
     --------------------------------------------------------- */
  EJ.numerico = function (cont, correcto, clave, explicacion) {
    if (!cont) return;
    var input = cont.querySelector("input"), btn = cont.querySelector("button"), r = cont.querySelector(".retro");
    btn.addEventListener("click", function () {
      var v = parseInt(input.value, 10);
      if (v === correcto) { r.className = "retro ok"; r.textContent = "Correcto. " + explicacion; registrar(clave, 1, 1); }
      else { r.className = "retro mal"; r.textContent = "Aún no. Aplique inclusión–exclusión: superclaves que contienen cada candidata, menos las que contienen pares, más las que contienen las tres."; }
    });
  };

  OVA.EJ = EJ;
})();
