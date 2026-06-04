const { formatCurrency, formatDate, renderDocument } = require("./_branded.pdf");

module.exports = function generateServiceReceiptPdf(booking = {}) {
  const vehicle = booking.customerVehicle || {};
  return renderDocument({
    title: "Service Receipt",
    subtitle: booking.id,
    sections: [
      { title: "Customer and Vehicle", rows: [["Customer", booking.customer?.name], ["Registration", vehicle.registrationNumber], ["VIN", vehicle.vin], ["Service Type", booking.serviceType], ["Booking Date", formatDate(booking.bookingDate)], ["Status", booking.status]] },
    ],
    tables: [
      {
        title: "Job Items",
        columns: [{ label: "Item", key: "itemDescription", width: 250 }, { label: "Type", key: "itemType", width: 80 }, { label: "Qty", key: "quantity", width: 50 }, { label: "Unit", key: "unitPrice", currency: true, width: 70 }, { label: "Total", key: "totalPrice", currency: true, width: 48 }],
        rows: booking.jobItems || [],
      },
    ],
    totals: [["Estimated Cost", formatCurrency(booking.estimatedCost)], ["Final Cost", formatCurrency(booking.finalCost)]],
  });
};
