const { formatCurrency, formatDate, renderDocument } = require("./_branded.pdf");

module.exports = function generateCustomerHistoryPdf(customer = {}) {
  return renderDocument({
    title: "Customer History",
    subtitle: customer.name,
    sections: [
      { title: "Customer", rows: [["Name", customer.name], ["Email", customer.email], ["Phone", customer.phone], ["City", customer.city], ["Tag", customer.tag], ["Loyalty Points", customer.loyaltyPoints]] },
    ],
    tables: [
      { title: "Vehicles", columns: [{ label: "Model", value: (row) => row.carModel?.name, width: 145 }, { label: "Registration", key: "registrationNumber", width: 115 }, { label: "VIN", key: "vin", width: 135 }, { label: "Next Service", value: (row) => formatDate(row.nextServiceDue), width: 103 }], rows: customer.vehicles || [] },
      { title: "Purchases", columns: [{ label: "Invoice", key: "invoiceNumber", width: 110 }, { label: "Date", value: (row) => formatDate(row.purchaseDate), width: 115 }, { label: "Vehicle", value: (row) => row.carInventory?.carModel?.name, width: 135 }, { label: "Amount", key: "totalAmount", currency: true, width: 138 }], rows: customer.purchases || [] },
      { title: "Support Tickets", columns: [{ label: "Ticket", key: "ticketNumber", width: 105 }, { label: "Issue", key: "issueType", width: 120 }, { label: "Priority", key: "priority", width: 80 }, { label: "Status", key: "status", width: 85 }, { label: "Created", value: (row) => formatDate(row.createdAt), width: 108 }], rows: customer.supportTickets || [] },
    ],
    totals: [["Lifetime Value", formatCurrency((customer.purchases || []).reduce((sum, item) => sum + Number(item.totalAmount || 0), 0))]],
  });
};
