const { appError, createCrudService, prisma, requireFields, toDate, withPrismaErrors } = require("./_base.service");

const inventory = createCrudService("carInventory", {
  filters: { carModelId: "string", showroomId: "string", color: "string", status: "string", vin: "string" },
  searchFields: ["vin", "color"],
  sortFields: ["arrivalDate", "soldDate", "createdAt", "status", "color"],
  dateField: "arrivalDate",
  requiredCreate: ["carModelId", "showroomId", "color", "vin", "arrivalDate"],
  mapCreate: (data) => ({ ...data, arrivalDate: toDate(data.arrivalDate, "arrivalDate"), soldDate: toDate(data.soldDate, "soldDate") }),
  mapUpdate: (data) => ({ ...data, arrivalDate: toDate(data.arrivalDate, "arrivalDate"), soldDate: toDate(data.soldDate, "soldDate") }),
  include: { carModel: true, showroom: true, purchase: true },
});

const showrooms = createCrudService("showroom", {
  filters: { city: "string", isActive: "boolean", managerId: "string" },
  searchFields: ["name", "city", "address", "phone", "email"],
  sortFields: ["name", "city", "createdAt"],
  requiredCreate: ["name", "city", "address", "pincode", "phone", "email", "googleMapsUrl"],
  include: { manager: true },
  softDeleteField: "isActive",
});

async function reserveVehicle(id) {
  requireFields({ id }, ["id"]);
  return withPrismaErrors(async () => {
    const vehicle = await prisma.carInventory.findUnique({ where: { id } });
    if (!vehicle) throw appError("Inventory vehicle not found", 404);
    if (vehicle.status !== "Available") throw appError("Only available vehicles can be reserved", 409);
    return prisma.carInventory.update({ where: { id }, data: { status: "Reserved" } });
  });
}

async function lowStockReport(threshold = 3) {
  return withPrismaErrors(async () => {
    const rows = await prisma.carInventory.groupBy({
      by: ["showroomId", "carModelId"],
      where: { status: "Available" },
      _count: { id: true },
    });
    const lowRows = rows.filter((row) => row._count.id <= Number(threshold));
    const models = await prisma.carModel.findMany({ where: { id: { in: lowRows.map((row) => row.carModelId) } } });
    const showroomsData = await prisma.showroom.findMany({ where: { id: { in: lowRows.map((row) => row.showroomId) } } });
    return lowRows.map((row) => ({
      showroom: showroomsData.find((item) => item.id === row.showroomId),
      carModel: models.find((item) => item.id === row.carModelId),
      available: row._count.id,
      threshold: Number(threshold),
    }));
  });
}

module.exports = {
  ...inventory,
  inventory,
  showrooms,
  reserveVehicle,
  lowStockReport,
};
