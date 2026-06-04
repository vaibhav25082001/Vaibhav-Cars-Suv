const { formatDate, renderDocument } = require("./_branded.pdf");

module.exports = function generateInventoryReportPdf(data = {}) {
  const rows = data.inventory || data.rows || [];
  return renderDocument({
    title: "Inventory Report",
    subtitle: data.showroom?.name || "All Showrooms",
    sections: [
      { title: "Inventory Summary", rows: [["Available", rows.filter((row) => row.status === "Available").length], ["Reserved", rows.filter((row) => row.status === "Reserved").length], ["Sold", rows.filter((row) => row.status === "Sold").length], ["In Transit", rows.filter((row) => row.status === "InTransit").length]] },
    ],
    tables: [
      {
        title: "Vehicles",
        columns: [
          { label: "Model", value: (row) => row.carModel?.name, width: 120 },
          { label: "VIN", key: "vin", width: 130 },
          { label: "Color", key: "color", width: 75 },
          { label: "Showroom", value: (row) => row.showroom?.name, width: 105 },
          { label: "Status", key: "status", width: 68 },
        ],
        rows: rows.map((row) => ({ ...row, arrivalDateFormatted: formatDate(row.arrivalDate) })),
      },
    ],
  });
};
