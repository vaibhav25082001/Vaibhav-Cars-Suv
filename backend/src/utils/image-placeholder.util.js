const crypto = require("crypto");

const COLORS = [
  ["#0f766e", "#ccfbf1"],
  ["#1d4ed8", "#dbeafe"],
  ["#be123c", "#ffe4e6"],
  ["#7c3aed", "#ede9fe"],
  ["#b45309", "#fef3c7"],
  ["#15803d", "#dcfce7"],
];

function hashText(text) {
  return crypto.createHash("md5").update(String(text || "VC")).digest("hex");
}

function getInitials(text = "VC") {
  const words = String(text)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "VC";
  }

  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

function getPalette(seed) {
  const hash = hashText(seed);
  const index = parseInt(hash.slice(0, 2), 16) % COLORS.length;

  return COLORS[index];
}

function createSvgPlaceholder(options = {}) {
  const width = Number(options.width || 800);
  const height = Number(options.height || 500);
  const label = options.label || "Vaibhav Cars";
  const initials = options.initials || getInitials(label);
  const [background, foreground] = options.colors || getPalette(label);
  const fontSize = Math.max(24, Math.floor(Math.min(width, height) * 0.18));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(
    label
  )}">
  <rect width="100%" height="100%" fill="${background}"/>
  <circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(
    width,
    height
  ) * 0.24}" fill="${foreground}" opacity="0.18"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${foreground}" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="700">${escapeXml(
    initials
  )}</text>
</svg>`;
}

function createDataUriPlaceholder(options = {}) {
  const svg = createSvgPlaceholder(options);
  const encoded = Buffer.from(svg).toString("base64");

  return `data:image/svg+xml;base64,${encoded}`;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

module.exports = {
  createSvgPlaceholder,
  createDataUriPlaceholder,
  getInitials,
  getPalette,
};
