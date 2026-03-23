import { useRef, useEffect, useState } from 'react'
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip, ReferenceLine, Label } from 'recharts'
import { useBPM } from '../../hooks/useBPM'

const ZONE_COLORS = { 1: '#60A5FA', 2: '#2DD4BF', 3: '#FBBF24', 4: '#F97316', 5: '#EF4444' }
const ZONE_LABELS = { 1: 'Resting', 2: 'Active', 3: 'Elevated', 4: 'High', 5: 'Critical' }

const MAX_HISTORY = 60 // 60 seconds of 1s readings

function interpretation(current, baseline) {
  if (current > baseline * 1.15) return 'Above baseline — elevated activity'
  if (current < baseline * 0.85) return 'Below baseline — quiet period'
  return 'Normal operating rhythm'
}

export function BPMChart({ title, baseline = 45 }) {
  const bpm = useBPM()
  const historyRef = useRef([])
  const [history, setHistory] = useState([])

  // Accumulate real readings — one per second from useBPM
  useEffect(() => {
    if (!bpm?.current) return
    const entry = { t: Date.now(), bpm: bpm.current }
    historyRef.current = [...historyRef.current.slice(-(MAX_HISTORY - 1)), entry]
    setHistory([...historyRef.current])
  }, [bpm.current]) // only when value actually changes

  const current = bpm.current ?? 0
  const zone = bpm.zone ?? 1
  const zoneColor = ZONE_COLORS[zone] || ZONE_COLORS[1]

  const chartData = history.map((h, i) => ({
    i,
    bpm: h.bpm,
    label: `${Math.round((Date.now() - h.t) / 1000)}s ago`,
  }))

  const values = chartData.map(d => d.bpm)
  const minVal = values.length ? Math.min(...values, baseline) - 5 : 20
  const maxVal = values.length ? Math.max(...values, baseline) + 5 : 100

  return (
    <div className="card">
      <div className="card-title">{title || 'System Pulse'}</div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
          <span style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text)', lineHeight: 1 }}>{current}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>BPM</span>
        </div>
        <span style={{
          fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.08em',
          color: zoneColor, backgroundColor: `${zoneColor}18`,
          border: `1px solid ${zoneColor}44`, borderRadius: '9999px',
          padding: '0.125rem 0.5rem',
        }}>
          Z{zone} · {ZONE_LABELS[zone] || 'Unknown'}
        </span>
      </div>

      <div style={{ height: '80px' }}>
        {chartData.length < 2 ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
            Collecting data…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
              <YAxis hide domain={[minVal, maxVal]} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.75rem' }}
                itemStyle={{ color: 'var(--text)' }}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.label ?? ''}
                formatter={(v) => [`${v} BPM`, '']}
              />
              <ReferenceLine y={baseline} stroke="var(--text-dim)" strokeDasharray="3 3">
                <Label value={`baseline ${baseline}`} position="insideTopRight" fontSize={9} fill="var(--text-dim)" />
              </ReferenceLine>
              <Line
                type="monotone" dataKey="bpm" stroke={zoneColor}
                strokeWidth={1.5} dot={false} isAnimationActive={false}
                activeDot={{ r: 3, fill: zoneColor }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
        {history.length > 1 ? interpretation(current, baseline) : 'Warming up…'}
      </div>
    </div>
  )
}
