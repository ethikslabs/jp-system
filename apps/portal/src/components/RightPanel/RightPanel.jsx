// src/components/RightPanel/RightPanel.jsx
import './RightPanel.css'

const SIGNALS = [
  { icon: '↗', title: 'Ingram ANZ MD wants a meeting', meta: 'Proof360 · scarcity active', warn: false },
  { icon: '☕', title: 'Lunch with Paul Findlay · ReachLX', meta: 'Investor teaser design', warn: false },
  { icon: '!', title: 'brief-ingram.md not committed', meta: 'Blocks Kiro vendor graph build', warn: true },
  { icon: '!', title: 'Dashboard deploy pending', meta: 'Auth0 · Nginx · PM2 · DNS', warn: true },
]

const PERSONAS = [
  { initial: 'B', name: 'Bob',      role: 'Meta-cognition · deadlock only', color: null },
  { initial: 'L', name: 'Leonardo', role: 'Macro · investor lens',           color: 'var(--accent-l)' },
  { initial: 'E', name: 'Edison',   role: 'Quant · build velocity',          color: 'var(--accent-e)' },
  { initial: 'S', name: 'Sophia',   role: 'Narrative · strategic story',     color: 'var(--accent-s)' },
]

export function RightPanel() {
  return (
    <aside className="rightpanel">
      {/* Signals */}
      <div>
        <div className="rightpanel__section-label">Signals</div>
        {SIGNALS.map((s, i) => (
          <div key={i} className="signal-item">
            <div className={`signal-icon${s.warn ? ' signal-icon--warn' : ''}`}>{s.icon}</div>
            <div className="signal-body">
              <div className="signal-title">{s.title}</div>
              <div className="signal-meta">{s.meta}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Convergence meter */}
      <div className="convergence-box">
        <div className="convergence-header">
          <span className="convergence-label">Convergence Loop</span>
          <span className="convergence-count">3 / 10</span>
        </div>
        <div className="convergence-bar-track">
          <div className="convergence-bar-fill" style={{ width: '30%' }} />
        </div>
        <div className="convergence-sub">Active · Phase 1–2 · Proof360 portal</div>
      </div>

      {/* Personas */}
      <div>
        <div className="rightpanel__section-label">Personas</div>
        {PERSONAS.map(p => (
          <div key={p.name} className="persona-row">
            <div className="persona-icon" style={{
              background: p.color ? `${p.color}18` : 'var(--bg4)',
              border: `1px solid ${p.color ? `${p.color}33` : 'var(--border)'}`,
              color: p.color ?? 'var(--muted)',
            }}>{p.initial}</div>
            <div>
              <div className="persona-name">{p.name}</div>
              <div className="persona-role">{p.role}</div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
