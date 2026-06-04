const { formatCurrency, formatDate, renderDocument } = require("./_branded.pdf");

module.exports = function generateBankStatementPdf(data = {}) {
  const transactions = data.transactions || [];
  const closingBalance = transactions.reduce(
    (balance, row) => balance + Number(row.credit || 0) - Number(row.debit || 0),
    Number(data.openingBalance || 0)
  );
  return renderDocument({
    title: "Bank Statement",
    subtitle: data.accountNumber || data.bankName,
    sections: [
      { title: "Account", rows: [["Bank", data.bankName], ["Account Name", data.accountName], ["Account Number", data.accountNumber], ["Period", `${formatDate(data.from)} to ${formatDate(data.to)}`], ["Opening Balance", formatCurrency(data.openingBalance)], ["Closing Balance", formatCurrency(closingBalance)]] },
    ],
    tables: [
      {
        title: "Transactions",
        columns: [
          { label: "Date", value: (row) => formatDate(row.date), width: 100 },
          { label: "Particulars", key: "particulars", width: 190 },
          { label: "Ref", key: "reference", width: 70 },
          { label: "Debit", key: "debit", currency: true, width: 69 },
          { label: "Credit", key: "credit", currency: true, width: 69 },
        ],
        rows: transactions,
      },
    ],
  });
};
