const PDFDocument = require("pdfkit");

// Formatea la fecha actual en dia/mes/anio.
function fechaActual() {
  const fecha = new Date();
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

// Dibuja el encabezado de la tabla del PDF.
function dibujarEncabezado(doc, y) {
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("#", 50, y)
    .text("Nombre", 85, y)
    .text("Puntos", 245, y)
    .text("Tiempo", 330, y)
    .text("Fecha", 420, y);

  doc.moveTo(50, y + 18).lineTo(545, y + 18).strokeColor("#d4d8e0").stroke();
}

// Crea el PDF con los scores actuales.
function crearPdfScores(scores) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const partes = [];

    doc.on("data", (parte) => partes.push(parte));
    doc.on("end", () => resolve(Buffer.concat(partes)));
    doc.on("error", reject);

    doc
      .fillColor("#151f32")
      .font("Helvetica-Bold")
      .fontSize(22)
      .text("El Ahorcado - Tabla de posiciones", 50, 50);

    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor("#536076")
      .text(`Generado: ${fechaActual()}`, 50, 82);

    let y = 125;
    dibujarEncabezado(doc, y);
    y += 32;

    if (!scores.length) {
      doc.font("Helvetica").fontSize(12).fillColor("#536076").text("Todavia no hay scores guardados.", 50, y);
    }

    scores.forEach((score, indice) => {
      if (y > 735) {
        doc.addPage();
        y = 60;
        dibujarEncabezado(doc, y);
        y += 32;
      }

      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#151f32")
        .text(String(indice + 1), 50, y)
        .text(String(score.nombre), 85, y, { width: 140, ellipsis: true })
        .text(String(score.puntos), 245, y)
        .text(`${score.tiempo}s`, 330, y)
        .text(String(score.fecha), 420, y);

      doc.moveTo(50, y + 18).lineTo(545, y + 18).strokeColor("#edf0f5").stroke();
      y += 28;
    });

    doc.end();
  });
}

module.exports = {
  crearPdfScores
};
