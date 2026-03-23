import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from 'recharts'

const COLORS = ['#60A5FA', '#2DD4BF', '#FBBF24', '#F97316', '#EF4444']

export function CostTracker({ title, data }) {
  // Only render real AWS cost data — if none, show awaiting state
  if (!data || !data.length) {
    return (
      <div className="card">
        <div className="card-title">{title || 'AWS Costs'}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
          Awaiting cost data…
        </div>
        <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
          Updated hourly from Cost Explorer
        </div>
      </div>
    )
  }
  const total = data.reduce((sum, d) => sum + d.spend, 0)

  return (
    <div className="card">
      <div className="card-title">{title || 'AWS Costs'}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>This month</span>
        <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text)' }}>${total.toFixed(2)}</span>
      </div>
      <div style={{ height: '100px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
            <XAxis dataKey="source" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.75rem' }}
              itemStyle={{ color: 'var(--text)' }}
              labelStyle={{ color: 'var(--text-muted)' }}
              formatter={(v) => [`$${v.toFixed(2)}`, 'Spend']}
            />
            <Bar dataKey="spend" radius={[3, 3, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
