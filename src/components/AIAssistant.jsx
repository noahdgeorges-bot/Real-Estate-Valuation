import { useState, useRef, useEffect } from 'react';

export default function AIAssistant({ assumptions, results, fmt }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your PropVal AI assistant. Ask me anything about this property — whether it's a good deal, how to improve returns, or what the numbers mean."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildContext = () => {
    return `You are a real estate investment analyst assistant built into a valuation tool called PropVal.
    
Current property being analyzed:
- Property Type: ${assumptions.propertyType}
- Address: ${assumptions.address || 'Not specified'}
- Square Footage: ${assumptions.sqft?.toLocaleString()} sqft
- Purchase Price: ${fmt.currency(assumptions.purchasePrice)}
- Annual Gross Rent: ${fmt.currency(assumptions.grossRent)}
- Vacancy Rate: ${assumptions.vacancyRate}%
- Operating Expenses: ${fmt.currency(assumptions.operatingExpenses)}
- Market Cap Rate: ${assumptions.marketCapRate}%
- Hold Period: ${assumptions.holdPeriod} years
- Discount Rate: ${assumptions.discountRate}%
- NOI Growth Rate: ${assumptions.noiGrowthRate}%
- Exit Cap Rate: ${assumptions.exitCapRate}%

Valuation Results:
- Net Operating Income (NOI): ${fmt.currency(results.noi)}
- Implied Cap Rate: ${fmt.pct(results.impliedCapRate)}
- Cap Rate Valuation: ${fmt.currency(results.capRateResult?.value)}
- DCF Valuation: ${fmt.currency(results.dcfResult?.value)}
- Estimated IRR: ${results.dcfResult?.irr != null ? results.dcfResult.irr + '%' : 'N/A'}
- Comparable Sales Value: ${fmt.currency(results.compResult?.medianValue)}
- Blended Average Value: ${fmt.currency(results.avgValue)}

Be concise, direct, and use specific numbers from the analysis above. Focus on practical investment insights.`;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: buildContext(),
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      const reply = data.content?.[0]?.text || 'Sorry, I could not generate a response.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error connecting to AI. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button style={{ ...styles.fab, ...(open ? styles.fabOpen : {}) }} onClick={() => setOpen(o => !o)}>
        {open ? '✕' : '✦ AI'}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={styles.panel}>
          <div style={styles.header}>
            <div>
              <div style={styles.title}>PropVal AI</div>
              <div style={styles.subtitle}>Powered by Claude</div>
            </div>
            <div style={styles.dot} />
          </div>

          <div style={styles.messages}>
            {messages.map((m, i) => (
              <div key={i} style={{ ...styles.bubble, ...(m.role === 'user' ? styles.userBubble : styles.aiBubble) }}>
                {m.role === 'assistant' && <div style={styles.aiLabel}>PropVal AI</div>}
                <div style={styles.bubbleText}>{m.content}</div>
              </div>
            ))}
            {loading && (
              <div style={{ ...styles.bubble, ...styles.aiBubble }}>
                <div style={styles.aiLabel}>PropVal AI</div>
                <div style={styles.typing}>
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={styles.inputRow}>
            <input
              style={styles.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about this property..."
            />
            <button style={styles.sendBtn} onClick={sendMessage} disabled={loading}>
              ↑
            </button>
          </div>

          <div style={styles.suggestions}>
            {['Is this a good deal?', 'How can I improve IRR?', 'What are the risks?'].map(q => (
              <button key={q} style={styles.suggestion} onClick={() => { setInput(q); }}>
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </>
  );
}

const styles = {
  fab: {
    position: 'fixed',
    bottom: 28,
    right: 28,
    padding: '12px 20px',
    background: 'linear-gradient(135deg, var(--gold), #9a7a2e)',
    border: 'none',
    borderRadius: 24,
    color: '#0b0e14',
    fontFamily: 'var(--font-body)',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(201,168,76,0.4)',
    zIndex: 1000,
    transition: 'all 0.2s',
    letterSpacing: 0.5,
  },
  fabOpen: {
    background: 'var(--bg-card)',
    color: 'var(--text-secondary)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    border: '1px solid var(--border)',
  },
  panel: {
    position: 'fixed',
    bottom: 80,
    right: 28,
    width: 380,
    height: 520,
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 999,
    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
    overflow: 'hidden',
    animation: 'fadeUp 0.2s ease',
  },
  header: {
    padding: '16px 20px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--gold-light)',
  },
  subtitle: {
    fontSize: 11,
    color: 'var(--text-muted)',
    marginTop: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--green)',
    boxShadow: '0 0 6px var(--green)',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  bubble: {
    padding: '10px 14px',
    borderRadius: 12,
    maxWidth: '88%',
    fontSize: 13,
    lineHeight: 1.5,
  },
  aiBubble: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    alignSelf: 'flex-start',
  },
  userBubble: {
    background: 'var(--gold-dim)',
    border: '1px solid rgba(201,168,76,0.3)',
    alignSelf: 'flex-end',
    color: 'var(--text-primary)',
  },
  aiLabel: {
    fontSize: 10,
    color: 'var(--gold)',
    fontFamily: 'var(--font-mono)',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  bubbleText: {
    color: 'var(--text-primary)',
    whiteSpace: 'pre-wrap',
  },
  typing: {
    display: 'flex',
    gap: 4,
    padding: '2px 0',
    '& span': {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: 'var(--gold)',
      animation: 'typing 1.2s ease infinite',
    }
  },
  inputRow: {
    display: 'flex',
    gap: 8,
    padding: '12px 16px',
    borderTop: '1px solid var(--border)',
  },
  input: {
    flex: 1,
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)',
    fontSize: 13,
    padding: '8px 12px',
    outline: 'none',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: 'var(--gold)',
    border: 'none',
    color: '#0b0e14',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  suggestions: {
    display: 'flex',
    gap: 6,
    padding: '0 16px 14px',
    flexWrap: 'wrap',
  },
  suggestion: {
    padding: '4px 10px',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 20,
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-body)',
    fontSize: 11,
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
};
