const cron = require("node-cron");
const { getLeadPriority, scoreLead } = require("../utils/lead-scorer.util");
const { logPipelineRun, prisma } = require("./_pipeline.util");

const PIPELINE_NAME = "lead-scoring";

async function runLeadScoringPipeline() {
  const leads = await prisma.lead.findMany({
    where: { stage: { notIn: ["ClosedWon", "ClosedLost"] } },
    include: { customer: true, carModel: true, assignedTo: true },
  });

  for (const lead of leads) {
    const score = scoreLead(lead);
    await prisma.lead.update({
      where: { id: lead.id },
      data: { score, priority: getLeadPriority(score) },
    });
  }

  return leads.length;
}

function scheduleLeadScoringPipeline() {
  return cron.schedule("0 */6 * * *", () =>
    logPipelineRun(PIPELINE_NAME, runLeadScoringPipeline).catch((error) =>
      console.error(`[pipeline:${PIPELINE_NAME}]`, error)
    )
  );
}

module.exports = {
  PIPELINE_NAME,
  runLeadScoringPipeline,
  scheduleLeadScoringPipeline,
};
