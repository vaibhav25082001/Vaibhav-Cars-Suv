const PDFDocument = require("pdfkit");

function createPdfDocument(options = {}) {
  return new PDFDocument({
    size: "A4",
    margin: 48,
    autoFirstPage: true,
    ...options,
  });
}

function collectPdfBuffer(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}

function writeHeader(doc, title, subtitle) {
  doc
    .fontSize(20)
    .font("Helvetica-Bold")
    .text(title, { align: "left" })
    .moveDown(0.25);

  if (subtitle) {
    doc.fontSize(10).font("Helvetica").fillColor("#555555").text(subtitle);
  }

  doc.fillColor("#111111").moveDown(1);
  drawRule(doc);
}

function drawRule(doc) {
  const y = doc.y;
  doc
    .moveTo(doc.page.margins.left, y)
    .lineTo(doc.page.width - doc.page.margins.right, y)
    .strokeColor("#dddddd")
    .stroke()
    .fillColor("#111111")
    .moveDown(0.75);
}

function writeKeyValueRows(doc, rows = [], options = {}) {
  const labelWidth = options.labelWidth || 150;
  const startX = doc.x;

  rows.forEach(([label, value]) => {
    const y = doc.y;

    doc.font("Helvetica-Bold").fontSize(10).text(label, startX, y, {
      width: labelWidth,
    });
    doc.font("Helvetica").text(String(value ?? "-"), startX + labelWidth, y, {
      width: doc.page.width - doc.page.margins.right - startX - labelWidth,
    });
    doc.moveDown(0.6);
  });
}

function writeTable(doc, columns = [], rows = [], options = {}) {
  const startX = options.x || doc.page.margins.left;
  const tableWidth =
    options.width || doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const rowHeight = options.rowHeight || 24;
  const widths = columns.map((column) =>
    column.width ? column.width : tableWidth / columns.length
  );

  function renderRow(cells, isHeader = false) {
    let x = startX;
    const y = doc.y;

    cells.forEach((cell, index) => {
      doc
        .font(isHeader ? "Helvetica-Bold" : "Helvetica")
        .fontSize(9)
        .text(String(cell ?? ""), x + 6, y + 7, {
          width: widths[index] - 12,
          height: rowHeight - 8,
        });

      x += widths[index];
    });

    doc
      .rect(startX, y, tableWidth, rowHeight)
      .strokeColor(isHeader ? "#999999" : "#dddddd")
      .stroke();

    doc.y = y + rowHeight;
  }

  renderRow(
    columns.map((column) => column.label || column.key),
    true
  );

  rows.forEach((row) => {
    renderRow(columns.map((column) => row[column.key]));
  });
}

function formatCurrency(value, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

module.exports = {
  createPdfDocument,
  collectPdfBuffer,
  writeHeader,
  drawRule,
  writeKeyValueRows,
  writeTable,
  formatCurrency,
};
