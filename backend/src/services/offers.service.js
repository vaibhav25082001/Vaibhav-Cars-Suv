const { createCrudService, prisma, toDate, withPrismaErrors } = require("./_base.service");

const offers = createCrudService("offer", {
  filters: { carModelId: "string", isActive: "boolean" },
  searchFields: ["title", "description"],
  sortFields: ["title", "discountPercent", "validFrom", "validTill", "createdAt"],
  dateField: "validFrom",
  requiredCreate: ["title", "description", "discountPercent", "validFrom", "validTill"],
  mapCreate: (data) => ({ ...data, validFrom: toDate(data.validFrom, "validFrom"), validTill: toDate(data.validTill, "validTill") }),
  mapUpdate: (data) => ({ ...data, validFrom: toDate(data.validFrom, "validFrom"), validTill: toDate(data.validTill, "validTill") }),
  include: { carModel: true },
  softDeleteField: "isActive",
});

async function activeOffers(carModelId) {
  const now = new Date();
  return withPrismaErrors(() =>
    prisma.offer.findMany({
      where: {
        isActive: true,
        validFrom: { lte: now },
        validTill: { gte: now },
        ...(carModelId && { OR: [{ carModelId }, { carModelId: null }] }),
      },
      include: { carModel: true },
      orderBy: { discountPercent: "desc" },
    })
  );
}

module.exports = {
  ...offers,
  offers,
  activeOffers,
};
