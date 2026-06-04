const cron = require("node-cron");
const { logPipelineRun, prisma } = require("./_pipeline.util");

const PIPELINE_NAME = "monthly-revenue";

async function runMonthlyRevenuePipeline(targetDate = new Date()) {
  const month = targetDate.getMonth() + 1;
  const year = targetDate.getFullYear();
  const monthStart = new Date(year, targetDate.getMonth(), 1);
  const nextMonthStart = new Date(year, targetDate.getMonth() + 1, 1);
  const showrooms = await prisma.showroom.findMany({ select: { id: true } });

  for (const showroom of showrooms) {
    const [purchases, expenses, newCustomers] = await Promise.all([
      prisma.purchase.aggregate({
        where: {
          showroomId: showroom.id,
          purchaseDate: { gte: monthStart, lt: nextMonthStart },
        },
        _count: { id: true },
        _sum: { totalAmount: true },
        _avg: { totalAmount: true },
      }),
      prisma.expense.aggregate({
        where: { showroomId: showroom.id, month, year },
        _sum: { amount: true },
      }),
      prisma.customer.count({
        where: { createdAt: { gte: monthStart, lt: nextMonthStart } },
      }),
    ]);

    const totalRevenue = purchases._sum.totalAmount || 0;
    const totalExpenses = expenses._sum.amount || 0;

    await prisma.monthlyRevenueSummary.upsert({
      where: { month_year_showroomId: { month, year, showroomId: showroom.id } },
      update: {
        totalRevenue,
        totalExpenses,
        grossProfit: Number(totalRevenue) - Number(totalExpenses),
        carsSold: purchases._count.id,
        newCustomers,
        avgDealSize: purchases._avg.totalAmount || 0,
      },
      create: {
        month,
        year,
        showroomId: showroom.id,
        totalRevenue,
        totalExpenses,
        grossProfit: Number(totalRevenue) - Number(totalExpenses),
        carsSold: purchases._count.id,
        newCustomers,
        avgDealSize: purchases._avg.totalAmount || 0,
      },
    });
  }

  return showrooms.length;
}

function scheduleMonthlyRevenuePipeline() {
  return cron.schedule("0 1 1 * *", () =>
    logPipelineRun(PIPELINE_NAME, runMonthlyRevenuePipeline).catch((error) =>
      console.error(`[pipeline:${PIPELINE_NAME}]`, error)
    )
  );
}

module.exports = {
  PIPELINE_NAME,
  runMonthlyRevenuePipeline,
  scheduleMonthlyRevenuePipeline,
};
