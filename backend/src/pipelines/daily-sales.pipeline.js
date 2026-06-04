const cron = require("node-cron");
const { addDays, logPipelineRun, prisma, startOfDay } = require("./_pipeline.util");

const PIPELINE_NAME = "daily-sales";

async function runDailySalesPipeline(targetDate = new Date()) {
  const date = startOfDay(targetDate);
  const nextDate = addDays(date, 1);
  const showrooms = await prisma.showroom.findMany({ select: { id: true } });

  for (const showroom of showrooms) {
    const [sales, testDrives, newLeads] = await Promise.all([
      prisma.purchase.aggregate({
        where: {
          showroomId: showroom.id,
          purchaseDate: { gte: date, lt: nextDate },
        },
        _count: { id: true },
        _sum: { totalAmount: true },
      }),
      prisma.testDriveBooking.count({
        where: { showroomId: showroom.id, bookingDate: { gte: date, lt: nextDate } },
      }),
      prisma.lead.count({
        where: { createdAt: { gte: date, lt: nextDate } },
      }),
    ]);

    await prisma.dailySalesSummary.upsert({
      where: { date_showroomId: { date, showroomId: showroom.id } },
      update: {
        carsSold: sales._count.id,
        revenue: sales._sum.totalAmount || 0,
        testDrives,
        newLeads,
      },
      create: {
        date,
        showroomId: showroom.id,
        carsSold: sales._count.id,
        revenue: sales._sum.totalAmount || 0,
        testDrives,
        newLeads,
      },
    });
  }

  return showrooms.length;
}

function scheduleDailySalesPipeline() {
  return cron.schedule("0 0 * * *", () =>
    logPipelineRun(PIPELINE_NAME, runDailySalesPipeline).catch((error) =>
      console.error(`[pipeline:${PIPELINE_NAME}]`, error)
    )
  );
}

module.exports = {
  PIPELINE_NAME,
  runDailySalesPipeline,
  scheduleDailySalesPipeline,
};
