import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function ResultsPanel({ results, assumptions, fmt }) {
  const { noi, effectiveGrossIncome, impliedCapRate, capRateResult, dcfResult, compResult, avgValue } = results;

  const valuations = [
    {
      method: 'Cap Rate / NOI',
      value: capRateResult?.value,
      desc: `${fmt.pct(assumptions.marketCapRate)} cap rate applied to NOI`,
      color: '#c9a84c',
      detail: [
        { label: 'Market Cap Rate', value: fmt.pct(assumptions.marketCapRate) },
        { label: 'Net Operating Income', value: fmt.currency(noi) },
        { label: 'Implied Value', value: fmt.currency(capRateResult?.value) },
      ],
    },
    {
      method: 'DCF Analysis',
      value: dcfResult?.value,
      desc: `${assumptions.holdPeriod}-yr hold, ${fmt.pct(assumptions.discountRate)} discount rate`,
      color: '#60a5fa',
      irr: dcfResult?.irr,
      detail: [
        { label: 'PV of Cash Flows', value: fmt.currency(dcfResult?.pvCashFlows) },
        { label: 'PV of Terminal Value', value: fmt.currency(dcfResult?.pvTerminal) },
        { label: 'Estimated IRR', value: dcfResult?.irr != null ? `${dcfResult.irr}%` : '—' },
      ],
    },
    {
      method: 'Comparable Sales',
      value: compResult?.medianValue,
      desc: `Median of ${compResult?.compsUsed || 0} comps — ${fmt.ppsf(compResult?.medianPpsf)}`,
      color: '#3ecf8e',
      detail: [
        { label: 'Avg $/sqft', value: fmt.ppsf(compResult?.avgPpsf) },
        { label: 'Median $/sqft', value: fmt.ppsf(compResult?.medianPpsf) },
        { label: 'Avg Value', value: fmt.currency(compResult?.avgValue) },
      ],
    },
  ];

  const cashFlowData = dcfResult?.cashFlows || [];

  return (
    <main style={styles.main}>
      {/* Summary strip */}
      <div style={styles.summaryStrip}>
        <Stat label="Net Operating Income" value={fmt.currency(noi)} accent />
        <Stat label="Eff. Gross Income" value={fmt.currency(effectiveGrossIncome)} />
        <Stat label="Implied Cap Rate" value={fmt.pct(impliedCapRate)} />
        <Stat label="Blended Est. Value" value={fmt.currency(avgValue)} accent gold />
      </div>

      {/* Valuation Cards */}
      <div style={styles.cardsRow}>
        {valuations.map(v => (
          <ValuationCard key={v.method} {...v} fmt={fmt} />
        ))}
      </div>

      {/* DCF Cash Flow Chart */}
      {cashFlowData.length > 0 && (
        <div style={styles.chartSection}>
          <div style={styles.chartHeader}>
            <span style={styles.chartTitle}>DCF — Annual Cash Flow & Present Value</span>
            <span style={styles.chartSub}>{assumptions.holdPeriod}-year hold period</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cashFlowData} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2232" vertical={false} />
              <XAxis dataKey="year" tick={{ fill: '#4a5568', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} label={{ value: 'Year', position: 'insideBottomRight', offset: 0, fill: '#4a5568', fontSize: 11 }} />
              <YAxis tick={{ fill: '#4a5568', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} width={56} />
              <Tooltip
                contentStyle={{ background: '#161b27', border: '1px solid #252d3d', borderRadius: 8, fontFamily: 'DM Mono', fontSize: 12 }}
                labelStyle={{ color: '#8a93a6', marginBottom: 4 }}
                formatter={(val, name) => [`$${val.toLocaleString()}`, name === 'noi' ? 'NOI' : 'Present Value']}
                labelFormatter={y => `Year ${y}`}
              />
              <Bar dataKey="noi" fill="rgba(201,168,76,0.5)" radius={[4, 4, 0, 0]} name="noi" />
              <Bar dataKey="pv" fill="rgba(96,165,250,0.7)" radius={[4, 4, 0, 0]} name="pv" />
            </BarChart>
          </ResponsiveContainer>
          <div style={styles.legend}>
            <LegendItem color="rgba(201,168,76,0.7)" label="NOI" />
            <LegendItem color="rgba(96,165,250,0.8)" label="Present Value" />
          </div>
        </div>
      )}

      {/* Valuation Range */}
      {avgValue && (
        <div style={styles.rangeSection}>
          <ValuationRange valuations={valuations} avg={avgValue} fmt={fmt} />
        </div>
      )}
    </main>
  );
}

function ValuationCard({ method, value, desc, color, detail, irr }) {
  return (
    <div style={{ ...styles.card, borderTop: `3px solid ${color}` }}>
      <div style={styles.cardMethod}>{method}</div>
      <div style={{ ...styles.cardValue, color }}>
        {value != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value) : '—'}
      </div>
      <div style={styles.cardDesc}>{desc}</div>
      <div style={styles.cardDetails}>
        {detail.map(d => (
          <div key={d.label} style={styles.detailRow}>
            <span style={styles.detailLabel}>{d.label}</span>
            <span style={styles.detailValue}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, accent, gold }) {
  return (
    <div style={{ ...styles.stat, ...(accent ? styles.statAccent : {}), ...(gold ? styles.statGold : {}) }}>
      <div style={styles.statLabel}>{label}</div>
      <div style={{ ...styles.statValue, ...(gold ? { color: 'var(--gold-light)' } : {}) }}>{value}</div>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div style={styles.legendItem}>
      <div style={{ width: 12, height: 12, borderRadius: 3, background: color, flexShrink: 0 }} />
      <span>{label}</span>
    </div>
  );
}

function ValuationRange({ valuations, avg, fmt }) {
  const vals = valuations.map(v => v.value).filter(Boolean);
  if (vals.length < 2) return null;
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min;

  return (
    <div style={styles.rangeCard}>
      <div style={styles.chartTitle}>Valuation Range Comparison</div>
      <div style={styles.rangeBar}>
        {valuations.map(v => {
          if (!v.value) return null;
          const pct = range > 0 ? ((v.value - min) / range) * 80 + 5 : 50;
          return (
            <div key={v.method} style={{ ...styles.rangePin, left: `${pct}%` }}>
              <div style={{ ...styles.rangeDot, background: v.color }} />
              <div style={styles.rangePinLabel}>{v.method.split(' ')[0]}</div>
              <div style={{ ...styles.rangePinValue, color: v.color }}>{fmt.currency(v.value)}</div>
            </div>
          );
        })}
        <div style={styles.rangeTrack} />
      </div>
      <div style={styles.rangeFooter}>
        <span>Low: <strong style={{ color: 'var(--text-primary)' }}>{fmt.currency(min)}</strong></span>
        <span>Avg: <strong style={{ color: 'var(--gold-light)' }}>{fmt.currency(avg)}</strong></span>
        <span>High: <strong style={{ color: 'var(--text-primary)' }}>{fmt.currency(max)}</strong></span>
      </div>
    </div>
  );
}

const styles = {
  main: {
    overflowY: 'auto',
    height: 'calc(100vh - 120px)',
    padding: '24px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  summaryStrip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 1,
    background: 'var(--border)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
  },
  stat: {
    padding: '16px 20px',
    background: 'var(--bg-card)',
  },
  statAccent: { background: 'var(--bg-secondary)' },
  statGold: { background: 'rgba(201,168,76,0.06)' },
  statLabel: {
    fontSize: 10,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  statValue: {
    fontFamily: 'var(--font-mono)',
    fontSize: 18,
    fontWeight: 500,
    color: 'var(--text-primary)',
  },
  cardsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    animation: 'fadeUp 0.3s ease',
  },
  cardMethod: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  cardValue: {
    fontFamily: 'var(--font-display)',
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: -0.5,
  },
  cardDesc: {
    fontSize: 12,
    color: 'var(--text-secondary)',
    paddingBottom: 12,
    borderBottom: '1px solid var(--border)',
  },
  cardDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginTop: 4,
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    color: 'var(--text-muted)',
  },
  detailValue: {
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    color: 'var(--text-secondary)',
  },
  chartSection: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '20px',
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  chartSub: {
    fontSize: 11,
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
  },
  legend: {
    display: 'flex',
    gap: 20,
    marginTop: 12,
    justifyContent: 'flex-end',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 11,
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-mono)',
  },
  rangeSection: {},
  rangeCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '20px 24px 16px',
  },
  rangeBar: {
    position: 'relative',
    height: 70,
    marginTop: 20,
    marginBottom: 8,
  },
  rangeTrack: {
    position: 'absolute',
    top: '50%',
    left: '5%',
    right: '5%',
    height: 2,
    background: 'var(--border-light)',
    transform: 'translateY(-50%)',
    borderRadius: 2,
  },
  rangePin: {
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  rangeDot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    border: '2px solid var(--bg-card)',
  },
  rangePinLabel: {
    fontSize: 9,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    position: 'absolute',
    top: -20,
    whiteSpace: 'nowrap',
  },
  rangePinValue: {
    fontSize: 11,
    fontFamily: 'var(--font-mono)',
    position: 'absolute',
    bottom: -20,
    whiteSpace: 'nowrap',
  },
  rangeFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 28,
    fontSize: 12,
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
  },
};
