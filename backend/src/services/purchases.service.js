const { createCrudService, prisma, requireFields, toDate, withPrismaErrors, appError } = require("./_base.service");

const purchases = createCrudService("purchase", {
  filters: { customerId: "string", carInventoryId: "string", employeeId: "string", showroomId: "string", paymentType: "string", invoiceNumber: "string" },
  searchFields: ["invoiceNumber"],
  sortFields: ["purchaseDate", "deliveryDate", "totalAmount", "createdAt"],
  dateField: "purchaseDate",
  requiredCreate: ["customerId", "carInventoryId", "employeeId", "showroomId", "invoiceNumber", "purchaseDate", "exShowroomPrice", "rtoCharges", "insuranceAmount", "accessoriesCost", "gstAmount", "totalAmount", "paymentType", "deliveryDate"],
  mapCreate: (data) => ({ ...data, purchaseDate: toDate(data.purchaseDate, "purchaseDate"), deliveryDate: toDate(data.deliveryDate, "deliveryDate") }),
  mapUpdate: (data) => ({ ...data, purchaseDate: toDate(data.purchaseDate, "purchaseDate"), deliveryDate: toDate(data.deliveryDate, "deliveryDate") }),
  include: { customer: true, carInventory: { include: { carModel: true } }, employee: true, showroom: true, emiPayments: true },
});

const emiPayments = createCrudService("emiPayment", {
  filters: { purchaseId: "string", customerId: "string", status: "string", monthNumber: "number" },
  sortFields: ["dueDate", "paidDate", "monthNumber", "emiAmount", "status"],
  dateField: "dueDate",
  requiredCreate: ["purchaseId", "customerId", "monthNumber", "dueDate", "principalAmount", "interestAmount", "emiAmount", "balanceRemaining"],
  mapCreate: (data) => ({ ...data, dueDate: toDate(data.dueDate, "dueDate"), paidDate: toDate(data.paidDate, "paidDate") }),
  mapUpdate: (data) => ({ ...data, dueDate: toDate(data.dueDate, "dueDate"), paidDate: toDate(data.paidDate, "paidDate") }),
});

async function createPurchase(data, emiSchedule = []) {
  requireFields(data, ["customerId", "carInventoryId", "employeeId", "showroomId", "invoiceNumber", "purchaseDate", "totalAmount", "paymentType", "deliveryDate"]);
  return withPrismaErrors(() =>
    prisma.$transaction(async (tx) => {
      const inventory = await tx.carInventory.findUnique({ where: { id: data.carInventoryId } });
      if (!inventory) throw appError("Inventory vehicle not found", 404);
      if (inventory.status === "Sold") throw appError("Inventory vehicle is already sold", 409);

      const purchase = await tx.purchase.create({
        data: {
          ...data,
          purchaseDate: toDate(data.purchaseDate, "purchaseDate"),
          deliveryDate: toDate(data.deliveryDate, "deliveryDate"),
          emiPayments: emiSchedule.length
            ? {
                create: emiSchedule.map((emi) => ({
                  ...emi,
                  customerId: data.customerId,
                  dueDate: toDate(emi.dueDate, "dueDate"),
                  paidDate: toDate(emi.paidDate, "paidDate"),
                })),
              }
            : undefined,
        },
        include: { emiPayments: true, customer: true, carInventory: true },
      });

      await tx.carInventory.update({
        where: { id: data.carInventoryId },
        data: { status: "Sold", soldDate: toDate(data.purchaseDate, "purchaseDate") },
      });

      if (data.carConfigurationId) {
        await tx.carConfiguration.update({
          where: { id: data.carConfigurationId },
          data: { status: "Converted" },
        });
      }

      return purchase;
    })
  );
}

async function markEmiPaid(id, paidDate = new Date()) {
  return withPrismaErrors(() =>
    prisma.emiPayment.update({
      where: { id },
      data: { status: "Paid", paidDate: toDate(paidDate, "paidDate") },
    })
  );
}

module.exports = {
  ...purchases,
  purchases,
  emiPayments,
  createPurchase,
  markEmiPaid,
};
