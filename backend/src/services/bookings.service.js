const { createCrudService, prisma, toDate, withPrismaErrors } = require("./_base.service");

const testDrives = createCrudService("testDriveBooking", {
  filters: { customerId: "string", carModelId: "string", showroomId: "string", employeeId: "string", status: "string" },
  searchFields: ["timeSlot", "postDriveFeedback", "customerReaction"],
  sortFields: ["bookingDate", "createdAt", "status"],
  dateField: "bookingDate",
  requiredCreate: ["customerId", "carModelId", "showroomId", "bookingDate", "timeSlot"],
  mapCreate: (data) => ({ ...data, bookingDate: toDate(data.bookingDate, "bookingDate") }),
  mapUpdate: (data) => ({ ...data, bookingDate: toDate(data.bookingDate, "bookingDate") }),
  include: { customer: true, carModel: true, showroom: true, employee: true },
});

const serviceBookings = createCrudService("serviceBooking", {
  filters: { customerId: "string", customerVehicleId: "string", showroomId: "string", mechanicId: "string", status: "string", serviceType: "string" },
  searchFields: ["serviceType", "description", "timeSlot"],
  sortFields: ["bookingDate", "createdAt", "status", "estimatedCost", "finalCost"],
  dateField: "bookingDate",
  requiredCreate: ["customerId", "customerVehicleId", "showroomId", "serviceType", "description", "bookingDate", "timeSlot", "estimatedCost"],
  mapCreate: (data) => ({ ...data, bookingDate: toDate(data.bookingDate, "bookingDate") }),
  mapUpdate: (data) => ({ ...data, bookingDate: toDate(data.bookingDate, "bookingDate") }),
  include: { customer: true, customerVehicle: true, showroom: true, mechanic: true, jobItems: true },
});

const jobItems = createCrudService("serviceJobItem", {
  filters: { serviceBookingId: "string", itemType: "string" },
  searchFields: ["itemDescription"],
  sortFields: ["quantity", "unitPrice", "totalPrice"],
  requiredCreate: ["serviceBookingId", "itemDescription", "itemType", "quantity", "unitPrice", "totalPrice"],
  include: { serviceBooking: true },
});

async function completeServiceBooking(id, finalCost, jobItemsData = []) {
  return withPrismaErrors(() =>
    prisma.$transaction(async (tx) => {
      if (jobItemsData.length) {
        await tx.serviceJobItem.createMany({
          data: jobItemsData.map((item) => ({ ...item, serviceBookingId: id })),
        });
      }
      return tx.serviceBooking.update({
        where: { id },
        data: { finalCost, status: "Done" },
        include: { jobItems: true, customer: true, customerVehicle: true },
      });
    })
  );
}

module.exports = {
  testDrives,
  serviceBookings,
  jobItems,
  completeServiceBooking,
  list: testDrives.list,
  getById: testDrives.getById,
  create: testDrives.create,
  update: testDrives.update,
  remove: testDrives.remove,
};
