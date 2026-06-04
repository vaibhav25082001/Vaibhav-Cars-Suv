function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function calculateEmi(principal, annualRate, tenureMonths) {
  const amount = toNumber(principal);
  const rate = toNumber(annualRate);
  const months = toNumber(tenureMonths);

  if (amount <= 0 || months <= 0) {
    return 0;
  }

  if (rate <= 0) {
    return roundMoney(amount / months);
  }

  const monthlyRate = rate / 12 / 100;
  const factor = (1 + monthlyRate) ** months;
  const emi = (amount * monthlyRate * factor) / (factor - 1);

  return roundMoney(emi);
}

function calculateLoanSummary(principal, annualRate, tenureMonths) {
  const emi = calculateEmi(principal, annualRate, tenureMonths);
  const totalPayable = roundMoney(emi * toNumber(tenureMonths));
  const totalInterest = roundMoney(totalPayable - toNumber(principal));

  return {
    principal: roundMoney(principal),
    annualRate: toNumber(annualRate),
    tenureMonths: toNumber(tenureMonths),
    emi,
    totalInterest,
    totalPayable,
  };
}

function generateAmortizationSchedule(principal, annualRate, tenureMonths) {
  const amount = toNumber(principal);
  const months = toNumber(tenureMonths);
  const monthlyRate = toNumber(annualRate) / 12 / 100;
  const emi = calculateEmi(amount, annualRate, months);
  let balance = amount;

  return Array.from({ length: months }, (_, index) => {
    const interestAmount = roundMoney(balance * monthlyRate);
    const principalAmount = roundMoney(Math.min(emi - interestAmount, balance));
    balance = roundMoney(Math.max(balance - principalAmount, 0));

    return {
      monthNumber: index + 1,
      principalAmount,
      interestAmount,
      emiAmount: emi,
      balanceRemaining: balance,
    };
  });
}

function roundMoney(value) {
  return Math.round(toNumber(value) * 100) / 100;
}

module.exports = {
  calculateEmi,
  calculateLoanSummary,
  generateAmortizationSchedule,
  roundMoney,
};
