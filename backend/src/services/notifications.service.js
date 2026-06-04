const { createCrudService, prisma, requireFields, withPrismaErrors } = require("./_base.service");

const notifications = createCrudService("notification", {
  filters: { recipientId: "string", recipientType: "string", type: "string", isRead: "boolean" },
  searchFields: ["title", "message", "type"],
  sortFields: ["createdAt", "type", "isRead"],
  dateField: "createdAt",
  requiredCreate: ["recipientId", "recipientType", "title", "message", "type"],
});

async function createNotification(data, io) {
  requireFields(data, ["recipientId", "recipientType", "title", "message", "type"]);
  return withPrismaErrors(async () => {
    const notification = await prisma.notification.create({ data });
    if (io) {
      io.to(`${data.recipientType}:${data.recipientId}`).emit("notification:new", notification);
      io.to("notifications").emit("notification:new", notification);
    }
    return notification;
  });
}

async function markRead(id) {
  requireFields({ id }, ["id"]);
  return withPrismaErrors(() =>
    prisma.notification.update({ where: { id }, data: { isRead: true } })
  );
}

async function markAllRead(recipientId, recipientType) {
  requireFields({ recipientId, recipientType }, ["recipientId", "recipientType"]);
  return withPrismaErrors(() =>
    prisma.notification.updateMany({
      where: { recipientId, recipientType, isRead: false },
      data: { isRead: true },
    })
  );
}

module.exports = {
  ...notifications,
  notifications,
  createNotification,
  markRead,
  markAllRead,
};
