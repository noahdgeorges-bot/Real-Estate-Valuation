export default function Header() {
  return (
    <header style={styles.header}>
      <div style={styles.logoArea}>
        <div style={styles.logoMark}>PV</div>
        <div>
          <div style={styles.logoText}>PropVal</div>
          <div style={styles.logoSub}>Real Estate Valuation Engine</div>
        </div>
      </div>
      <div style={styles.badge}>
        <span style={styles.dot} />
        Live Calculation
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 32px',
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border)',
  },
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: 'linear-gradient(135deg, var(--gold), #9a7a2e)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 15,
    color: '#0b0e14',
    letterSpacing: 1,
  },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 20,
    color: 'var(--text-primary)',
    letterSpacing: 0.5,
  },
  logoSub: {
    fontSize: 11,
    color: 'var(--text-muted)',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    fontSize: 12,
    color: 'var(--green)',
    fontFamily: 'var(--font-mono)',
    background: 'rgba(62,207,142,0.08)',
    border: '1px solid rgba(62,207,142,0.2)',
    padding: '5px 12px',
    borderRadius: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--green)',
    display: 'inline-block',
    animation: 'pulse-gold 2s ease-in-out infinite',
  },
};
