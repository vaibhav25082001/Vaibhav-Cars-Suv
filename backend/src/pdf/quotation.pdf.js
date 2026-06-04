const { formatCurrency, formatDate, renderDocument } = require("./_branded.pdf");

module.exports = function generateQuotationPdf(configuration = {}) {
  return renderDocument({
    title: "Vehicle Quotation",
    subtitle: configuration.id,
    sections: [
      { title: "Customer", rows: [["Name", configuration.customer?.name], ["Email", configuration.customer?.email], ["Phone", configuration.customer?.phone]] },
      { title: "Configuration", rows: [["Model", configuration.carModel?.name], ["Color", configuration.selectedColor], ["Interior", configuration.interiorType], ["Addons", (configuration.addons || []).join(", ")], ["Finance Type", configuration.financeType], ["Quote Date", formatDate(configuration.createdAt)]] },
    ],
    totals: [["Base Price", formatCurrency(configuration.basePrice)], ["Addons", formatCurrency(configuration.addonsPrice)], ["GST", formatCurrency(configuration.gst)], ["Total", formatCurrency(configuration.totalPrice)], ["EMI", formatCurrency(configuration.emiAmount)]],
  });
};
