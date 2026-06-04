const PDFDocument = require("pdfkit");

const GOLD = "#C9A84C";
const DARK = "#1F2933";
const MUTED = "#667085";
const LIGHT = "#E5E7EB";

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function collect(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}

function ensureSpace(doc, height = 90) {
  if (doc.y + height > doc.page.height - 80) doc.addPage();
}

function header(doc, title, subtitle) {
  doc.rect(0, 0, doc.page.width, 86).fill(DARK);
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(18).text("VAIBHAV Cars & SUV", 48, 24);
  doc.fillColor("#FFFFFF").fontSize(10).font("Helvetica").text("Premium Cars, SUVs, Service and Support", 48, 48);
  doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(16).text(title, 320, 24, { align: "right", width: 225 });
  doc.fillColor("#D0D5DD").font("Helvetica").fontSize(9).text(subtitle || `Generated ${formatDate(new Date())}`, 320, 48, { align: "right", width: 225 });
  doc.y = 112;
}

function footer(doc) {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i += 1) {
    doc.switchToPage(i);
    const y = doc.page.height - 58;
    doc.moveTo(48, y).lineTo(doc.page.width - 48, y).strokeColor(LIGHT).stroke();
    doc.fillColor(MUTED).font("Helvetica").fontSize(8);
    doc.text(`Generated: ${formatDate(new Date())}`, 48, y + 12, { width: 220 });
    doc.text(`Page ${i + 1} of ${range.count}`, doc.page.width - 140, y + 12, { width: 92, align: "right" });
    doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(9).text("Dealer Stamp", 48, y + 28);
    doc.roundedRect(128, y + 22, 96, 24, 3).strokeColor(GOLD).stroke();
  }
}

function sectionTitle(doc, title) {
  ensureSpace(doc, 44);
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(12).text(title);
  doc.moveTo(48, doc.y + 3).lineTo(doc.page.width - 48, doc.y + 3).strokeColor(LIGHT).stroke();
  doc.moveDown(0.8);
}

function keyValues(doc, rows = []) {
  const labelWidth = 145;
  rows.filter(Boolean).forEach(([label, value]) => {
    ensureSpace(doc, 22);
    const y = doc.y;
    doc.fillColor(MUTED).font("Helvetica-Bold").fontSize(9).text(label, 48, y, { width: labelWidth });
    doc.fillColor(DARK).font("Helvetica").fontSize(9).text(String(value ?? "-"), 48 + labelWidth, y, { width: 350 });
    doc.y = y + 18;
  });
  doc.moveDown(0.3);
}

function table(doc, columns = [], rows = []) {
  ensureSpace(doc, 60);
  const usableWidth = doc.page.width - 96;
  const widths = columns.map((column) => column.width || usableWidth / columns.length);
  const rowHeight = 24;

  function row(values, isHeader = false) {
    ensureSpace(doc, rowHeight + 8);
    let x = 48;
    const y = doc.y;
    if (isHeader) doc.rect(48, y, usableWidth, rowHeight).fill(GOLD);
    values.forEach((value, index) => {
      doc
        .fillColor(isHeader ? "#FFFFFF" : DARK)
        .font(isHeader ? "Helvetica-Bold" : "Helvetica")
        .fontSize(8)
        .text(String(value ?? "-"), x + 5, y + 7, { width: widths[index] - 10, height: rowHeight - 8 });
      x += widths[index];
    });
    doc.rect(48, y, usableWidth, rowHeight).strokeColor(LIGHT).stroke();
    doc.y = y + rowHeight;
  }

  row(columns.map((column) => column.label), true);
  rows.forEach((item) => row(columns.map((column) => {
    const value = typeof column.value === "function" ? column.value(item) : item[column.key];
    return column.currency ? formatCurrency(value) : value;
  })));
  doc.moveDown();
}

async function renderDocument({ title, subtitle, sections = [], tables = [], totals = [] }) {
  const doc = new PDFDocument({ size: "A4", margin: 48, bufferPages: true });
  const done = collect(doc);
  header(doc, title, subtitle);

  sections.forEach((section) => {
    sectionTitle(doc, section.title);
    keyValues(doc, section.rows);
  });

  tables.forEach((tableConfig) => {
    sectionTitle(doc, tableConfig.title);
    table(doc, tableConfig.columns, tableConfig.rows);
  });

  if (totals.length) {
    sectionTitle(doc, "Totals");
    keyValues(doc, totals);
  }

  footer(doc);
  doc.end();
  return done;
}

module.exports = {
  GOLD,
  formatCurrency,
  formatDate,
  renderDocument,
};
