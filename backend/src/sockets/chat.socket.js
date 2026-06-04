const { prisma } = require("../config/db");

function chatRoom(ticketId) {
  return `ticket:${ticketId}:chat`;
}

module.exports = function registerChatSocket(io, socket) {
  socket.on("chat:join", (ticketId) => {
    if (ticketId) socket.join(chatRoom(ticketId));
  });

  socket.on("chat:typing", (payload = {}) => {
    if (!payload.ticketId) return;
    socket.to(chatRoom(payload.ticketId)).emit("chat:typing", {
      ticketId: payload.ticketId,
      userId: socket.user.id,
      userType: socket.userType,
      isTyping: payload.isTyping !== false,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("chat:message", async (payload = {}, ack) => {
    try {
      const message = payload.id
        ? await prisma.ticketMessage.findUnique({ where: { id: payload.id } })
        : await prisma.ticketMessage.create({
            data: {
              ticketId: payload.ticketId,
              senderId: socket.user.id,
              senderType: socket.userType === "Customer" ? "Customer" : "Agent",
              message: payload.message,
              isInternalNote: Boolean(payload.isInternalNote),
              attachments: payload.attachments || [],
            },
          });

      io.to(chatRoom(message.ticketId)).to(`ticket:${message.ticketId}`).emit("chat:message", message);
      if (typeof ack === "function") ack({ ok: true, data: message });
    } catch (error) {
      if (typeof ack === "function") ack({ ok: false, message: error.message });
    }
  });
};
