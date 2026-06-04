const SOURCE_SCORE = {
  Referral: 25,
  WalkIn: 22,
  Online: 16,
  Campaign: 12,
};

const STAGE_SCORE = {
  Inquiry: 10,
  TestDriveScheduled: 35,
  Negotiation: 55,
  ClosedWon: 100,
  ClosedLost: 0,
};

const PRIORITY_SCORE = {
  Hot: 25,
  Warm: 12,
  Cold: 2,
};

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function scoreLead(lead = {}) {
  let score = 0;

  score += SOURCE_SCORE[lead.source] || 8;
  score += STAGE_SCORE[lead.stage] || 10;
  score += PRIORITY_SCORE[lead.priority] || 8;

  if (lead.customerId || lead.customer) {
    score += 8;
  }

  if (lead.carModelId || lead.carModel) {
    score += 6;
  }

  if (lead.assignedToId || lead.assignedTo) {
    score += 4;
  }

  if (lead.followUpDate) {
    const followUpTime = new Date(lead.followUpDate).getTime();
    const daysUntilFollowUp = (followUpTime - Date.now()) / (24 * 60 * 60 * 1000);

    if (daysUntilFollowUp <= 1) {
      score += 8;
    } else if (daysUntilFollowUp <= 7) {
      score += 4;
    }
  }

  const budgetMin = Number(lead.budgetMin || 0);
  const budgetMax = Number(lead.budgetMax || 0);

  if (budgetMin > 0 && budgetMax > 0) {
    const spread = budgetMax - budgetMin;
    const average = (budgetMin + budgetMax) / 2;

    if (spread / average <= 0.2) {
      score += 6;
    }
  }

  if (lead.notes && String(lead.notes).length > 30) {
    score += 3;
  }

  return clampScore(score);
}

function getLeadPriority(score) {
  const normalizedScore = clampScore(score);

  if (normalizedScore >= 75) {
    return "Hot";
  }

  if (normalizedScore >= 40) {
    return "Warm";
  }

  return "Cold";
}

function getLeadStageRecommendation(lead = {}) {
  const score = scoreLead(lead);

  if (lead.stage === "ClosedWon" || lead.stage === "ClosedLost") {
    return lead.stage;
  }

  if (score >= 80) {
    return "Negotiation";
  }

  if (score >= 55) {
    return "TestDriveScheduled";
  }

  return "Inquiry";
}

module.exports = {
  scoreLead,
  getLeadPriority,
  getLeadStageRecommendation,
};
