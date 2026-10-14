/* =========================================================
   diagramas.js · Diagrama ER del caso guiado en SVG (notación
   de Chen simplificada). Cada entidad y relación tiene un id
   para resaltarla en el paso correspondiente.
   ========================================================= */
(function () {
  "use strict";

  var C = {
    borde: "#6B6B6B", texto: "#201E1E", suave: "#6B6B6B",
    rombo: "#EEF4ED", romboBorde: "#589151", caja: "#FFFFFF"
  };

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* Entidad: rectángulo con nombre y líneas de atributos */
  function entidad(id, x, y, alto, lineas, debil) {
    var s = '<g class="er-elem er-ent" data-er="' + id + '">';
    s += '<title>Entidad ' + esc(id) + (debil ? " (débil)" : "") + '</title>';
    s += '<rect class="er-caja" x="' + x + '" y="' + y + '" width="220" height="' + alto + '" rx="4" fill="' + C.caja + '" stroke="' + C.borde + '" stroke-width="1.5"/>';
    if (debil) {
      s += '<rect x="' + (x + 4) + '" y="' + (y + 4) + '" width="212" height="' + (alto - 8) + '" rx="2" fill="none" stroke="' + C.borde + '" stroke-width="1.25"/>';
    }
    s += '<text x="' + (x + 12) + '" y="' + (y + 22) + '" font-size="13" font-weight="700" fill="' + C.texto + '">' + esc(id + (debil ? " (débil)" : "")) + '</text>';
    lineas.forEach(function (l, i) {
      s += '<text x="' + (x + 12) + '" y="' + (y + 40 + 16 * i) + '" font-size="11.5" fill="' + C.texto + '">' + esc(l) + '</text>';
    });
    return s + '</g>';
  }

  /* Relación: rombo (doble si es identificadora) */
  function relacion(id, cx, cy, doble, atributo, atrX, atrY) {
    var p = function (hw, hh) { return (cx - hw) + "," + cy + " " + cx + "," + (cy - hh) + " " + (cx + hw) + "," + cy + " " + cx + "," + (cy + hh); };
    var s = '<g class="er-elem er-rel" data-er="' + id + '">';
    s += '<title>Relación ' + esc(id) + '</title>';
    s += '<polygon class="er-rombo" points="' + p(66, 28) + '" fill="' + C.rombo + '" stroke="' + C.romboBorde + '" stroke-width="1.5"/>';
    if (doble) s += '<polygon points="' + p(56, 22) + '" fill="none" stroke="' + C.romboBorde + '" stroke-width="1.25"/>';
    s += '<text x="' + cx + '" y="' + (cy + 4) + '" font-size="12" font-weight="700" text-anchor="middle" fill="' + C.texto + '">' + esc(id) + '</text>';
    if (atributo) s += '<text x="' + atrX + '" y="' + atrY + '" font-size="11.5" text-anchor="middle" fill="' + C.suave + '">' + esc(atributo) + '</text>';
    return s + '</g>';
  }

  function linea(d, total) {
    return '<path d="' + d + '" fill="none" stroke="' + C.borde + '" stroke-width="' + (total ? 3.5 : 1.5) + '"/>';
  }
  function card(x, y, t, ancla) {
    return '<text x="' + x + '" y="' + y + '" font-size="12.5" font-weight="700" fill="' + C.texto + '"' + (ancla ? ' text-anchor="' + ancla + '"' : "") + '>' + t + '</text>';
  }

  /* Devuelve el SVG del caso «Educación Continua Unicórdoba» */
  function svgCaso() {
    var s = '<svg viewBox="0 48 760 640" role="img" aria-labelledby="er-tit er-desc" xmlns="http://www.w3.org/2000/svg" font-family="Calibri, Segoe UI, Tahoma, Arial, sans-serif">';
    s += '<title id="er-tit">Diagrama ER del caso Educación Continua Unicórdoba</title>';
    s += '<desc id="er-desc">Seis entidades: DOCENTE, SEDE, SALON (débil), CURSO, AREA y PARTICIPANTE. Seis relaciones: COORDINA 1:1 entre DOCENTE y SEDE; TIENE 1:N identificadora entre SEDE y SALON; IMPARTE ternaria entre DOCENTE, CURSO y SALON con atributo horario; OFRECE 1:N entre AREA y CURSO; INSCRIBE N:M entre CURSO y PARTICIPANTE con fecha_insc y nota_final; REQUIERE reflexiva N:M sobre CURSO.</desc>';

    /* Conectores (debajo de las figuras) */
    s += '<g class="er-lineas">';
    s += linea("M244 124H314") + linea("M446 124H516", true);
    s += linea("M626 160V202") + linea("M626 258V294", true);
    s += linea("M134 184V330H314") + linea("M446 330H516") + linea("M380 358V414");
    s += linea("M200 450H270", true) + linea("M134 544V478");
    s += linea("M490 450H560") + linea("M626 478V536");
    s += linea("M300 486V580H314") + linea("M460 486V580H446");
    s += '</g>';

    s += entidad("DOCENTE", 24, 64, 120, ["id: cedula", "email, fecha_nac, categoria", "nombre — compuesto", "telefono — multivalorado", "edad — derivado"]);
    s += entidad("SEDE", 516, 88, 72, ["id: cod_sede", "nombre_sede, municipio"]);
    s += entidad("SALON", 516, 294, 72, ["clave parcial: num_salon", "capacidad, tipo"], true);
    s += entidad("CURSO", 270, 414, 72, ["id: cod_curso", "nombre_curso, horas, valor"]);
    s += entidad("AREA", 24, 544, 72, ["id: cod_area", "nombre_area, descripcion"]);
    s += entidad("PARTICIPANTE", 516, 536, 88, ["id: doc_part", "nombre — compuesto", "email (opcional), telefono"]);

    s += relacion("COORDINA", 380, 124);
    s += relacion("TIENE", 626, 230, true);
    s += relacion("IMPARTE", 380, 330, false, "atributo: horario", 380, 290);
    s += relacion("OFRECE", 134, 450);
    s += relacion("INSCRIBE", 626, 450, false, "fecha_insc, nota_final (opcional)", 626, 410);
    s += relacion("REQUIERE", 380, 580);

    /* Roles de la reflexiva y cardinalidades */
    s += '<text x="310" y="522" font-size="11.5" fill="' + C.suave + '">curso</text>';
    s += '<text x="450" y="522" font-size="11.5" text-anchor="end" fill="' + C.suave + '">prerrequisito</text>';
    s += card(256, 116, "1") + card(504, 116, "1", "end");
    s += card(636, 186, "1") + card(636, 284, "N");
    s += card(300, 322, "N", "end") + card(506, 322, "N", "end") + card(390, 404, "N");
    s += card(144, 532, "1") + card(262, 442, "N", "end");
    s += card(500, 442, "N") + card(636, 526, "M");
    s += card(290, 540, "N", "end") + card(470, 540, "M");

    /* Leyenda */
    s += '<g font-size="11.5" fill="' + C.suave + '">';
    s += '<path d="M24 662H64" stroke="' + C.borde + '" stroke-width="3.5"/><text x="74" y="666">Línea gruesa: participación total</text>';
    s += '<rect x="300" y="652" width="36" height="20" rx="3" fill="none" stroke="' + C.borde + '"/><rect x="303" y="655" width="30" height="14" rx="2" fill="none" stroke="' + C.borde + '"/>';
    s += '<text x="346" y="666">Doble borde: entidad débil y relación identificadora</text></g>';
    return s + '</svg>';
  }

  /* Dibuja el diagrama en un contenedor y resalta los ids indicados */
  function dibujarER(contenedor, resaltados) {
    if (!contenedor) return;
    if (!contenedor.querySelector("svg")) contenedor.innerHTML = svgCaso();
    var todos = resaltados && resaltados.length >= 12;
    contenedor.querySelectorAll(".er-elem").forEach(function (g) {
      var id = g.getAttribute("data-er");
      var on = resaltados && resaltados.indexOf(id) >= 0;
      g.classList.toggle("resaltado", on && !todos);
      g.classList.toggle("atenuado", !!resaltados && resaltados.length > 0 && !on);
    });
  }

  OVA.DIAGRAMAS = { svgCaso: svgCaso, dibujarER: dibujarER };
})();
