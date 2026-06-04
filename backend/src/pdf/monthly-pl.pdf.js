const { formatCurrency, renderDocument } = require("./_branded.pdf");

module.exports = function generateMonthlyPlPdf(data = {}) {
  const rows = data.summaries || data.rows || [];
  return renderDocument({
    title: "Monthly Profit & Loss",
    subtitle: `${data.month || ""}/${data.year || ""}`,
    sections: [
      { title: "Consolidated", rows: [["Total Revenue", formatCurrency(rows.reduce((sum, row) => sum + Number(row.totalRevenue || 0), 0))], ["Total Expenses", formatCurrency(rows.reduce((sum, row) => sum + Number(row.totalExpenses || 0), 0))], ["Gross Profit", formatCurrency(rows.reduce((sum, row) => sum + Number(row.grossProfit || 0), 0))]] },
    ],
    tables: [
      {
        title: "Showroom P&L",
        columns: [
          { label: "Showroom", value: (row) => row.showroom?.name, width: 135 },
          { label: "Cars", key: "carsSold", width: 55 },
          { label: "Revenue", key: "totalRevenue", currency: true, width: 105 },
          { label: "Expenses", key: "totalExpenses", currency: true, width: 105 },
          { label: "Profit", key: "grossProfit", currency: true, width: 98 },
        ],
        rows,
      },
    ],
  });
};
