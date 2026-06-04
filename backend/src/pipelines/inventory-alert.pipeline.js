const cron = require("node-cron");
const { logPipelineRun, prisma } = require("./_pipeline.util");

const PIPELINE_NAME = "inventory-alert";
const DEFAULT_THRESHOLD = Number(process.env.INVENTORY_LOW_STOCK_THRESHOLD || 3);

async function runInventoryAlertPipeline(threshold = DEFAULT_THRESHOLD) {
  const rows = await prisma.carInventory.groupBy({
    by: ["showroomId", "carModelId"],
    where: { status: "Available" },
    _count: { id: true },
  });
  const lowStock = rows.filter((row) => row._count.id <= threshold);

  for (const item of lowStock) {
    const [showroom, carModel] = await Promise.all([
      prisma.showroom.findUnique({ where: { id: item.showroomId } }),
      prisma.carModel.findUnique({ where: { id: item.carModelId } }),
    ]);

    const managers = await prisma.employee.findMany({
      where: {
        OR: [{ role: "Admin" }, { role: "ShowroomManager", showroomId: item.showroomId }],
        isActive: true,
      },
    });

    await prisma.notification.createMany({
      data: managers.map((manager) => ({
        recipientId: manager.id,
        recipientType: "Employee",
        title: "Low inventory alert",
        message: `${carModel?.name || "Vehicle"} stock at ${showroom?.name || "showroom"} is ${item._count.id}, at or below threshold ${threshold}.`,
        type: "inventory.low_stock",
        link: `/inventory?showroomId=${item.showroomId}&carModelId=${item.carModelId}`,
      })),
    });
  }

  return lowStock.length;
}

function scheduleInventoryAlertPipeline() {
  return cron.schedule("0 * * * *", () =>
    logPipelineRun(PIPELINE_NAME, runInventoryAlertPipeline).catch((error) =>
      console.error(`[pipeline:${PIPELINE_NAME}]`, error)
    )
  );
}

module.exports = {
  PIPELINE_NAME,
  runInventoryAlertPipeline,
  scheduleInventoryAlertPipeline,
};
