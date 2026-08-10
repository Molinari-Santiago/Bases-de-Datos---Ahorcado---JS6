const palabraService = require("../services/palabraService");

// Pide una palabra aleatoria al servicio.
async function pedirPalabra(req, res) {
  try {
    const palabra = await palabraService.obtenerPalabraAleatoria();

    if (!palabra) {
      return res.status(503).json({
        ok: false,
        mensaje: "No se pudo obtener una palabra en este momento."
      });
    }

    res.json({
      ok: true,
      palabra
    });
  } catch (error) {
    console.log("Error en palabraController:", error.message);

    res.status(500).json({
      ok: false,
      mensaje: "No se pudo obtener una palabra en este momento."
    });
  }
}

// Pide una pista para la palabra actual.
async function pedirPista(req, res) {
  try {
    const palabra = String(req.body.palabra || "").trim();

    if (!palabraService.esPalabraValida(palabra)) {
      return res.status(400).json({
        ok: false,
        mensaje: "La palabra no es valida para pedir una pista."
      });
    }

    const pista = await palabraService.obtenerPista(palabra);

    if (!pista) {
      return res.json({
        ok: false,
        mensaje: "No hay una pista disponible para esta palabra."
      });
    }

    res.json({
      ok: true,
      pista
    });
  } catch (error) {
    console.log("Error al obtener pista:", error.message);

    res.status(500).json({
      ok: false,
      mensaje: "No hay una pista disponible para esta palabra."
    });
  }
}

module.exports = {
  pedirPalabra,
  pedirPista
};