const { formatCurrency, formatDate, renderDocument } = require("./_branded.pdf");

module.exports = function generateSalesReportPdf(data = {}) {
  const purchases = data.purchases || data.rows || [];
  const total = purchases.reduce((sum, row) => sum + Number(row.totalAmount || 0), 0);
  return renderDocument({
    title: "Sales Report",
    subtitle: `${formatDate(data.from)} to ${formatDate(data.to)}`,
    sections: [
      { title: "Report Summary", rows: [["Showroom", data.showroom?.name || data.showroomName], ["Sales Count", purchases.length], ["Total Revenue", formatCurrency(total)], ["Prepared By", data.preparedBy?.name]] },
    ],
    tables: [
      {
        title: "Sales",
        columns: [
          { label: "Invoice", key: "invoiceNumber", width: 95 },
          { label: "Date", value: (row) => formatDate(row.purchaseDate), width: 110 },
          { label: "Customer", value: (row) => row.customer?.name, width: 110 },
          { label: "Vehicle", value: (row) => row.carInventory?.carModel?.name, width: 110 },
          { label: "Amount", key: "totalAmount", currency: true, width: 73 },
        ],
        rows: purchases,
      },
    ],
  });
};
