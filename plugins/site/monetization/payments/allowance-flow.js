export function createAllowancePlan({ subId = 'demo-sub', amount = 25, cadence = 'weekly', startsAt = new Date() } = {}) {
  return {
    id: `allowance-${subId}-${Date.now()}`,
    subId,
    amount: Number(amount),
    cadence,
    startsAt: new Date(startsAt).toISOString(),
    status: 'scheduled',
  };
}

export function describeAllowancePlan(plan) {
  return `${plan.subId} receives $${plan.amount} ${plan.cadence}`;
}
