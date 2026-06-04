const { prisma, requireFields, withPrismaErrors } = require("./_base.service");

function sentimentFromText(text = "") {
  const lower = text.toLowerCase();
  if (/(angry|delay|bad|worst|fraud|complaint|broken|overdue|not working)/.test(lower)) return "Angry";
  if (/(thanks|happy|great|excellent|resolved|good)/.test(lower)) return "Happy";
  return "Neutral";
}

function priorityFromText(text = "") {
  const lower = text.toLowerCase();
  if (/(breakdown|accident|urgent|fraud|legal|unsafe|fire)/.test(lower)) return "Urgent";
  if (/(delay|emi|insurance|delivery|not working)/.test(lower)) return "High";
  if (/(question|status|follow up|callback)/.test(lower)) return "Normal";
  return "Low";
}

async function scoreLead(leadId) {
  requireFields({ leadId }, ["leadId"]);
  return withPrismaErrors(async () => {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { interactions: true, customer: true, carModel: true },
    });
    if (!lead) {
      const error = new Error("Lead not found");
      error.statusCode = 404;
      throw error;
    }

    let score = 20;
    if (lead.source === "WalkIn") score += 20;
    if (lead.source === "Referral") score += 15;
    if (lead.stage === "Negotiation") score += 25;
    if (lead.stage === "TestDriveScheduled") score += 15;
    if (lead.interactions.length > 2) score += 15;
    if (lead.followUpDate && lead.followUpDate >= new Date()) score += 10;
    if (Number(lead.budgetMax || 0) >= Number(lead.carModel?.price || 0)) score += 10;
    score = Math.max(0, Math.min(100, score));

    const priority = score >= 75 ? "Hot" : score >= 45 ? "Warm" : "Cold";
    return prisma.lead.update({ where: { id: leadId }, data: { score, priority } });
  });
}

async function classifyTicketMessage(message) {
  requireFields({ message }, ["message"]);
  return {
    sentiment: sentimentFromText(message),
    priority: priorityFromText(message),
    suggestedTags: message
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 4)
      .slice(0, 6),
  };
}

async function recommendCars({ budgetMax, fuelType, type, city }) {
  return withPrismaErrors(() =>
    prisma.carModel.findMany({
      where: {
        isActive: true,
        ...(budgetMax && { price: { lte: budgetMax } }),
        ...(fuelType && { fuelType }),
        ...(type && { type }),
        ...(city && { inventory: { some: { showroom: { city }, status: "Available" } } }),
      },
      include: { offers: true, inventory: { where: { status: "Available" }, include: { showroom: true } } },
      orderBy: { price: "asc" },
      take: 10,
    })
  );
}

module.exports = {
  scoreLead,
  classifyTicketMessage,
  recommendCars,
  sentimentFromText,
  priorityFromText,
};
