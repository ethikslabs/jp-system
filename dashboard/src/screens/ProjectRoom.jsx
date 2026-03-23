import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PROJECT_ROOMS, LIFECYCLE_COLOR } from '../data/project-rooms'
import { getSourcePulses } from '../services/api'

// ─── Text renderers ───────────────────────────────────────────────────────────

function inlineBold(text) {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return parts.map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : p)
}

// Renders text that may have **bold** — plain paragraphs
function Prose({ text }) {
  if (!text) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {text.split(/\n\n+/).map((para, i) => (
        <p key={i} style={{ margin: 0, lineHeight: 1.7, color: 'var(--text)', fontSize: '0.9rem' }}>
          {inlineBold(para)}
        </p>
      ))}
    </div>
  )
}

// Renders text where lines starting with "- " become real bullet items
function BulletList({ text }) {
  if (!text) return null
  const lines = text.split('\n').filter(l => l.trim())
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      {lines.map((line, i) => {
        const isBullet = line.trim().startsWith('- ')
        const content = isBullet ? line.trim().slice(2) : line.trim()
        if (!isBullet) {
          return (
            <p key={i} style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {inlineBold(content)}
            </p>
          )
        }
        return (
          <div key={i} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: 'var(--text-dim)', flexShrink: 0, marginTop: '0.45rem' }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.55 }}>{inlineBold(content)}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Shared card wrapper ──────────────────────────────────────────────────────

function Card({ title, accent, children, style }) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '1rem 1.125rem',
      ...style,
    }}>
      {title && (
        <div style={{
          fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.12em',
          textTransform: 'uppercase', color: accent || 'var(--text-dim)',
          marginBottom: '0.75rem',
        }}>
          {title}
        </div>
      )}
      {children}
    </div>
  )
}

// ─── Graduation checklist ─────────────────────────────────────────────────────

function GraduationList({ criteria, color }) {
  const done = criteria.filter(c => c.done).length
  const pct = criteria.length ? Math.round((done / criteria.length) * 100) : 0
  const accent = color || '#2DD4BF'

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{done} of {criteria.length} complete</span>
        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: accent }}>{pct}%</span>
      </div>
      <div style={{ height: '3px', backgroundColor: 'var(--border)', borderRadius: '2px', marginBottom: '0.875rem' }}>
        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: accent, borderRadius: '2px', transition: 'width 0.3s ease' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {criteria.map((c, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
            <span style={{
              flexShrink: 0, width: '15px', height: '15px', borderRadius: '4px', marginTop: '1px',
              border: `1.5px solid ${c.done ? accent : 'var(--border)'}`,
              backgroundColor: c.done ? `${accent}22` : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {c.done && <span style={{ color: accent, fontSize: '0.6rem', lineHeight: 1 }}>✓</span>}
            </span>
            <span style={{ fontSize: '0.8rem', color: c.done ? 'var(--text-muted)' : 'var(--text)', lineHeight: 1.45, textDecoration: c.done ? 'line-through' : 'none' }}>
              {c.text}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}

// ─── Stack block ──────────────────────────────────────────────────────────────

function StackBlock({ stack }) {
  return (
    <pre style={{
      margin: 0, padding: 0,
      fontSize: '0.775rem', color: 'var(--text-muted)',
      fontFamily: 'ui-monospace, "Cascadia Code", monospace',
      lineHeight: 1.65, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
    }}>
      {stack}
    </pre>
  )
}

// ─── Docs as link chips ───────────────────────────────────────────────────────

function DocsList({ docs, github }) {
  if (!docs.length) return <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>No docs listed</span>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      {docs.map((doc, i) => {
        const href = doc.url || (github ? `${github}/blob/main/${doc.name}` : null)
        const inner = (
          <>
            <span style={{ fontSize: '0.7rem', fontFamily: 'ui-monospace, monospace', color: href ? '#60A5FA' : 'var(--text)' }}>
              {doc.name}
            </span>
            {doc.description && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>— {doc.description}</span>
            )}
            {href && <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginLeft: 'auto', flexShrink: 0 }}>↗</span>}
          </>
        )

        const rowStyle = {
          display: 'flex', alignItems: 'center', gap: '0.25rem',
          padding: '0.375rem 0.5rem',
          borderRadius: '5px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          textDecoration: 'none',
          transition: 'border-color 0.15s ease',
        }

        return href ? (
          <a key={i} href={href} target="_blank" rel="noopener noreferrer"
            style={{ ...rowStyle, cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#60A5FA55'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            {inner}
          </a>
        ) : (
          <div key={i} style={rowStyle}>{inner}</div>
        )
      })}
    </div>
  )
}

// ─── Relationships table ──────────────────────────────────────────────────────

const STATUS_BADGE = {
  'Lunch scheduled':        '#FBBF24',
  'Conversation pending':   '#60A5FA',
  'Saw demo, wants MD intro': '#F97316',
  'Meeting pending':        '#F97316',
  'Running in production':  '#2DD4BF',
  'Active':                 '#2DD4BF',
}

function RelationshipsTable({ rows }) {
  if (!rows.length) return null
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead>
          <tr>
            {['Person', 'Company', 'Role', 'Status'].map(h => (
              <th key={h} style={{
                textAlign: 'left', padding: '0.375rem 0.625rem',
                color: 'var(--text-dim)', fontWeight: '600', fontSize: '0.65rem',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                borderBottom: '1px solid var(--border)',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td style={{ padding: '0.5rem 0.625rem', color: 'var(--text)', fontWeight: '600', borderBottom: '1px solid var(--border)' }}>{r.person}</td>
              <td style={{ padding: '0.5rem 0.625rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>{r.company}</td>
              <td style={{ padding: '0.5rem 0.625rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>{r.role}</td>
              <td style={{ padding: '0.5rem 0.625rem', borderBottom: '1px solid var(--border)' }}>
                <span style={{
                  display: 'inline-block',
                  fontSize: '0.7rem', fontWeight: '600',
                  color: STATUS_BADGE[r.status] || 'var(--text-muted)',
                  backgroundColor: `${STATUS_BADGE[r.status] || '#6B7280'}18`,
                  border: `1px solid ${STATUS_BADGE[r.status] || '#6B7280'}33`,
                  padding: '0.15rem 0.5rem', borderRadius: '9999px',
                }}>
                  {r.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Pulse feed ───────────────────────────────────────────────────────────────

const SEV_COLOR = { critical: '#EF4444', warning: '#FBBF24', info: '#60A5FA' }

function PulseFeed({ slug }) {
  const [pulses, setPulses] = useState(null)

  useEffect(() => {
    getSourcePulses(slug, 10).then(setPulses).catch(() => setPulses([]))
  }, [slug])

  if (pulses === null) return <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Loading…</div>
  if (!pulses.length) return <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No recent activity for this project</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {pulses.map((p, i) => {
        const payload = p.payload || {}
        const msg = payload.message || payload.action || payload.title || p.type
        const color = SEV_COLOR[p.severity] || '#6B7280'
        return (
          <div key={i} style={{
            display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
            padding: '0.625rem 0',
            borderBottom: i < pulses.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: color, flexShrink: 0, marginTop: '0.45rem' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.4 }}>{msg}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                {p.source} · {new Date(p.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function ProjectRoom() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const room = PROJECT_ROOMS[slug]

  if (!room) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ color: 'var(--text)', fontSize: '1.25rem' }}>Project not found: {slug}</div>
        <button onClick={() => navigate('/')} style={{ color: '#60A5FA', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>← Back to dashboard</button>
      </div>
    )
  }

  const lc = room.lifecycle
  const lcColor = LIFECYCLE_COLOR[lc] || '#6B7280'
  const accent = room.color || '#2DD4BF'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* ── Accent bar ─────────────────────────────────────────────────────── */}
      <div style={{ height: '3px', background: `linear-gradient(90deg, ${accent}, ${accent}44)` }} />

      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        backgroundColor: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        padding: '0.625rem 1.5rem',
        display: 'flex', alignItems: 'center', gap: '1rem',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0, padding: 0 }}
        >
          ← Dashboard
        </button>

        <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border)' }} />

        <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text)', flexShrink: 0 }}>{room.name}</span>

        <span style={{
          fontSize: '0.6rem', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase',
          color: lcColor, backgroundColor: `${lcColor}18`, border: `1px solid ${lcColor}44`,
          borderRadius: '9999px', padding: '0.15rem 0.625rem', flexShrink: 0,
        }}>
          {lc}
        </span>

        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {room.tagline}
        </span>

        {room.url && room.url !== 'TBD' && (
          <a href={room.url} target="_blank" rel="noopener noreferrer" style={{
            padding: '0.3rem 0.75rem', fontSize: '0.75rem', fontWeight: '500',
            backgroundColor: `${accent}18`, border: `1px solid ${accent}44`,
            borderRadius: '6px', color: accent, textDecoration: 'none', flexShrink: 0,
          }}>
            {room.url.replace(/^https?:\/\//, '')} ↗
          </a>
        )}
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, padding: '1.5rem', maxWidth: '1400px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>

        <div className="room-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 320px',
          gap: '1.25rem',
          alignItems: 'start',
        }}>

          {/* ── LEFT: narrative content ───────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Problem */}
            <Card title="Problem" accent={accent}>
              <Prose text={room.problem} />
            </Card>

            {/* Solution */}
            <Card title="Solution" accent={accent}>
              <Prose text={room.solution} />
            </Card>

            {/* The Insight */}
            {room.insight && (
              <Card title="The Insight" accent={accent}>
                <Prose text={room.insight} />
              </Card>
            )}

            {/* Traction */}
            {room.traction && (
              <Card title="Traction" accent={accent}>
                <BulletList text={room.traction} />
              </Card>
            )}

            {/* Key Relationships */}
            {room.relationships.length > 0 && (
              <Card title="Key Relationships" accent={accent}>
                <RelationshipsTable rows={room.relationships} />
              </Card>
            )}

            {/* Recent Activity */}
            <Card title="Recent Activity" accent={accent}>
              <PulseFeed slug={slug} />
            </Card>

          </div>

          {/* ── RIGHT: structured sidebar ─────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Graduation progress */}
            {room.graduation_criteria.length > 0 && (
              <Card title="Graduation Criteria" accent={accent}>
                <GraduationList criteria={room.graduation_criteria} color={accent} />
              </Card>
            )}

            {/* Market */}
            {room.market && (
              <Card title="Market" accent={accent}>
                <BulletList text={room.market} />
              </Card>
            )}

            {/* Moat */}
            {room.moat && (
              <Card title="Moat" accent={accent}>
                <BulletList text={room.moat} />
              </Card>
            )}

            {/* Stack */}
            {room.stack && (
              <Card title="Stack" accent={accent}>
                <StackBlock stack={room.stack} />
              </Card>
            )}

            {/* Docs */}
            <Card title="Docs" accent={accent}>
              <DocsList docs={room.docs} github={room.github} />
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}
