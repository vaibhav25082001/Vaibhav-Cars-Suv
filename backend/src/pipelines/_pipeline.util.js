const { prisma } = require("../config/db");

async function logPipelineRun(pipelineName, runner) {
  const startedAt = new Date();
  await prisma.pipelineLog.create({
    data: { pipelineName, status: "Running", recordsProcessed: 0, startedAt },
  }).catch(() => null);

  try {
    const recordsProcessed = await runner();
    await prisma.pipelineLog.create({
      data: {
        pipelineName,
        status: "Success",
        recordsProcessed: recordsProcessed || 0,
        startedAt,
        completedAt: new Date(),
      },
    });
    return recordsProcessed || 0;
  } catch (error) {
    await prisma.pipelineLog.create({
      data: {
        pipelineName,
        status: "Failed",
        recordsProcessed: 0,
        startedAt,
        completedAt: new Date(),
        errorMsg: error.message,
      },
    });
    throw error;
  }
}

function startOfDay(date = new Date()) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

module.exports = {
  addDays,
  logPipelineRun,
  prisma,
  startOfDay,
};
