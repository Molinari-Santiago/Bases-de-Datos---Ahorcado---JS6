const db = require("../config/db");
const { crearPdfScores } = require("../services/pdfService");
const { crearExcelScores } = require("../services/excelService");

const columnasPermitidas = {
  nombre: "nombre",
  puntos: "puntos",
  tiempo: "tiempo",
  fecha: "fecha"
};

// Limpia los filtros recibidos desde el frontend.
function obtenerFiltros(body = {}) {
  const busqueda = String(body.busqueda || "").trim();
  const ordenarPor = columnasPermitidas[body.ordenarPor] || "puntos";
  const direccion = String(body.direccion || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";

  return {
    busqueda,
    ordenarPor,
    direccion
  };
}

// Arma la consulta de scores con busqueda y orden seguros.
async function obtenerScoresConFiltros(filtros) {
  const valores = [];
  const where = [];

  if (filtros.busqueda) {
    where.push("nombre LIKE ?");
    valores.push(`%${filtros.busqueda}%`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [scores] = await db.query(
    `
      SELECT
        id,
        nombre,
        tiempo,
        puntos,
        CASE
          WHEN fecha IS NULL THEN 'Sin fecha'
          WHEN CAST(fecha AS CHAR) = '' THEN 'Sin fecha'
          WHEN CAST(fecha AS CHAR) = '0000-00-00' THEN 'Sin fecha'
          WHEN CAST(fecha AS CHAR) = '0000-00-00 00:00:00' THEN 'Sin fecha'
          WHEN CAST(fecha AS CHAR) REGEXP '^[0-9]{2}/[0-9]{2}/[0-9]{4}$' THEN CAST(fecha AS CHAR)
          WHEN DATE_FORMAT(fecha, '%d/%m/%Y') IS NULL THEN 'Sin fecha'
          ELSE DATE_FORMAT(fecha, '%d/%m/%Y')
        END AS fecha
      FROM score
      ${whereSql}
      ORDER BY ${filtros.ordenarPor} ${filtros.direccion}, id DESC
      LIMIT 50
    `,
    valores
  );

  return scores;
}

// Guarda el score del jugador en la base de datos.
async function guardarScore(req, res) {
  try {
    const { nombre, tiempo, puntos } = req.body;
    const nombreLimpio = String(nombre || "").trim().slice(0, 80);
    const tiempoNumero = Number(tiempo);
    const puntosNumero = Number(puntos);

    if (!nombreLimpio || nombreLimpio.length < 2) {
      return res.status(400).json({
        ok: false,
        mensaje: "El nombre debe tener al menos 2 caracteres."
      });
    }

    if (!Number.isFinite(tiempoNumero) || !Number.isFinite(puntosNumero)) {
      return res.status(400).json({
        ok: false,
        mensaje: "El tiempo y los puntos deben ser validos."
      });
    }

    await db.query(
      "INSERT INTO score (nombre, tiempo, puntos, fecha) VALUES (?, ?, ?, NOW())",
      [nombreLimpio, tiempoNumero, puntosNumero]
    );

    res.json({
      ok: true,
      mensaje: "Score guardado correctamente."
    });
  } catch (error) {
    console.log("Error al guardar score:", error);

    res.status(500).json({
      ok: false,
      mensaje: "No se pudo guardar el score."
    });
  }
}

// Lista los scores usando busqueda y ordenamiento.
async function listarScores(req, res) {
  try {
    const filtros = obtenerFiltros(req.body);
    const scores = await obtenerScoresConFiltros(filtros);

    res.json({
      ok: true,
      scores
    });
  } catch (error) {
    console.log("Error al listar scores:", error);

    res.status(500).json({
      ok: false,
      mensaje: "No se pudo cargar la tabla."
    });
  }
}

// Descarga el PDF respetando los filtros actuales.
async function descargarPdf(req, res) {
  try {
    const filtros = obtenerFiltros(req.body);
    const scores = await obtenerScoresConFiltros(filtros);
    const pdf = await crearPdfScores(scores);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=score-ahorcado.pdf");
    res.send(pdf);
  } catch (error) {
    console.log("Error al generar PDF:", error);

    res.status(500).json({
      ok: false,
      mensaje: "No se pudo generar el PDF."
    });
  }
}

// Descarga el Excel respetando los filtros actuales.
async function descargarExcel(req, res) {
  try {
    const filtros = obtenerFiltros(req.body);
    const scores = await obtenerScoresConFiltros(filtros);
    const excel = await crearExcelScores(scores);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=score-ahorcado.xlsx");
    res.send(Buffer.from(excel));
  } catch (error) {
    console.log("Error al generar Excel:", error);

    res.status(500).json({
      ok: false,
      mensaje: "No se pudo generar el Excel."
    });
  }
}

module.exports = {
  guardarScore,
  listarScores,
  descargarPdf,
  descargarExcel
};