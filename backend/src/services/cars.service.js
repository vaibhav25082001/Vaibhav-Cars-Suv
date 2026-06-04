const { createCrudService, prisma, requireFields, withPrismaErrors } = require("./_base.service");

const carModels = createCrudService("carModel", {
  filters: { type: "string", fuelType: "string", isActive: "boolean" },
  searchFields: ["name", "torque", "mileage"],
  sortFields: ["name", "type", "fuelType", "price", "engineCc", "bhp", "createdAt"],
  requiredCreate: ["name", "type", "price", "engineCc", "bhp", "torque", "fuelType", "mileage"],
  include: { offers: true, inventory: { include: { showroom: true } } },
  softDeleteField: "isActive",
});

const configurations = createCrudService("carConfiguration", {
  filters: { customerId: "string", carModelId: "string", status: "string", financeType: "string" },
  searchFields: ["selectedColor", "interiorType"],
  sortFields: ["createdAt", "basePrice", "totalPrice", "status"],
  requiredCreate: ["customerId", "carModelId", "selectedColor", "interiorType", "basePrice", "addonsPrice", "gst", "totalPrice", "financeType"],
  include: { customer: true, carModel: true },
});

const wishlists = createCrudService("wishlist", {
  filters: { customerId: "string", carModelId: "string", priceAlertEnabled: "boolean" },
  sortFields: ["createdAt"],
  requiredCreate: ["customerId", "carModelId"],
  include: { customer: true, carModel: true },
});

async function compareModels(ids = []) {
  if (!Array.isArray(ids) || ids.length < 2) {
    const error = new Error("At least two car model ids are required");
    error.statusCode = 422;
    throw error;
  }

  return withPrismaErrors(() =>
    prisma.carModel.findMany({
      where: { id: { in: ids }, isActive: true },
      include: { offers: true, inventory: true },
      orderBy: { price: "asc" },
    })
  );
}

async function addToWishlist(customerId, carModelId, priceAlertEnabled = false) {
  requireFields({ customerId, carModelId }, ["customerId", "carModelId"]);
  return withPrismaErrors(() =>
    prisma.wishlist.upsert({
      where: { customerId_carModelId: { customerId, carModelId } },
      update: { priceAlertEnabled },
      create: { customerId, carModelId, priceAlertEnabled },
      include: { carModel: true },
    })
  );
}

module.exports = {
  ...carModels,
  carModels,
  configurations,
  wishlists,
  compareModels,
  addToWishlist,
};
