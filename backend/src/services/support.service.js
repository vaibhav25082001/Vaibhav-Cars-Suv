const {
  appError,
  createCrudService,
  prisma,
  requireFields,
  toDate,
  withPrismaErrors,
} = require("./_base.service");

const tickets = createCrudService("supportTicket", {
  filters: { customerId: "string", assignedToId: "string", issueType: "string", priority: "string", status: "string", sentiment: "string", channel: "string" },
  searchFields: ["ticketNumber"],
  sortFields: ["createdAt", "slaDeadline", "priority", "status", "csatScore"],
  dateField: "createdAt",
  requiredCreate: ["customerId", "ticketNumber", "issueType", "priority", "channel", "slaDeadline"],
  mapCreate: (data) => ({ ...data, slaDeadline: toDate(data.slaDeadline, "slaDeadline"), resolvedAt: toDate(data.resolvedAt, "resolvedAt") }),
  mapUpdate: (data) => ({ ...data, slaDeadline: toDate(data.slaDeadline, "slaDeadline"), resolvedAt: toDate(data.resolvedAt, "resolvedAt") }),
  include: { customer: true, assignedTo: true, messages: true, escalations: true },
});

const messages = createCrudService("ticketMessage", {
  filters: { ticketId: "string", senderId: "string", senderType: "string", isInternalNote: "boolean" },
  searchFields: ["message"],
  sortFields: ["createdAt", "senderType"],
  dateField: "createdAt",
  requiredCreate: ["ticketId", "senderId", "senderType", "message"],
  include: { ticket: true },
});

const escalations = createCrudService("ticketEscalation", {
  filters: { ticketId: "string", escalatedById: "string", escalatedToId: "string", level: "number" },
  searchFields: ["reason"],
  sortFields: ["createdAt", "resolvedAt", "level"],
  dateField: "createdAt",
  requiredCreate: ["ticketId", "escalatedById", "escalatedToId", "reason", "level"],
  mapCreate: (data) => ({ ...data, resolvedAt: toDate(data.resolvedAt, "resolvedAt") }),
  mapUpdate: (data) => ({ ...data, resolvedAt: toDate(data.resolvedAt, "resolvedAt") }),
  include: { ticket: true, escalatedBy: true, escalatedTo: true },
});

const cannedResponses = createCrudService("cannedResponse", {
  filters: { category: "string", createdById: "string" },
  searchFields: ["title", "content", "category"],
  sortFields: ["title", "category", "createdAt"],
  requiredCreate: ["title", "content", "category", "createdById"],
  include: { createdBy: true },
});

const kbArticles = createCrudService("kbArticle", {
  filters: { category: "string", isPublic: "boolean", createdById: "string" },
  searchFields: ["title", "content"],
  sortFields: ["title", "category", "useCount", "createdAt", "updatedAt"],
  requiredCreate: ["title", "content", "category", "createdById"],
  include: { createdBy: true },
});

async function addMessage(ticketId, data) {
  requireFields({ ticketId, ...data }, ["ticketId", "senderId", "senderType", "message"]);
  return withPrismaErrors(() =>
    prisma.$transaction(async (tx) => {
      const message = await tx.ticketMessage.create({ data: { ...data, ticketId } });
      await tx.supportTicket.update({
        where: { id: ticketId },
        data: { status: data.senderType === "Agent" ? "InProgress" : undefined },
      });
      return message;
    })
  );
}

async function escalateTicket(ticketId, data) {
  requireFields({ ticketId, ...data }, ["ticketId", "escalatedById", "escalatedToId", "reason", "level"]);
  return withPrismaErrors(() =>
    prisma.$transaction(async (tx) => {
      const ticket = await tx.supportTicket.findUnique({ where: { id: ticketId } });
      if (!ticket) throw appError("Ticket not found", 404);
      const escalation = await tx.ticketEscalation.create({ data: { ...data, ticketId } });
      await tx.supportTicket.update({ where: { id: ticketId }, data: { status: "Escalated" } });
      return escalation;
    })
  );
}

module.exports = {
  ...tickets,
  tickets,
  messages,
  escalations,
  cannedResponses,
  kbArticles,
  addMessage,
  escalateTicket,
};
