import { useState } from 'react';

export default function AssumptionsPanel({ assumptions, update, propertyType }) {
  const [openSection, setOpenSection] = useState('Property');

  const toggle = (s) => setOpenSection(prev => prev === s ? null : s);

  const updateComp = (idx, field, value) => {
    const newComps = assumptions.comps.map((c, i) =>
      i === idx ? { ...c, [field]: value } : c
    );
    update('comps', newComps);
  };

  const addComp = () =>
    update('comps', [...assumptions.comps, { address: '', salePrice: 0, sqft: 0 }]);

  const removeComp = (idx) =>
    update('comps', assumptions.comps.filter((_, i) => i !== idx));

  return (
    <aside style={styles.panel}>
      <div style={styles.panelHeader}>
        <span style={styles.panelTitle}>Assumptions</span>
        <span style={styles.panelSub}>Adjust inputs to recalculate</span>
      </div>
      <div style={styles.sections}>
        {/* PROPERTY */}
        <Section title="Property" open={openSection === 'Property'} onToggle={() => toggle('Property')}>
          <Field label="Property Address">
            <input
              type="text"
              placeholder="123 Example St"
              value={assumptions.address}
              onChange={e => update('address', e.target.value)}
            />
          </Field>
          <FieldRow>
            <Field label="Gross Area (sqft)">
              <input type="number" value={assumptions.sqft} onChange={e => update('sqft', +e.target.value)} />
            </Field>
            <Field label="Purchase Price ($)">
              <input type="number" value={assumptions.purchasePrice} onChange={e => update('purchasePrice', +e.target.value)} />
            </Field>
          </FieldRow>
        </Section>

        {/* INCOME */}
        <Section title="Income" open={openSection === 'Income'} onToggle={() => toggle('Income')}>
          <Field label="Annual Gross Rent ($)">
            <input type="number" value={assumptions.grossRent} onChange={e => update('grossRent', +e.target.value)} />
          </Field>
          <FieldRow>
            <Field label="Vacancy Rate (%)">
              <input type="number" step="0.1" value={assumptions.vacancyRate} onChange={e => update('vacancyRate', +e.target.value)} />
            </Field>
            <Field label="Other Income ($)">
              <input type="number" value={assumptions.otherIncome} onChange={e => update('otherIncome', +e.target.value)} />
            </Field>
          </FieldRow>
        </Section>

        {/* EXPENSES */}
        <Section title="Expenses" open={openSection === 'Expenses'} onToggle={() => toggle('Expenses')}>
          <FieldRow>
            <Field label="Property Tax ($)">
              <input type="number" value={assumptions.propertyTax} onChange={e => update('propertyTax', +e.target.value)} />
            </Field>
            <Field label="Insurance ($)">
              <input type="number" value={assumptions.insurance} onChange={e => update('insurance', +e.target.value)} />
            </Field>
          </FieldRow>
          <Field label="Management Fee (%)" hint="Applied to effective gross income">
            <input type="number" step="0.1" value={assumptions.managementFeePct} onChange={e => update('managementFeePct', +e.target.value)} />
          </Field>
          <FieldRow>
            <Field label="Maintenance ($)">
              <input type="number" value={assumptions.maintenance} onChange={e => update('maintenance', +e.target.value)} />
            </Field>
            <Field label="CapEx Reserve ($)">
              <input type="number" value={assumptions.capexReserve} onChange={e => update('capexReserve', +e.target.value)} />
            </Field>
          </FieldRow>
          <Field label="Market Cap Rate (%)">
            <input type="number" step="0.1" value={assumptions.marketCapRate} onChange={e => update('marketCapRate', +e.target.value)} />
          </Field>
        </Section>

        {/* FINANCING */}
        <Section title="Financing" open={openSection === 'Financing'} onToggle={() => toggle('Financing')}>
          <FieldRow>
            <Field label="Loan-to-Value (%)">
              <input type="number" step="1" min="0" max="100" value={assumptions.ltv} onChange={e => update('ltv', +e.target.value)} />
            </Field>
            <Field label="Interest Rate (%)">
              <input type="number" step="0.1" value={assumptions.interestRate} onChange={e => update('interestRate', +e.target.value)} />
            </Field>
          </FieldRow>
          <Field label="Amortization Period (years)">
            <input type="number" step="1" min="1" max="40" value={assumptions.amortizationYears} onChange={e => update('amortizationYears', +e.target.value)} />
          </Field>
        </Section>

        {/* DCF */}
        <Section title="DCF Settings" open={openSection === 'DCF Settings'} onToggle={() => toggle('DCF Settings')}>
          <FieldRow>
            <Field label="NOI Growth Rate (%)">
              <input type="number" step="0.1" value={assumptions.noiGrowthRate} onChange={e => update('noiGrowthRate', +e.target.value)} />
            </Field>
            <Field label="Discount Rate (%)">
              <input type="number" step="0.1" value={assumptions.discountRate} onChange={e => update('discountRate', +e.target.value)} />
            </Field>
          </FieldRow>
          <FieldRow>
            <Field label="Exit Cap Rate (%)">
              <input type="number" step="0.1" value={assumptions.exitCapRate} onChange={e => update('exitCapRate', +e.target.value)} />
            </Field>
            <Field label="Hold Period (yrs)">
              <input type="number" min="1" max="30" value={assumptions.holdPeriod} onChange={e => update('holdPeriod', +e.target.value)} />
            </Field>
          </FieldRow>
        </Section>

        {/* COMPARABLES */}
        <Section title="Comparables" open={openSection === 'Comparables'} onToggle={() => toggle('Comparables')}>
          {assumptions.comps.map((comp, i) => (
            <div key={i} style={styles.compCard}>
              <div style={styles.compHeader}>
                <span style={styles.compLabel}>Comp {i + 1}</span>
                <button style={styles.removeBtn} onClick={() => removeComp(i)}>✕</button>
              </div>
              <input
                type="text"
                placeholder="Address"
                value={comp.address}
                onChange={e => updateComp(i, 'address', e.target.value)}
                style={{ marginBottom: 6 }}
              />
              <FieldRow>
                <Field label="Sale Price ($)">
                  <input type="number" value={comp.salePrice} onChange={e => updateComp(i, 'salePrice', +e.target.value)} />
                </Field>
                <Field label="Sqft">
                  <input type="number" value={comp.sqft} onChange={e => updateComp(i, 'sqft', +e.target.value)} />
                </Field>
              </FieldRow>
            </div>
          ))}
          <button style={styles.addBtn} onClick={addComp}>+ Add Comparable</button>
        </Section>
      </div>
    </aside>
  );
}

function Section({ title, open, onToggle, children }) {
  return (
    <div style={styles.section}>
      <button style={styles.sectionHeader} onClick={onToggle}>
        <span style={styles.sectionTitle}>{title}</span>
        <span style={{ ...styles.chevron, transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
      </button>
      {open && <div style={styles.sectionBody}>{children}</div>}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      {hint && <div style={styles.hint}>{hint}</div>}
      {children}
    </div>
  );
}

function FieldRow({ children }) {
  return <div style={styles.fieldRow}>{children}</div>;
}

const styles = {
  panel: {
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid var(--border)',
    background: 'var(--bg-secondary)',
    overflowY: 'auto',
    height: 'calc(100vh - 120px)',
  },
  panelHeader: {
    padding: '20px 24px 16px',
    borderBottom: '1px solid var(--border)',
  },
  panelTitle: {
    display: 'block',
    fontFamily: 'var(--font-display)',
    fontSize: 18,
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  panelSub: {
    display: 'block',
    fontSize: 11,
    color: 'var(--text-muted)',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sections: { flex: 1 },
  section: {
    borderBottom: '1px solid var(--border)',
  },
  sectionHeader: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 24px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-body)',
    fontSize: 12,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: 1,
    transition: 'color 0.2s',
  },
  sectionTitle: {},
  chevron: {
    fontSize: 14,
    transition: 'transform 0.2s',
    color: 'var(--gold)',
  },
  sectionBody: {
    padding: '4px 24px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  field: { display: 'flex', flexDirection: 'column', gap: 5, flex: 1 },
  fieldRow: { display: 'flex', gap: 12 },
  label: {
    fontSize: 11,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: 500,
  },
  hint: {
    fontSize: 10,
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  compCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  compHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compLabel: {
    fontSize: 11,
    color: 'var(--gold)',
    fontFamily: 'var(--font-mono)',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  removeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: 12,
    padding: '2px 6px',
    borderRadius: 4,
  },
  addBtn: {
    width: '100%',
    padding: '10px',
    background: 'transparent',
    border: '1px dashed var(--border-light)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-body)',
    fontSize: 12,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};
