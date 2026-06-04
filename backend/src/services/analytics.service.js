const { prisma, toDate, withPrismaErrors } = require("./_base.service");

function dateRange(query = {}) {
  const to = query.to ? toDate(query.to, "to") : new Date();
  const from = query.from ? toDate(query.from, "from") : new Date(to.getFullYear(), to.getMonth(), 1);
  return { from, to };
}

async function sales(query = {}) {
  return withPrismaErrors(async () => {
    const { from, to } = dateRange(query);
    const where = {
      purchaseDate: { gte: from, lte: to },
      ...(query.showroomId && { showroomId: query.showroomId }),
      ...(query.employeeId && { employeeId: query.employeeId }),
    };
    const [summary, byShowroom, byEmployee] = await Promise.all([
      prisma.purchase.aggregate({ where, _count: { id: true }, _sum: { totalAmount: true }, _avg: { totalAmount: true } }),
      prisma.purchase.groupBy({ by: ["showroomId"], where, _count: { id: true }, _sum: { totalAmount: true } }),
      prisma.purchase.groupBy({ by: ["employeeId"], where, _count: { id: true }, _sum: { totalAmount: true } }),
    ]);
    return { from, to, summary, byShowroom, byEmployee };
  });
}

async function leads(query = {}) {
  return withPrismaErrors(async () => {
    const { from, to } = dateRange(query);
    const where = { createdAt: { gte: from, lte: to }, ...(query.assignedToId && { assignedToId: query.assignedToId }) };
    const [byStage, byPriority, total] = await Promise.all([
      prisma.lead.groupBy({ by: ["stage"], where, _count: { id: true }, _avg: { score: true } }),
      prisma.lead.groupBy({ by: ["priority"], where, _count: { id: true }, _avg: { score: true } }),
      prisma.lead.count({ where }),
    ]);
    return { from, to, total, byStage, byPriority };
  });
}

async function service(query = {}) {
  return withPrismaErrors(async () => {
    const { from, to } = dateRange(query);
    const where = { bookingDate: { gte: from, lte: to }, ...(query.showroomId && { showroomId: query.showroomId }) };
    const [byStatus, cost] = await Promise.all([
      prisma.serviceBooking.groupBy({ by: ["status"], where, _count: { id: true } }),
      prisma.serviceBooking.aggregate({ where, _sum: { finalCost: true, estimatedCost: true }, _avg: { finalCost: true } }),
    ]);
    return { from, to, byStatus, cost };
  });
}

async function support(query = {}) {
  return withPrismaErrors(async () => {
    const { from, to } = dateRange(query);
    const where = { createdAt: { gte: from, lte: to }, ...(query.assignedToId && { assignedToId: query.assignedToId }) };
    const [byStatus, byPriority, csat] = await Promise.all([
      prisma.supportTicket.groupBy({ by: ["status"], where, _count: { id: true } }),
      prisma.supportTicket.groupBy({ by: ["priority"], where, _count: { id: true } }),
      prisma.supportTicket.aggregate({ where, _avg: { csatScore: true }, _count: { id: true } }),
    ]);
    return { from, to, byStatus, byPriority, csat };
  });
}

async function profitability(month = new Date().getMonth() + 1, year = new Date().getFullYear()) {
  return withPrismaErrors(() =>
    prisma.monthlyRevenueSummary.findMany({
      where: { month: Number(month), year: Number(year) },
      include: { showroom: true },
      orderBy: { grossProfit: "desc" },
    })
  );
}

module.exports = {
  sales,
  leads,
  service,
  support,
  profitability,
};
