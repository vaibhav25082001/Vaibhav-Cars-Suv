const { prisma } = require("../config/db");

function ticketRoom(ticketId) {
  return `ticket:${ticketId}`;
}

module.exports = function registerTicketSocket(io, socket) {
  socket.on("ticket:join", (ticketId) => {
    if (ticketId) socket.join(ticketRoom(ticketId));
  });

  socket.on("ticket:new", async (payload = {}, ack) => {
    try {
      const ticket = payload.id
        ? await prisma.supportTicket.findUnique({ where: { id: payload.id }, include: { customer: true, assignedTo: true } })
        : payload;
      io.to("support").to("employee").emit("ticket:new", ticket);
      if (ticket.customerId) io.to(`Customer:${ticket.customerId}`).emit("ticket:new", ticket);
      if (typeof ack === "function") ack({ ok: true, data: ticket });
    } catch (error) {
      if (typeof ack === "function") ack({ ok: false, message: error.message });
    }
  });

  socket.on("ticket:updated", async (payload = {}, ack) => {
    try {
      const ticket = payload.id
        ? await prisma.supportTicket.findUnique({ where: { id: payload.id }, include: { customer: true, assignedTo: true, messages: true } })
        : payload;
      io.to(ticketRoom(ticket.id)).to(`Customer:${ticket.customerId}`).emit("ticket:updated", ticket);
      if (ticket.assignedToId) io.to(`Employee:${ticket.assignedToId}`).emit("ticket:updated", ticket);
      if (typeof ack === "function") ack({ ok: true, data: ticket });
    } catch (error) {
      if (typeof ack === "function") ack({ ok: false, message: error.message });
    }
  });

  socket.on("ticket:escalated", async (payload = {}, ack) => {
    try {
      const escalation = payload.id
        ? await prisma.ticketEscalation.findUnique({ where: { id: payload.id }, include: { ticket: true, escalatedBy: true, escalatedTo: true } })
        : payload;
      io.to(ticketRoom(escalation.ticketId)).to("support").emit("ticket:escalated", escalation);
      if (escalation.escalatedToId) io.to(`Employee:${escalation.escalatedToId}`).emit("ticket:escalated", escalation);
      if (typeof ack === "function") ack({ ok: true, data: escalation });
    } catch (error) {
      if (typeof ack === "function") ack({ ok: false, message: error.message });
    }
  });
};
