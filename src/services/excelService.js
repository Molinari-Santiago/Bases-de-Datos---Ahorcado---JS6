const ExcelJS = require("exceljs");

// Crea un archivo Excel con los scores actuales.
async function crearExcelScores(scores) {
  const workbook = new ExcelJS.Workbook();
  const hoja = workbook.addWorksheet("Tabla de posiciones");

  hoja.columns = [
    { header: "#", key: "posicion", width: 8 },
    { header: "Nombre", key: "nombre", width: 28 },
    { header: "Puntos", key: "puntos", width: 14 },
    { header: "Tiempo", key: "tiempo", width: 14 },
    { header: "Fecha", key: "fecha", width: 16 }
  ];

  scores.forEach((score, indice) => {
    hoja.addRow({
      posicion: indice + 1,
      nombre: score.nombre,
      puntos: score.puntos,
      tiempo: `${score.tiempo}s`,
      fecha: score.fecha
    });
  });

  hoja.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  hoja.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF246BFE" }
  };

  hoja.eachRow((fila) => {
    fila.eachCell((celda) => {
      celda.border = {
        top: { style: "thin", color: { argb: "FFDCE5EF" } },
        left: { style: "thin", color: { argb: "FFDCE5EF" } },
        bottom: { style: "thin", color: { argb: "FFDCE5EF" } },
        right: { style: "thin", color: { argb: "FFDCE5EF" } }
      };
    });
  });

  return workbook.xlsx.writeBuffer();
}

module.exports = {
  crearExcelScores
};