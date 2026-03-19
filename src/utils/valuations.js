/**
 * VALUATION ENGINE
 * Supports: Cap Rate/NOI, DCF, Comparable Sales
 */

export function calcCapRate({ noi, capRate }) {
  if (!noi || !capRate || capRate <= 0) return null;
  const value = noi / (capRate / 100);
  return { value, capRate, noi };
}

export function calcNOI({ grossRent, vacancyRate, operatingExpenses }) {
  const effectiveGrossIncome = grossRent * (1 - vacancyRate / 100);
  const noi = effectiveGrossIncome - operatingExpenses;
  return { effectiveGrossIncome, noi };
}

export function calcDCF({
  initialNOI,
  noiGrowthRate,
  discountRate,
  exitCapRate,
  holdPeriod,
  purchasePrice,
}) {
  if (!initialNOI || !discountRate || !exitCapRate || !holdPeriod) return null;

  const cashFlows = [];
  let cumulativePV = 0;

  for (let year = 1; year <= holdPeriod; year++) {
    const noi = initialNOI * Math.pow(1 + noiGrowthRate / 100, year - 1);
    const pv = noi / Math.pow(1 + discountRate / 100, year);
    cashFlows.push({ year, noi: Math.round(noi), pv: Math.round(pv) });
    cumulativePV += pv;
  }

  // Terminal value = NOI in year (holdPeriod+1) / exitCapRate
  const terminalNOI = initialNOI * Math.pow(1 + noiGrowthRate / 100, holdPeriod);
  const terminalValue = terminalNOI / (exitCapRate / 100);
  const pvTerminal = terminalValue / Math.pow(1 + discountRate / 100, holdPeriod);

  const dcfValue = cumulativePV + pvTerminal;

  // IRR estimation (simple Newton-Raphson)
  let irr = null;
  if (purchasePrice > 0) {
    irr = estimateIRR(purchasePrice, cashFlows.map(cf => cf.noi), terminalValue, holdPeriod);
  }

  return {
    value: Math.round(dcfValue),
    cashFlows,
    terminalValue: Math.round(terminalValue),
    pvTerminal: Math.round(pvTerminal),
    pvCashFlows: Math.round(cumulativePV),
    irr,
  };
}

function estimateIRR(cost, cashFlows, terminalValue, holdPeriod) {
  const allFlows = [-cost, ...cashFlows.slice(0, holdPeriod - 1), (cashFlows[holdPeriod - 1] || 0) + terminalValue];
  let rate = 0.1;
  for (let i = 0; i < 100; i++) {
    let npv = 0, dnpv = 0;
    allFlows.forEach((cf, t) => {
      const d = Math.pow(1 + rate, t);
      npv += cf / d;
      dnpv -= t * cf / (d * (1 + rate));
    });
    const newRate = rate - npv / dnpv;
    if (Math.abs(newRate - rate) < 1e-7) break;
    rate = newRate;
  }
  return isFinite(rate) && rate > -1 ? Math.round(rate * 10000) / 100 : null;
}

export function calcGRM({ purchasePrice, annualRent }) {
  if (!purchasePrice || !annualRent) return null;
  return purchasePrice / annualRent;
}

export function calcFinancing({ purchasePrice, noi, ltv, interestRate, amortizationYears }) {
  if (!purchasePrice || !noi || !ltv || !interestRate || !amortizationYears) return null;

  const loanAmount = purchasePrice * (ltv / 100);
  const equityInvested = purchasePrice * (1 - ltv / 100);
  const monthlyRate = interestRate / 100 / 12;
  const n = amortizationYears * 12;

  // Standard amortization formula
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
  const annualDebtService = monthlyPayment * 12;

  const cashOnCash = equityInvested > 0 ? ((noi - annualDebtService) / equityInvested) * 100 : null;
  const dscr = annualDebtService > 0 ? noi / annualDebtService : null;

  return {
    loanAmount: Math.round(loanAmount),
    equityInvested: Math.round(equityInvested),
    annualDebtService: Math.round(annualDebtService),
    cashOnCash: cashOnCash != null ? Math.round(cashOnCash * 100) / 100 : null,
    dscr: dscr != null ? Math.round(dscr * 100) / 100 : null,
  };
}

export function calcComparables({ comps, subject }) {
  // comps: [{ address, salePrice, sqft, propType }]
  // subject: { sqft }
  if (!comps || comps.length === 0 || !subject.sqft) return null;

  const validComps = comps.filter(c => c.salePrice > 0 && c.sqft > 0);
  if (validComps.length === 0) return null;

  const pricesPerSqft = validComps.map(c => c.salePrice / c.sqft);
  const avgPpsf = pricesPerSqft.reduce((a, b) => a + b, 0) / pricesPerSqft.length;
  const medianPpsf = median(pricesPerSqft);

  return {
    avgValue: Math.round(avgPpsf * subject.sqft),
    medianValue: Math.round(medianPpsf * subject.sqft),
    avgPpsf: Math.round(avgPpsf),
    medianPpsf: Math.round(medianPpsf),
    compsUsed: validComps.length,
  };
}

function median(arr) {
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 !== 0 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export const fmt = {
  currency: (v) =>
    v == null ? '—' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v),
  pct: (v) => (v == null ? '—' : `${v.toFixed(2)}%`),
  number: (v, dec = 0) => (v == null ? '—' : new Intl.NumberFormat('en-US', { maximumFractionDigits: dec }).format(v)),
  ppsf: (v) => (v == null ? '—' : `$${Math.round(v).toLocaleString()}/sqft`),
};
