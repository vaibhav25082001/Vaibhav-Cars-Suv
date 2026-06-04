const { prisma } = require("../config/db");

module.exports = function registerNotificationSocket(io, socket) {
  socket.on("notification:join", (recipient = {}) => {
    if (recipient.recipientType && recipient.recipientId) {
      socket.join(`${recipient.recipientType}:${recipient.recipientId}`);
    }
  });

  socket.on("notification:new", async (payload = {}, ack) => {
    try {
      const notification = payload.id
        ? await prisma.notification.findUnique({ where: { id: payload.id } })
        : await prisma.notification.create({ data: payload });
      io.to(`${notification.recipientType}:${notification.recipientId}`)
        .to("notifications")
        .emit("notification:new", notification);
      if (typeof ack === "function") ack({ ok: true, data: notification });
    } catch (error) {
      if (typeof ack === "function") ack({ ok: false, message: error.message });
    }
  });
};
