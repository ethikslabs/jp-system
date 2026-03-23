import React from 'react'
import { useNavigate } from 'react-router-dom'
import { getEntityPulses } from '../../services/api'
import { PROJECT_ROOMS } from '../../data/project-rooms'

// Map display names to slugs
function nameToSlug(name) {
  const lower = name.toLowerCase().replace(/[^a-z0-9]+/g, '')
  return Object.keys(PROJECT_ROOMS).find(slug =>
    slug.replace(/[^a-z0-9]/g, '') === lower ||
    PROJECT_ROOMS[slug].name.toLowerCase().replace(/[^a-z0-9]/g, '') === lower
  ) || null
}

const DEFAULT_COLUMNS = {
  Design: ['Research360', 'Civique'],
  Build: ['Proof360', 'Dashboard v1.0'],
  Live: ['ethikslabs.com'],
}

const COL_COLOR = {
  Design: '#60A5FA',
  Build: '#FBBF24',
  Live: '#2DD4BF',
}

const SEVERITY_DOT = { critical: '#EF4444', warning: '#FBBF24', info: '#2DD4BF' }

function PulseRow({ pulse }) {
  const p = pulse.payload || {}
  const label = p.action || p.message || pulse.type
  const color = SEVERITY_DOT[pulse.severity] || '#6B7280'
  const ts = new Date(pulse.timestamp).toLocaleTimeString()
  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', padding: '0.25rem 0' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: color, flexShrink: 0, marginTop: '0.35rem' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{ts}</div>
      </div>
    </div>
  )
}

function ItemPanel({ item, col, onClose }) {
  const [pulses, setPulses] = React.useState(null)
  const entityId = item.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  React.useEffect(() => {
    getEntityPulses(entityId, 5)
      .then(setPulses)
      .catch(() => setPulses([]))
  }, [entityId])

  const color = COL_COLOR[col] || '#6B7280'

  return (
    <div style={{
      marginTop: '0.5rem',
      padding: '0.75rem',
      backgroundColor: 'var(--bg-surface)',
      border: `1px solid ${color}44`,
      borderRadius: '6px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '600', color }}>{item}</span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1, padding: '0 0.25rem' }}
        >
          ×
        </button>
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Stage: {col}
      </div>
      {pulses === null ? (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Loading…</div>
      ) : pulses.length === 0 ? (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No recent pulses</div>
      ) : (
        <div>{pulses.map((p, i) => <PulseRow key={i} pulse={p} />)}</div>
      )}
    </div>
  )
}

// LifecycleBoard always shows project lifecycle — override whatever title Claude invents
function safeTitle() { return 'Projects' }

export function LifecycleBoard({ title, columns = DEFAULT_COLUMNS }) {
  const [selected, setSelected] = React.useState(null) // { item, col }
  const navigate = useNavigate()

  function toggle(item, col) {
    const slug = nameToSlug(item)
    if (slug) {
      navigate(`/projects/${slug}`)
      return
    }
    setSelected(s => (s?.item === item ? null : { item, col }))
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div className="card-title" style={{ marginBottom: 0 }}>{safeTitle()}</div>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>click to open room</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '0.5rem' }}>
        {Object.entries(columns).map(([col, items]) => (
          <div key={col}>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: COL_COLOR[col] || '#6B7280',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {col}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {items.map((item, i) => (
                <div
                  key={i}
                  onClick={() => toggle(item, col)}
                  title={item}
                  style={{
                    padding: '0.375rem 0.5rem',
                    backgroundColor: selected?.item === item ? `${COL_COLOR[col] || '#6B7280'}22` : 'var(--border)',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    color: 'var(--text)',
                    borderLeft: `2px solid ${COL_COLOR[col] || '#6B7280'}`,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.25rem', minWidth: 0 }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{item}</span>
                    {nameToSlug(item) && <span style={{ color: COL_COLOR[col] || '#6B7280', fontSize: '0.65rem', flexShrink: 0, opacity: 0.7 }}>↗</span>}
                  </span>
                </div>
              ))}
              {items.length === 0 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Empty</div>
              )}
            </div>
          </div>
        ))}
      </div>
      {selected && (
        <ItemPanel
          item={selected.item}
          col={selected.col}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
