const { appError, prisma, withPrismaErrors } = require("./_base.service");

const generators = {
  invoice: require("../pdf/invoice.pdf"),
  emiSchedule: require("../pdf/emi-schedule.pdf"),
  testDriveConfirm: require("../pdf/test-drive-confirm.pdf"),
  serviceReceipt: require("../pdf/service-receipt.pdf"),
  quotation: require("../pdf/quotation.pdf"),
  payslip: require("../pdf/payslip.pdf"),
  salesReport: require("../pdf/sales-report.pdf"),
  monthlyPl: require("../pdf/monthly-pl.pdf"),
  inventoryReport: require("../pdf/inventory-report.pdf"),
  employeePerformance: require("../pdf/employee-performance.pdf"),
  customerHistory: require("../pdf/customer-history.pdf"),
  escalationReport: require("../pdf/escalation-report.pdf"),
  bankStatement: require("../pdf/bank-statement.pdf"),
};

async function getInvoiceData(purchaseId) {
  return withPrismaErrors(async () => {
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: { customer: true, carInventory: { include: { carModel: true, showroom: true } }, showroom: true, employee: true, emiPayments: true },
    });
    if (!purchase) throw appError("Purchase not found", 404);
    return purchase;
  });
}

async function getCustomerHistoryData(customerId) {
  return withPrismaErrors(async () => {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        vehicles: { include: { carModel: true } },
        purchases: { include: { carInventory: { include: { carModel: true } }, emiPayments: true } },
        testDrives: { include: { carModel: true, showroom: true } },
        serviceBookings: { include: { customerVehicle: true, jobItems: true } },
        supportTickets: { include: { messages: true, escalations: true } },
      },
    });
    if (!customer) throw appError("Customer not found", 404);
    return customer;
  });
}

async function render(type, data) {
  if (!generators[type]) throw appError(`Unsupported document type: ${type}`, 422);
  return generators[type](data);
}

module.exports = {
  generators,
  getInvoiceData,
  getCustomerHistoryData,
  render,
};
