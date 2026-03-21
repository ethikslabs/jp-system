// apps/portal/src/engines/Trust360/ConfigPanel.jsx
import { useState } from 'react'

function Toggle({ on, onChange }) {
  return (
    <div
      onClick={() => onChange(!on)}
      style={{
        width: '28px', height: '15px', borderRadius: '9999px', cursor: 'pointer',
        background: on ? 'var(--accent-t)' : 'var(--bg5)',
        position: 'relative', transition: 'background 0.2s ease', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: '2px', left: on ? '14px' : '1px',
        width: '11px', height: '11px', borderRadius: '50%', background: 'var(--text)',
        transition: 'left 0.2s ease',
      }} />
    </div>
  )
}

const SIGNAL_SOURCES = [
  { id: 'web',    label: 'Web presence', default: true },
  { id: 'github', label: 'GitHub',       default: true },
  { id: 'asic',   label: 'ASIC',         default: true },
  { id: 'vanta',  label: 'Vanta',        default: false },
  { id: 'xero',   label: 'Xero',         default: false },
]

// onCompanyChange is called on every keystroke to update the FlowPanel header tag live
export function ConfigPanel({ onRun, running, onCompanyChange }) {
  const [company, setCompany] = useState('EthiksLabs')
  const [url, setUrl]         = useState('')
  const [stage, setStage]     = useState('Series A')
  const [industry, setIndustry] = useState('AI / ML')
  const [signals, setSignals] = useState(
    Object.fromEntries(SIGNAL_SOURCES.map(s => [s.id, s.default]))
  )

  function handleCompanyChange(e) {
    setCompany(e.target.value)
    onCompanyChange?.(e.target.value)
  }

  const inputStyle = {
    width: '100%', background: 'var(--bg4)', border: '1px solid var(--border)',
    borderRadius: '6px', padding: '7px 10px', color: 'var(--text)', fontSize: '12px',
    fontFamily: 'DM Sans', outline: 'none',
  }

  const labelStyle = { fontFamily: 'DM Mono', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: '5px', display: 'block' }

  return (
    <div style={{ width: '270px', minWidth: '270px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'DM Mono', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-t)', marginBottom: '6px' }}>Trust360 · engine</div>
        <div style={{ fontFamily: 'Instrument Serif', fontSize: '15px', color: 'var(--text)' }}>Configure assessment</div>
      </div>

      {/* Scrollable form */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Company name</label>
          <input style={inputStyle} value={company} onChange={handleCompanyChange} />
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Website / deck URL</label>
          <input style={inputStyle} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…" />
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Stage</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={stage} onChange={e => setStage(e.target.value)}>
            {['Pre-seed','Seed','Series A','Series B+'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Industry</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={industry} onChange={e => setIndustry(e.target.value)}>
            {['SaaS / B2B','AI / ML','Fintech','Healthtech'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Signal sources</label>
          {SIGNAL_SOURCES.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text)' }}>{s.label}</span>
              <Toggle on={signals[s.id]} onChange={v => setSignals(prev => ({ ...prev, [s.id]: v }))} />
            </div>
          ))}
        </div>
      </div>

      {/* Run button — outside scroll, fixed at bottom */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => onRun({ company, url, stage, industry, signals })}
          disabled={running}
          style={{
            width: '100%', fontFamily: 'DM Mono', fontSize: '11px', padding: '10px',
            borderRadius: '8px', cursor: running ? 'not-allowed' : 'pointer',
            background: 'rgba(196,122,122,0.12)', border: '1px solid rgba(196,122,122,0.25)',
            color: running ? 'var(--muted)' : 'var(--accent-t)',
            opacity: running ? 0.5 : 1, pointerEvents: running ? 'none' : 'auto',
            transition: 'all 0.2s ease',
          }}
        >▶ Run assessment</button>
      </div>
    </div>
  )
}
