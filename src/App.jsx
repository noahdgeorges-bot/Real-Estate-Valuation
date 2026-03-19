import { useState, useMemo } from 'react';
import AssumptionsPanel from './components/AssumptionsPanel';
import ResultsPanel from './components/ResultsPanel';
import Header from './components/Header';
import { calcNOI, calcCapRate, calcDCF, calcComparables, fmt } from './utils/valuations';

const PROPERTY_TYPES = [
  { id: 'residential', label: 'Residential', icon: '⌂' },
  { id: 'multifamily', label: 'Multi-Family', icon: '⊞' },
  { id: 'commercial', label: 'Commercial', icon: '⬛' },
  { id: 'industrial', label: 'Industrial', icon: '⚙' },
];

const DEFAULT_ASSUMPTIONS = {
  // Property
  propertyType: 'multifamily',
  address: '',
  sqft: 5000,
  purchasePrice: 1500000,
  // Income
  grossRent: 180000,
  vacancyRate: 5,
  otherIncome: 0,
  // Expenses
  operatingExpenses: 54000,
  // Cap Rate
  marketCapRate: 5.5,
  // DCF
  noiGrowthRate: 2.5,
  discountRate: 8,
  exitCapRate: 6,
  holdPeriod: 10,
  // Comparables
  comps: [
    { address: '123 Main St', salePrice: 1450000, sqft: 4800 },
    { address: '456 Oak Ave', salePrice: 1620000, sqft: 5200 },
    { address: '789 Pine Rd', salePrice: 1380000, sqft: 4600 },
  ],
};

export default function App() {
  const [assumptions, setAssumptions] = useState(DEFAULT_ASSUMPTIONS);
  const [activeType, setActiveType] = useState('multifamily');

  const update = (key, value) =>
    setAssumptions(prev => ({ ...prev, [key]: value }));

  const results = useMemo(() => {
    const { noi, effectiveGrossIncome } = calcNOI({
      grossRent: assumptions.grossRent + (assumptions.otherIncome || 0),
      vacancyRate: assumptions.vacancyRate,
      operatingExpenses: assumptions.operatingExpenses,
    });

    const capRateResult = calcCapRate({ noi, capRate: assumptions.marketCapRate });

    const dcfResult = calcDCF({
      initialNOI: noi,
      noiGrowthRate: assumptions.noiGrowthRate,
      discountRate: assumptions.discountRate,
      exitCapRate: assumptions.exitCapRate,
      holdPeriod: assumptions.holdPeriod,
      purchasePrice: assumptions.purchasePrice,
    });

    const compResult = calcComparables({
      comps: assumptions.comps,
      subject: { sqft: assumptions.sqft },
    });

    const impliedCapRate = assumptions.purchasePrice > 0 ? (noi / assumptions.purchasePrice) * 100 : null;
    const cashOnCash = assumptions.purchasePrice > 0 ? (noi / assumptions.purchasePrice) * 100 : null;

    const values = [
      capRateResult?.value,
      dcfResult?.value,
      compResult?.medianValue,
    ].filter(Boolean);

    const avgValue = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;

    return {
      noi,
      effectiveGrossIncome,
      impliedCapRate,
      cashOnCash,
      capRateResult,
      dcfResult,
      compResult,
      avgValue,
    };
  }, [assumptions]);

  return (
    <div style={styles.app}>
      <Header />
      <div style={styles.typeBar}>
        {PROPERTY_TYPES.map(pt => (
          <button
            key={pt.id}
            style={{
              ...styles.typeBtn,
              ...(activeType === pt.id ? styles.typeBtnActive : {}),
            }}
            onClick={() => { setActiveType(pt.id); update('propertyType', pt.id); }}
          >
            <span style={styles.typeIcon}>{pt.icon}</span>
            {pt.label}
          </button>
        ))}
      </div>
      <div style={styles.main}>
        <AssumptionsPanel assumptions={assumptions} update={update} propertyType={activeType} />
        <ResultsPanel results={results} assumptions={assumptions} fmt={fmt} />
      </div>
    </div>
  );
}

const styles = {
  app: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    background: 'var(--bg-primary)',
  },
  typeBar: {
    display: 'flex',
    gap: 8,
    padding: '12px 32px',
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border)',
  },
  typeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 18px',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-body)',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  typeBtnActive: {
    background: 'var(--gold-dim)',
    border: '1px solid var(--gold)',
    color: 'var(--gold-light)',
  },
  typeIcon: { fontSize: 16 },
  main: {
    display: 'grid',
    gridTemplateColumns: '380px 1fr',
    flex: 1,
    overflow: 'hidden',
    minHeight: 0,
  },
};
