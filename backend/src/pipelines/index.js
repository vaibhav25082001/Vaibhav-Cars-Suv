const { scheduleDailySalesPipeline, runDailySalesPipeline } = require("./daily-sales.pipeline");
const { scheduleMonthlyRevenuePipeline, runMonthlyRevenuePipeline } = require("./monthly-revenue.pipeline");
const { scheduleLeadScoringPipeline, runLeadScoringPipeline } = require("./lead-scoring.pipeline");
const { scheduleInventoryAlertPipeline, runInventoryAlertPipeline } = require("./inventory-alert.pipeline");
const { scheduleSlaBreachPipeline, runSlaBreachPipeline } = require("./sla-breach.pipeline");

function startPipelines() {
  return [
    scheduleDailySalesPipeline(),
    scheduleMonthlyRevenuePipeline(),
    scheduleLeadScoringPipeline(),
    scheduleInventoryAlertPipeline(),
    scheduleSlaBreachPipeline(),
  ];
}

module.exports = {
  startPipelines,
  runDailySalesPipeline,
  runMonthlyRevenuePipeline,
  runLeadScoringPipeline,
  runInventoryAlertPipeline,
  runSlaBreachPipeline,
};
