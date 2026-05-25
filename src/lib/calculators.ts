export interface SIPProjection {
  month: number;
  invested: number;
  returns: number;
  gain: number;
}

export function calculateSIP(
  monthlyAmount: number,
  annualReturnRate: number,
  years: number
): SIPProjection[] {
  const totalMonths = Math.max(0, Math.floor(years * 12));
  const monthlyRate = annualReturnRate / 12 / 100;
  const projections: SIPProjection[] = [];

  for (let month = 1; month <= totalMonths; month += 1) {
    const invested = monthlyAmount * month;
    const returns =
      monthlyRate === 0
        ? invested
        : monthlyAmount *
          (((Math.pow(1 + monthlyRate, month) - 1) / monthlyRate) *
            (1 + monthlyRate));
    const gain = returns - invested;

    projections.push({
      month: Math.round(month),
      invested: Math.round(invested),
      returns: Math.round(returns),
      gain: Math.round(gain),
    });
  }

  return projections;
}
