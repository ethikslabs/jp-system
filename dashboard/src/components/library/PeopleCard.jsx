const STATE_COLOR = {
  lab: '#60A5FA',
  public: '#2DD4BF',
  validated: '#FBBF24',
  authorised: '#F97316',
  live: '#EF4444',
  archived: '#6B7280',
}

const DEFAULT_PEOPLE = [
  { name: 'Alice Chen', state: 'validated', lastActivity: '2h ago', tags: ['design', 'product'] },
  { name: 'Marc Torres', state: 'public', lastActivity: '1d ago', tags: ['engineering'] },
  { name: 'Sam Park', state: 'lab', lastActivity: '4h ago', tags: ['research'] },
]

import React from 'react'

export function PeopleCard({ title, filter, people = DEFAULT_PEOPLE }) {
  const [expanded, setExpanded] = React.useState(false)
  const limit = filter?.limit ?? 3
  const displayed = expanded ? people : people.slice(0, limit)
  const hidden = people.length - displayed.length

  return (
    <div className="card">
      <div className="card-title">{title || 'People'}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
        {displayed.map((person, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.875rem',
                fontWeight: '600',
                flexShrink: 0,
              }}
            >
              {person.name.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text)', fontWeight: '500' }}>{person.name}</div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.125rem' }}>
                <span
                  className="badge"
                  style={{
                    backgroundColor: `${STATE_COLOR[person.state] || '#6B7280'}22`,
                    color: STATE_COLOR[person.state] || '#6B7280',
                    fontSize: '0.7rem',
                  }}
                >
                  {person.state}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{person.lastActivity}</span>
              </div>
            </div>
          </div>
        ))}
        {hidden > 0 && (
          <button
            onClick={() => setExpanded(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'left', padding: '0.25rem 0' }}
          >
            and {hidden} more…
          </button>
        )}
        {expanded && people.length > limit && (
          <button
            onClick={() => setExpanded(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'left', padding: '0.25rem 0' }}
          >
            show less
          </button>
        )}
      </div>
    </div>
  )
}
