export type PricingStrategy = 'competitor_follow' | 'margin_floor' | 'target_anchor';

export type ProposalInput = {
  strategy: PricingStrategy;
  cost: number;
  marginFloor: number;
  competitorLow: number;
  current: number;
  target: number;
  averageDailySales: number;
  evaluationDays: number;
};

export function evaluateMargin({ suggestedPrice, cost }: { suggestedPrice: number; cost: number }) {
  const marginRate = (suggestedPrice - cost) / suggestedPrice;
  return { marginRate, hardStop: marginRate < 0.05 };
}

export function buildProposal(input: ProposalInput) {
  const floorPrice = input.cost / (1 - input.marginFloor);
  const suggestedPrice = input.strategy === 'margin_floor'
    ? Math.max(input.competitorLow, floorPrice)
    : input.strategy === 'target_anchor'
      ? input.target
      : Math.round(input.competitorLow * 0.99 * 100) / 100;
  const margin = evaluateMargin({ suggestedPrice, cost: input.cost });
  return {
    suggestedPrice,
    marginProtected: suggestedPrice >= floorPrice,
    ...margin,
    incrementalMarginImpact: (suggestedPrice - input.current) * input.averageDailySales * input.evaluationDays,
  };
}
