import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LensSwitcher } from '../components/lens/LensSwitcher'
import { useBPM } from '../hooks/useBPM'
import { useLayout } from '../hooks/useLayout'
import { useActions } from '../hooks/useActions'
import { PROJECT_ROOMS } from '../data/project-rooms'
import { PipelineStrip } from '../components/PipelineStrip'
import { DeliverablesGrid } from '../components/DeliverablesGrid'
import { DELIVERABLES } from '../data/deliverables'

import { MetricCard } from '../components/library/MetricCard'
import { StatusGrid } from '../components/library/StatusGrid'
import { AlertFeed } from '../components/library/AlertFeed'
import { HealthBar } from '../components/library/HealthBar'
import { ActivitySparkline } from '../components/library/ActivitySparkline'
import { PeopleCard } from '../components/library/PeopleCard'
import { GapCard } from '../components/library/GapCard'
import { LifecycleBoard } from '../components/library/LifecycleBoard'
import { BPMChart } from '../components/library/BPMChart'
import { SecretRotation } from '../components/library/SecretRotation'
import { CostTracker } from '../components/library/CostTracker'
import { PipelineMetric } from '../components/library/PipelineMetric'

const COMPONENT_REGISTRY = {
  MetricCard, StatusGrid, AlertFeed, HealthBar, ActivitySparkline,
  PeopleCard, GapCard, LifecycleBoard, BPMChart, SecretRotation,
  CostTracker, PipelineMetric,
}

const ACTION_SEVERITY_COLOR = { critical: '#EF4444', warning: '#FBBF24' }

function truncateSummary(text, max = 120) {
  if (!text || text.length <= max) return text
  const cut = text.lastIndexOf(' ', max)
  return text.slice(0, cut > 0 ? cut : max) + '…'
}

const ZONE_COLORS = { 1: '#60A5FA', 2: '#2DD4BF', 3: '#FBBF24', 4: '#F97316', 5: '#EF4444' }
const ZONE_LABELS = { 1: 'RESTING', 2: 'ACTIVE', 3: 'ELEVATED', 4: 'HIGH', 5: 'CRITICAL' }

const SOURCES = [
  { id: 'github', label: 'GitHub' },
  { id: 'aws', label: 'AWS' },
  { id: 'cloudflare', label: 'Cloudflare' },
  { id: 'proof360', label: 'Proof360' },
  { id: 'stripe', label: 'Stripe' },
]

function useClock() {
  const [time, setTime] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return time
}

function HeartBeat({ bpm }) {
  const { current = 0, max = 175, zone = 1 } = bpm
  const color = ZONE_COLORS[zone] || ZONE_COLORS[1]
  const beatDuration = (60 / Math.max(current, 20)).toFixed(2) + 's'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <svg
        width={28} height={28} viewBox="0 0 100 100" fill={color}
        style={{
          filter: `drop-shadow(0 0 6px ${color}88)`,
          flexShrink: 0,
          animationName: 'heartbeat',
          animationDuration: beatDuration,
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationFillMode: 'both',
        }}
      >
        <path d="M50 85 C25 68, 5 55, 5 32 A25 25 0 0 1 50 20 A25 25 0 0 1 95 32 C95 55, 75 68, 50 85Z" />
      </svg>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
          <span style={{ color: 'var(--text)', fontSize: '1.5rem', fontWeight: '700', lineHeight: 1 }}>{current}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>/ {max} BPM</span>
        </div>
        <div style={{ color, fontSize: '0.625rem', fontWeight: '700', letterSpacing: '0.1em', marginTop: '1px' }}>
          Z{zone} · {ZONE_LABELS[zone]}
        </div>
      </div>
    </div>
  )
}

function SourcePill({ label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.25rem',
      padding: '0.25rem 0.5rem',
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '9999px',
      fontSize: '0.625rem', fontWeight: '600',
      color: 'var(--text)', letterSpacing: '0.05em',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#2DD4BF', display: 'inline-block', flexShrink: 0 }} />
      {label}
    </div>
  )
}

function ActionBar({ actions }) {
  const [expanded, setExpanded] = useState(false)
  if (!actions.length) return null
  const displayed = expanded ? actions : actions.slice(0, 3)
  const hidden = actions.length - displayed.length

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0.5rem 1.25rem',
      display: 'flex', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: '0.625rem', fontWeight: '700', letterSpacing: '0.15em', color: 'var(--text-dim)', flexShrink: 0, paddingTop: '0.35rem', textTransform: 'uppercase' }}>
        Actions
      </span>
      {displayed.map((action) => {
        const color = ACTION_SEVERITY_COLOR[action.severity] || 'var(--text-muted)'
        return (
          <div
            key={action.id}
            title={action.detail}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.25rem 0.625rem',
              backgroundColor: `${color}18`,
              border: `1px solid ${color}44`,
              borderRadius: '9999px',
              cursor: 'default',
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: color, display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontSize: '0.7rem', color: 'var(--text)', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {action.label}
            </span>
          </div>
        )
      })}
      {hidden > 0 && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '9999px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.7rem', padding: '0.25rem 0.625rem' }}
        >
          +{hidden} more
        </button>
      )}
      {expanded && (
        <button
          onClick={() => setExpanded(false)}
          style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '9999px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.7rem', padding: '0.25rem 0.625rem' }}
        >
          collapse
        </button>
      )}
    </div>
  )
}

function ErrorCard({ name }) {
  return (
    <div className="card" style={{ border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: '0.75rem' }}>
      Unknown: <strong>{name}</strong>
    </div>
  )
}

function ComponentRenderer({ entry }) {
  const Component = COMPONENT_REGISTRY[entry.component]
  if (!Component) return <ErrorCard name={entry.component} />
  return <Component {...entry} />
}

export function Dashboard() {
  const [lens, setLens] = useState('john')
  const bpm = useBPM()
  const { spec, loading } = useLayout(lens)
  const actions = useActions()
  const time = useClock()
  const navigate = useNavigate()
  const projectSlugs = Object.keys(PROJECT_ROOMS)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        backgroundColor: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        padding: '0.5rem 1.25rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '1rem',
      }}>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1.1rem', fontWeight: '300',
          color: 'var(--teal)', letterSpacing: '0.04em',
          flexShrink: 0,
        }}>
          EthiksLabs
        </div>
        <LensSwitcher active={lens} onChange={setLens} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto', maxWidth: '480px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {projectSlugs.map(slug => {
              const room = PROJECT_ROOMS[slug]
              return (
                <button
                  key={slug}
                  onClick={() => navigate(`/projects/${slug}`)}
                  style={{
                    background: 'none', border: `1px solid var(--border)`,
                    borderRadius: '5px', cursor: 'pointer',
                    color: 'var(--text-muted)', fontSize: '0.65rem',
                    padding: '0.2rem 0.5rem', fontWeight: '500',
                    letterSpacing: '0.02em', flexShrink: 0,
                    transition: 'color 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = room.color || '#2DD4BF'
                    e.currentTarget.style.borderColor = `${room.color || '#2DD4BF'}66`
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'var(--text-muted)'
                    e.currentTarget.style.borderColor = 'var(--border)'
                  }}
                >
                  {room.name}
                </button>
              )
            })}
          </div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.625rem', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
            {time.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* ── HUD STRIP ────────────────────────────────────────────────────── */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0.625rem 1.25rem',
        display: 'flex', alignItems: 'center', gap: '1.5rem',
        flexWrap: 'wrap',
      }}>
        <HeartBeat bpm={bpm} />

        <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border)', flexShrink: 0 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
          {SOURCES.map(s => <SourcePill key={s.id} label={s.label} />)}
        </div>

        <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border)', flexShrink: 0 }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          {spec ? (
            <div style={{
              color: loading ? 'var(--text-dim)' : 'var(--text-muted)',
              fontSize: '0.75rem',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              <span style={{ color: '#6366F1', fontSize: '0.625rem', fontWeight: '700', letterSpacing: '0.1em', marginRight: '0.5rem' }}>AI</span>
              {truncateSummary(spec.summary)}
            </div>
          ) : (
            <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Awaiting signal…</div>
          )}
        </div>

        {loading && (
          <div style={{ color: 'var(--text-dim)', fontSize: '0.625rem', letterSpacing: '0.1em', flexShrink: 0 }}>UPDATING</div>
        )}
      </div>

      {/* ── ACTION BAR ───────────────────────────────────────────────────── */}
      <ActionBar actions={actions} />

      {/* ── PIPELINE STRIP ──────────────────────────────────────────────── */}
      <PipelineStrip deliverables={DELIVERABLES} />

      {/* ── DELIVERABLES GRID ───────────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <DeliverablesGrid deliverables={DELIVERABLES} lens={lens} />
      </div>

    </div>
  )
}
