import { PLATFORMS, TYPE_COLORS, STATUS_COLORS, OWNER_LABELS } from '../data/deliverables'

const STATUS_PULSE = { 'in-progress': true }

function TypeBadge({ type }) {
  const c = TYPE_COLORS[type] || { bg: 'rgba(255,255,255,0.08)', text: '#9ca3af' }
  return (
    <span style={{
      fontFamily: 'DM Mono, monospace', fontSize: '0.58rem',
      letterSpacing: '0.12em', textTransform: 'uppercase',
      backgroundColor: c.bg, color: c.text,
      padding: '0.15rem 0.5rem', borderRadius: '3px',
      flexShrink: 0, minWidth: '72px', textAlign: 'center',
    }}>
      {type}
    </span>
  )
}

function StatusDot({ status }) {
  const color = STATUS_COLORS[status] || '#6b7280'
  return (
    <span style={{
      display: 'inline-block', width: 7, height: 7,
      borderRadius: '50%', backgroundColor: color,
      flexShrink: 0, marginRight: '0.5rem',
      animation: STATUS_PULSE[status] ? 'pulse 2s infinite' : 'none',
    }} />
  )
}

function isHighlighted(item, lens) {
  if (lens === 'john') return item.status === 'in-progress' || item.status === 'blocked'
  if (lens === 'sarvesh') return item.audience.includes('sarvesh') || item.owner === 'sarvesh'
  if (lens === 'val') return item.audience.includes('val') || item.owner === 'val'
  return false
}

function isDimmed(item, lens) {
  if (lens === 'john') return false
  return !isHighlighted(item, lens)
}

function DeliverableRow({ item, lens }) {
  const dimmed = isDimmed(item, lens)
  const highlighted = isHighlighted(item, lens)
  const valPipeline = lens === 'val' && (item.status === 'in-progress' || item.status === 'queued' || item.status === 'blocked')

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.5rem 0.5rem',
      borderBottom: '1px solid var(--border)',
      opacity: dimmed ? 0.35 : 1,
      transition: 'opacity 0.2s ease',
      borderLeft: valPipeline ? '2px solid #d4882a' : '2px solid transparent',
    }}>
      <TypeBadge type={item.type} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.8rem', color: 'var(--text)',
          fontWeight: highlighted ? '500' : '300',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          <StatusDot status={item.status} />
          {item.title}
        </div>
        {item.note && (
          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '0.15rem' }}>
            {item.note}
          </div>
        )}
      </div>
      <span style={{
        fontFamily: 'DM Mono, monospace', fontSize: '0.6rem',
        color: 'var(--text-dim)', flexShrink: 0, minWidth: '52px', textAlign: 'right',
      }}>
        {OWNER_LABELS[item.owner]}
      </span>
      {item.date && (
        <span style={{
          fontFamily: 'DM Mono, monospace', fontSize: '0.6rem',
          color: 'var(--text-dim)', flexShrink: 0, minWidth: '88px', textAlign: 'right',
        }}>
          {item.date}
        </span>
      )}
      {item.url ? (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: 'DM Mono, monospace', fontSize: '0.6rem',
            color: '#3ecfac', textDecoration: 'none',
            flexShrink: 0, letterSpacing: '0.04em',
          }}
        >
          view →
        </a>
      ) : (
        <span style={{ width: '38px', flexShrink: 0 }} />
      )}
    </div>
  )
}

export function DeliverablesGrid({ deliverables, lens }) {
  return (
    <div style={{ padding: '0.875rem 1.25rem' }}>
      {PLATFORMS.map(platform => {
        const items = deliverables.filter(d => d.platform === platform)
        if (!items.length) return null
        return (
          <div key={platform} style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              marginBottom: '0.5rem',
            }}>
              <span style={{
                fontFamily: 'DM Mono, monospace', fontSize: '0.6rem',
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: '#3ecfac', opacity: 0.7,
              }}>
                {platform}
              </span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
            </div>
            {items.map(item => (
              <DeliverableRow key={item.id} item={item} lens={lens} />
            ))}
          </div>
        )
      })}
    </div>
  )
}
