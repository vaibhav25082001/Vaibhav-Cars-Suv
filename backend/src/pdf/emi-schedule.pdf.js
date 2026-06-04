const { formatCurrency, formatDate, renderDocument } = require("./_branded.pdf");

module.exports = function generateEmiSchedulePdf(data = {}) {
  const purchase = data.purchase || data;
  const payments = data.emiPayments || purchase.emiPayments || [];
  return renderDocument({
    title: "EMI Schedule",
    subtitle: purchase.invoiceNumber,
    sections: [
      { title: "Loan Summary", rows: [["Customer", purchase.customer?.name], ["Loan Amount", formatCurrency(purchase.loanAmount)], ["Tenure", `${purchase.loanTenure || payments.length} months`], ["Rate", `${purchase.loanRate || 0}%`], ["Monthly EMI", formatCurrency(purchase.emiAmount)]] },
    ],
    tables: [
      {
        title: "Installments",
        columns: [
          { label: "Month", key: "monthNumber", width: 60 },
          { label: "Due Date", value: (row) => formatDate(row.dueDate), width: 115 },
          { label: "Principal", key: "principalAmount", currency: true, width: 90 },
          { label: "Interest", key: "interestAmount", currency: true, width: 85 },
          { label: "EMI", key: "emiAmount", currency: true, width: 80 },
          { label: "Status", key: "status", width: 68 },
        ],
        rows: payments,
      },
    ],
  });
};
