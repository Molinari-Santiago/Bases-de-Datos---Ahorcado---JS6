const express = require("express");
const router = express.Router();

const palabraController = require("../controllers/palabraControllers");
const scoreController = require("../controllers/scoreControllers");

router.post("/palabra", palabraController.pedirPalabra);
router.post("/score/guardar", scoreController.guardarScore);
router.post("/score/listar", scoreController.listarScores);
router.post("/score/pdf", scoreController.descargarPdf);
router.post("/score/excel", scoreController.descargarExcel);

module.exports = router;