import { motion } from 'framer-motion'

const ZONE_COLORS = {
  1: '#60A5FA',
  2: '#2DD4BF',
  3: '#FBBF24',
  4: '#F97316',
  5: '#EF4444',
}

const ZONE_LABELS = {
  1: 'Resting',
  2: 'Active',
  3: 'Elevated',
  4: 'High Intensity',
  5: 'Critical',
}

function HeartSVG({ color, size = 120 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill={color}
      style={{ filter: `drop-shadow(0 0 16px ${color}88)` }}
    >
      <path d="M50 85 C25 68, 5 55, 5 32 A25 25 0 0 1 50 20 A25 25 0 0 1 95 32 C95 55, 75 68, 50 85Z" />
    </svg>
  )
}

export function Heart({ bpm }) {
  const { current = 60, max = 180, zone = 1 } = bpm
  const color = ZONE_COLORS[zone] || ZONE_COLORS[1]
  const beatDuration = 60 / Math.max(current, 20)

  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          animate={{ scale: [1, 1.15, 1, 1.08, 1] }}
          transition={{ duration: beatDuration, repeat: Infinity, ease: 'easeInOut' }}
        >
          <HeartSVG color={color} />
        </motion.div>
        <motion.span
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: beatDuration, repeat: Infinity }}
          style={{
            position: 'absolute',
            color: 'var(--bg)',
            fontWeight: '700',
            fontSize: '1rem',
            lineHeight: 1,
            pointerEvents: 'none',
          }}
        >
          {max}
        </motion.span>
      </div>

      <div style={{ color: 'var(--text)', fontSize: '2rem', fontWeight: '700', lineHeight: 1 }}>
        {current} <span style={{ fontSize: '1rem', fontWeight: '400', color: 'var(--text-muted)' }}>BPM</span>
      </div>
      <div style={{ color, fontSize: '0.875rem', fontWeight: '500' }}>
        Zone {zone} — {ZONE_LABELS[zone] || 'Unknown'}
      </div>
    </div>
  )
}
