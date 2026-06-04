const cron = require("node-cron");
const { logPipelineRun, prisma } = require("./_pipeline.util");

const PIPELINE_NAME = "sla-breach";

async function runSlaBreachPipeline(now = new Date()) {
  const breachedTickets = await prisma.supportTicket.findMany({
    where: {
      status: { in: ["Open", "InProgress"] },
      slaDeadline: { lt: now },
    },
    include: { assignedTo: true, customer: true },
  });

  for (const ticket of breachedTickets) {
    const supervisor = await prisma.employee.findFirst({
      where: {
        isActive: true,
        OR: [{ role: "SupportSupervisor" }, { role: "Admin" }],
      },
      orderBy: { role: "asc" },
    });

    await prisma.$transaction(async (tx) => {
      await tx.supportTicket.update({
        where: { id: ticket.id },
        data: {
          status: "Escalated",
          priority: ticket.priority === "Urgent" ? "Urgent" : "High",
        },
      });

      if (supervisor && ticket.assignedToId) {
        await tx.ticketEscalation.create({
          data: {
            ticketId: ticket.id,
            escalatedById: ticket.assignedToId,
            escalatedToId: supervisor.id,
            reason: `SLA deadline breached at ${ticket.slaDeadline.toISOString()}`,
            level: 1,
          },
        });
      }

      if (supervisor) {
        await tx.notification.create({
          data: {
            recipientId: supervisor.id,
            recipientType: "Employee",
            title: "SLA breach escalated",
            message: `Ticket ${ticket.ticketNumber} for ${ticket.customer.name} breached SLA.`,
            type: "support.sla_breach",
            link: `/support/tickets/${ticket.id}`,
          },
        });
      }
    });
  }

  return breachedTickets.length;
}

function scheduleSlaBreachPipeline() {
  return cron.schedule("*/30 * * * *", () =>
    logPipelineRun(PIPELINE_NAME, runSlaBreachPipeline).catch((error) =>
      console.error(`[pipeline:${PIPELINE_NAME}]`, error)
    )
  );
}

module.exports = {
  PIPELINE_NAME,
  runSlaBreachPipeline,
  scheduleSlaBreachPipeline,
};
