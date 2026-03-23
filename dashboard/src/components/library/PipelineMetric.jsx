const DEFAULT_FUNNEL = [
  { stage: 'Sessions', value: 247 },
  { stage: 'Started', value: 183 },
  { stage: 'Completed', value: 94 },
  { stage: 'Scored', value: 87 },
]

export function PipelineMetric({ title, filter, funnel = DEFAULT_FUNNEL }) {
  const top = funnel[0]?.value || 1

  return (
    <div className="card">
      <div className="card-title">{title || 'Pipeline'}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginTop: '0.5rem' }}>
        {funnel.map((stage, i) => {
          const pct = (stage.value / top) * 100
          const dropOff = i > 0 ? Math.round(((funnel[i - 1].value - stage.value) / funnel[i - 1].value) * 100) : 0

          return (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text)' }}>{stage.stage}</span>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {i > 0 && (
                    <span style={{ fontSize: '0.75rem', color: '#EF4444' }}>−{dropOff}%</span>
                  )}
                  <span style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text)', minWidth: '2.5rem', textAlign: 'right' }}>
                    {stage.value}
                  </span>
                </div>
              </div>
              <div style={{ height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    backgroundColor: '#2DD4BF',
                    borderRadius: '3px',
                    opacity: 1 - i * 0.15,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Completion: {top > 0 ? Math.round((funnel[funnel.length - 1]?.value / top) * 100) : 0}%
      </div>
    </div>
  )
}
