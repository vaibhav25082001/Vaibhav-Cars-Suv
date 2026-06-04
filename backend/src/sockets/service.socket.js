const { prisma } = require("../config/db");

function serviceRoom(serviceBookingId) {
  return `service:${serviceBookingId}`;
}

module.exports = function registerServiceSocket(io, socket) {
  socket.on("service:join", (serviceBookingId) => {
    if (serviceBookingId) socket.join(serviceRoom(serviceBookingId));
  });

  socket.on("service:status_changed", async (payload = {}, ack) => {
    try {
      const serviceBooking = payload.id
        ? await prisma.serviceBooking.findUnique({
            where: { id: payload.id },
            include: { customer: true, customerVehicle: true, mechanic: true, showroom: true },
          })
        : payload;
      io.to(serviceRoom(serviceBooking.id))
        .to(`Customer:${serviceBooking.customerId}`)
        .to("service")
        .emit("service:status_changed", serviceBooking);
      if (serviceBooking.mechanicId) {
        io.to(`Employee:${serviceBooking.mechanicId}`).emit("service:status_changed", serviceBooking);
      }
      if (typeof ack === "function") ack({ ok: true, data: serviceBooking });
    } catch (error) {
      if (typeof ack === "function") ack({ ok: false, message: error.message });
    }
  });
};
