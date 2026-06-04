const { formatCurrency, formatDate, renderDocument } = require("./_branded.pdf");

module.exports = function generateInvoicePdf(purchase = {}) {
  const car = purchase.carInventory?.carModel || purchase.carModel || {};
  return renderDocument({
    title: "Tax Invoice",
    subtitle: purchase.invoiceNumber,
    sections: [
      { title: "Customer", rows: [["Name", purchase.customer?.name], ["Email", purchase.customer?.email], ["Phone", purchase.customer?.phone], ["City", purchase.customer?.city]] },
      { title: "Vehicle", rows: [["Model", car.name], ["VIN", purchase.carInventory?.vin], ["Color", purchase.carInventory?.color], ["Fuel", car.fuelType], ["Delivery Date", formatDate(purchase.deliveryDate)]] },
      { title: "Sale", rows: [["Invoice Number", purchase.invoiceNumber], ["Purchase Date", formatDate(purchase.purchaseDate)], ["Sales Executive", purchase.employee?.name], ["Showroom", purchase.showroom?.name], ["Payment Type", purchase.paymentType]] },
    ],
    tables: [
      {
        title: "Charges",
        columns: [{ label: "Description", key: "label", width: 330 }, { label: "Amount", key: "amount", currency: true, width: 168 }],
        rows: [
          { label: "Ex-showroom price", amount: purchase.exShowroomPrice },
          { label: "RTO charges", amount: purchase.rtoCharges },
          { label: "Insurance", amount: purchase.insuranceAmount },
          { label: "Accessories", amount: purchase.accessoriesCost },
          { label: "GST", amount: purchase.gstAmount },
        ],
      },
    ],
    totals: [["Invoice Total", formatCurrency(purchase.totalAmount)], ["Loan Amount", formatCurrency(purchase.loanAmount)], ["EMI", formatCurrency(purchase.emiAmount)]],
  });
};
