// src/components/dashboard/PlatformGrid/PlatformGrid.jsx
import { PlatformCard } from '../PlatformCard/PlatformCard'

function IngramBadge() {
  return (
    <div style={{ flexShrink: 0, textAlign: 'right' }}>
      <div style={{ fontFamily: 'DM Mono', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 10px', borderRadius: '9999px', background: 'rgba(200,169,110,0.12)', border: '1px solid rgba(200,169,110,0.22)', color: 'var(--accent-e)', display: 'inline-block', marginBottom: '4px' }}>
        Ingram ANZ MD
      </div>
      <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Scarcity strategy active</div>
    </div>
  )
}

const CARDS = [
  { eyebrow: 'Knowledge layer',       name: 'Research360', description: 'pgvector, BullMQ, Unstructured.io. Running locally end-to-end.', status: 'Deploy pending', statusColor: 'amber' },
  { eyebrow: 'Voice layer',           name: 'Voice360',    description: 'Softswitch architecture. WebSocket, AudioWorklet, Cartesia. Brief docs locked.', status: 'Brief → Kiro', statusColor: 'blue-grey' },
  { eyebrow: 'Hypothesis engine',     name: 'Fund360',     description: 'ASX announcements. pgvector + TimescaleDB. Analyst personas locked. Paper trading only.', status: 'Architecture locked', statusColor: 'blue-grey' },
  { eyebrow: 'Capital layer',         name: 'Raise360',    description: 'SAFEs, pre-seed → Series A. Tokenisation internal only. No AFSL exposure.', status: 'Scoped · not started', statusColor: 'muted' },
  { eyebrow: 'Platform · via Ethiks361', name: 'Ethiks360', description: 'Sarvesh (CTO), Val (COO). Staged through Ethiks361 pre-sandbox.', status: 'Staged', statusColor: 'muted' },
]

export function PlatformGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
      <PlatformCard
        hero
        eyebrow="Primary · trust intelligence"
        name="Proof360"
        description="A trust intelligence report every founder needs before their first enterprise deal. Live at proof360.au. Generating interest — deliberately scarce."
        status="Live · scarcity active"
        statusColor="green"
        accent="var(--accent-e)"
      >
        <IngramBadge />
      </PlatformCard>

      {CARDS.map(c => (
        <PlatformCard key={c.name} {...c} />
      ))}
    </div>
  )
}
