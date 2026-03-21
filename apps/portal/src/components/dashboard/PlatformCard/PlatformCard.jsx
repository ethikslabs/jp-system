// src/components/dashboard/PlatformCard/PlatformCard.jsx
import { useState } from 'react'

const STATUS_COLORS = {
  amber:       '#c8a96e',
  'blue-grey': '#7ba3c4',
  muted:       '#6b6b6b',
  green:       '#5a9e6f',
}

export function PlatformCard({ eyebrow, name, description, status, statusColor = 'muted', accent, hero, children }) {
  const color = STATUS_COLORS[statusColor] ?? '#6b6b6b'
  const [hovered, setHovered] = useState(false)
  const cardStyle = {
    background: hero ? 'linear-gradient(135deg, var(--bg2), rgba(200,169,110,0.04))' : hovered ? 'var(--bg3)' : 'var(--bg2)',
    border: `1px solid ${hero ? 'rgba(200,169,110,0.18)' : hovered ? 'var(--border2)' : 'var(--border)'}`,
    borderRadius: '10px',
    padding: '18px 20px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
    cursor: 'default',
    transform: hovered ? 'translateY(-1px)' : '',
    ...(hero ? { gridColumn: '1 / -1' } : {}),
  }

  return (
    <div style={cardStyle} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {hero
        ? <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'var(--accent-e)' }} />
        : hovered && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: accent ?? color }} />
      }

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'DM Mono', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', color: accent ?? 'var(--muted)', marginBottom: '4px' }}>
            {eyebrow}
          </div>
          <div style={{ fontFamily: 'Instrument Serif', fontSize: hero ? '20px' : '18px', color: 'var(--text)', marginBottom: '6px' }}>
            {name}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.55, marginBottom: '12px' }}>
            {description}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ fontFamily: 'DM Mono', fontSize: '10px', color }}>{status}</span>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
