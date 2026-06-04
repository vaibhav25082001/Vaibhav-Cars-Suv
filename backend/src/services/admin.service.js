const { createCrudService, prisma, withPrismaErrors } = require("./_base.service");

const showrooms = createCrudService("showroom", {
  filters: { city: "string", isActive: "boolean", managerId: "string" },
  searchFields: ["name", "city", "address", "phone", "email"],
  sortFields: ["name", "city", "createdAt"],
  requiredCreate: ["name", "city", "address", "pincode", "phone", "email", "googleMapsUrl"],
  include: { manager: true, employees: true },
  softDeleteField: "isActive",
});

const showroomTargets = createCrudService("showroomTarget", {
  filters: { showroomId: "string", month: "number", year: "number" },
  sortFields: ["month", "year", "salesTarget", "revenueTarget", "salesAchieved", "revenueAchieved"],
  requiredCreate: ["showroomId", "month", "year", "salesTarget", "revenueTarget"],
  include: { showroom: true },
});

const expenses = createCrudService("expense", {
  filters: { showroomId: "string", category: "string", month: "number", year: "number" },
  searchFields: ["description"],
  sortFields: ["month", "year", "category", "amount", "createdAt"],
  requiredCreate: ["showroomId", "category", "amount", "month", "year", "description"],
  include: { showroom: true },
});

const pipelineLogs = createCrudService("pipelineLog", {
  filters: { pipelineName: "string", status: "string" },
  searchFields: ["pipelineName", "errorMsg"],
  sortFields: ["startedAt", "completedAt", "recordsProcessed", "status"],
  dateField: "startedAt",
  requiredCreate: ["pipelineName", "status", "startedAt"],
});

async function dashboard() {
  return withPrismaErrors(async () => {
    const [customers, employees, activeCars, availableInventory, openTickets, revenue] = await Promise.all([
      prisma.customer.count(),
      prisma.employee.count({ where: { isActive: true } }),
      prisma.carModel.count({ where: { isActive: true } }),
      prisma.carInventory.count({ where: { status: "Available" } }),
      prisma.supportTicket.count({ where: { status: { in: ["Open", "InProgress", "Escalated"] } } }),
      prisma.purchase.aggregate({ _sum: { totalAmount: true }, _count: { id: true } }),
    ]);
    return {
      customers,
      employees,
      activeCars,
      availableInventory,
      openTickets,
      totalSales: revenue._count.id,
      totalRevenue: revenue._sum.totalAmount || 0,
    };
  });
}

module.exports = {
  ...showrooms,
  showrooms,
  showroomTargets,
  expenses,
  pipelineLogs,
  dashboard,
};
