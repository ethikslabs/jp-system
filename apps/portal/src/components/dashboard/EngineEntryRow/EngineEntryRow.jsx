// src/components/dashboard/EngineEntryRow/EngineEntryRow.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function EngineCard({ accent, eyebrow, name, description, engineId }) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={() => navigate(`/engines/${engineId}`)}
      style={{
        flex: 1, background: hovered ? 'var(--bg3)' : 'var(--bg2)',
        border: `1px solid ${hovered ? 'var(--border2)' : 'var(--border)'}`,
        borderRadius: '10px', padding: '16px 18px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '12px', transition: 'all 0.2s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div>
        <div style={{ fontFamily: 'DM Mono', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', color: accent, marginBottom: '4px' }}>{eyebrow}</div>
        <div style={{ fontFamily: 'Instrument Serif', fontSize: '18px', color: 'var(--text)', marginBottom: '4px' }}>{name}</div>
        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{description}</div>
      </div>
      <div style={{ fontSize: '18px', color: accent, flexShrink: 0, transition: 'transform 0.2s ease', transform: hovered ? 'translateX(3px)' : '' }}>→</div>
    </div>
  )
}

export function EngineEntryRow() {
  return (
    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
      <EngineCard accent="var(--accent-r)" eyebrow="Engine" name="Research360" description="Corpus browser · semantic query · six-layer architecture" engineId="research" />
      <EngineCard accent="var(--accent-t)" eyebrow="Engine" name="Trust360"    description="Live report generation · step-by-step · gap analysis" engineId="trust" />
    </div>
  )
}
