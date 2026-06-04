const bcrypt = require("bcrypt");
const {
  createCrudService,
  prisma,
  requireFields,
  toDate,
  withPrismaErrors,
} = require("./_base.service");

const customers = createCrudService("customer", {
  filters: { city: "string", tag: "string", referredById: "string" },
  searchFields: ["name", "email", "phone", "city", "referralCode"],
  sortFields: ["name", "email", "city", "loyaltyPoints", "createdAt", "lastLogin"],
  requiredCreate: ["name", "email", "phone", "city", "passwordHash", "referralCode"],
  include: { vehicles: true, purchases: true, leads: true },
});

const vehicles = createCrudService("customerVehicle", {
  filters: { customerId: "string", carModelId: "string", vin: "string", registrationNumber: "string" },
  searchFields: ["vin", "registrationNumber", "insuranceCompany", "color"],
  sortFields: ["purchaseDate", "purchasePrice", "insuranceExpiry", "nextServiceDue", "createdAt"],
  dateField: "purchaseDate",
  requiredCreate: ["customerId", "carModelId", "vin", "registrationNumber", "purchaseDate", "purchasePrice", "insuranceCompany", "insuranceExpiry", "nextServiceDue", "color"],
  mapCreate: (data) => ({
    ...data,
    purchaseDate: toDate(data.purchaseDate, "purchaseDate"),
    insuranceExpiry: toDate(data.insuranceExpiry, "insuranceExpiry"),
    nextServiceDue: toDate(data.nextServiceDue, "nextServiceDue"),
  }),
  mapUpdate: (data) => ({
    ...data,
    purchaseDate: toDate(data.purchaseDate, "purchaseDate"),
    insuranceExpiry: toDate(data.insuranceExpiry, "insuranceExpiry"),
    nextServiceDue: toDate(data.nextServiceDue, "nextServiceDue"),
  }),
  include: { customer: true, carModel: true },
});

const activities = createCrudService("customerActivityLog", {
  filters: { customerId: "string", actionType: "string", ipAddress: "string" },
  sortFields: ["createdAt", "actionType"],
  dateField: "createdAt",
  requiredCreate: ["customerId", "actionType", "metadata", "ipAddress"],
  include: { customer: true },
});

async function createCustomer(data) {
  requireFields(data, ["name", "email", "phone", "city", "password"]);
  return withPrismaErrors(async () => {
    const passwordHash = await bcrypt.hash(data.password, 12);
    return prisma.customer.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        city: data.city,
        passwordHash,
        profilePhotoUrl: data.profilePhotoUrl,
        referralCode:
          data.referralCode ||
          `${data.name.replace(/\s+/g, "").slice(0, 4).toUpperCase()}${Date.now()}`,
        referredById: data.referredById,
        tag: data.tag,
      },
    });
  });
}

async function adjustLoyaltyPoints(customerId, points, reason = "Manual adjustment") {
  requireFields({ customerId, points }, ["customerId", "points"]);
  return withPrismaErrors(() =>
    prisma.$transaction(async (tx) => {
      const customer = await tx.customer.update({
        where: { id: customerId },
        data: { loyaltyPoints: { increment: Number(points) } },
      });
      await tx.customerActivityLog.create({
        data: {
          customerId,
          actionType: "PageView",
          metadata: { reason, points: Number(points), action: "LOYALTY_ADJUSTMENT" },
          ipAddress: "system",
        },
      });
      return customer;
    })
  );
}

module.exports = {
  ...customers,
  customers,
  vehicles,
  activities,
  createCustomer,
  adjustLoyaltyPoints,
};
