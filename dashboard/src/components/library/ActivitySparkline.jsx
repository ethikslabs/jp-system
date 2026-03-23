import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine, ReferenceArea } from 'recharts'

function generateSparklineData() {
  let val = 30
  return Array.from({ length: 24 }, (_, i) => {
    val = Math.max(5, Math.min(95, val + (Math.random() - 0.48) * 15))
    return { hour: `${23 - i}h`, value: Math.round(val) }
  }).reverse()
}

const DEFAULT_DATA = generateSparklineData()

function statusLabel(current, threshold = 80) {
  if (current > threshold) return { text: 'High', color: '#EF4444' }
  if (current > threshold * 0.75) return { text: 'Elevated', color: '#FBBF24' }
  return { text: 'Normal', color: '#2DD4BF' }
}

export function ActivitySparkline({ title, points, current, unit = '', threshold = 80 }) {
  const data = points ?? DEFAULT_DATA
  const displayCurrent = current ?? data[data.length - 1]?.value
  const isMetric = unit === '%' || current !== undefined
  const status = isMetric ? statusLabel(displayCurrent, threshold) : null

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
        <div className="card-title" style={{ marginBottom: 0 }}>{title || 'Activity (24h)'}</div>
        {isMetric && displayCurrent !== undefined && (
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: status?.color || 'var(--text)', lineHeight: 1 }}>
              {displayCurrent}{unit}
            </span>
            {status && (
              <div style={{ fontSize: '0.65rem', fontWeight: '600', color: status.color, letterSpacing: '0.05em', textAlign: 'right' }}>
                {status.text}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ height: '90px', marginTop: '0.25rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 2, right: 4, bottom: 2, left: isMetric ? 28 : 4 }}>
            {isMetric ? (
              <YAxis
                domain={[0, 100]}
                ticks={[0, 50, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 9, fill: 'var(--text-dim)' }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
            ) : (
              <YAxis hide domain={['auto', 'auto']} />
            )}
            <XAxis dataKey="hour" hide />
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.75rem' }}
              itemStyle={{ color: 'var(--text)' }}
              labelStyle={{ color: 'var(--text-muted)' }}
              formatter={(v) => [`${v}${unit}`, '']}
            />
            {/* colour zones */}
            {isMetric && (
              <>
                <ReferenceArea y1={threshold} y2={100} fill="#EF444418" />
                <ReferenceArea y1={threshold * 0.75} y2={threshold} fill="#FBBF2412" />
                <ReferenceLine y={threshold} stroke="#EF444488" strokeDasharray="3 3" />
              </>
            )}
            <Line
              type="monotone"
              dataKey="value"
              stroke={status?.color || '#2DD4BF'}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
              activeDot={{ r: 3, fill: status?.color || '#2DD4BF' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
