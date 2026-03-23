import { OWNER_LABELS } from '../data/deliverables'

const OWNER_COLORS = {
  john:    '#3ecfac',
  sarvesh: '#60a5fa',
  val:     '#a78bfa',
  shared:  '#6b7280',
}

const SECTION_CONFIGS = [
  { key: 'in-progress', label: 'IN PROGRESS', dotColor: '#d4882a', pulse: true  },
  { key: 'queued',      label: 'QUEUED',       dotColor: '#6b7280', pulse: false, limit: 3 },
  { key: 'blocked',     label: 'BLOCKED',      dotColor: '#ef4444', pulse: false },
]

function ItemPill({ item }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.375rem',
      padding: '0.25rem 0.625rem',
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '9999px',
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: '50%',
        backgroundColor: OWNER_COLORS[item.owner] || '#6b7280',
        display: 'inline-block', flexShrink: 0,
      }} />
      <span style={{ fontSize: '0.7rem', color: 'var(--text)', whiteSpace: 'nowrap' }}>
        {item.title}
      </span>
      <span style={{
        fontSize: '0.6rem', fontFamily: 'DM Mono, monospace',
        color: OWNER_COLORS[item.owner] || '#6b7280',
        marginLeft: '0.125rem',
      }}>
        {OWNER_LABELS[item.owner]}
      </span>
    </div>
  )
}

export function PipelineStrip({ deliverables }) {
  const sections = SECTION_CONFIGS
    .map(cfg => ({
      ...cfg,
      items: deliverables
        .filter(d => d.status === cfg.key)
        .slice(0, cfg.limit || Infinity),
    }))
    .filter(s => s.items.length > 0)

  if (sections.length === 0) return null

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0.5rem 1.25rem',
      display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap',
    }}>
      {sections.map(section => (
        <div key={section.key} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          <span style={{
            fontSize: '0.6rem', fontFamily: 'DM Mono, monospace',
            fontWeight: '700', letterSpacing: '0.15em',
            color: 'var(--text-dim)', flexShrink: 0, paddingTop: '0.35rem',
            textTransform: 'uppercase',
          }}>
            {section.label}
          </span>
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
            {section.items.map(item => <ItemPill key={item.id} item={item} />)}
          </div>
        </div>
      ))}
    </div>
  )
}
