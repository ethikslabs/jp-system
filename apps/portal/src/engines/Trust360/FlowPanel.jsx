// apps/portal/src/engines/Trust360/FlowPanel.jsx
import { FlowStep } from './FlowStep'

const STEPS = [
  { num: 1, title: 'Signal ingestion',        delay: 0,    duration: 1100 },
  { num: 2, title: 'Corpus retrieval',         delay: 1100, duration: 1100 },
  { num: 3, title: 'Gap analysis',             delay: 2200, duration: 1200 },
  { num: 4, title: 'Vendor resolution',        delay: 3400, duration: 1300 },
  { num: 5, title: 'Trust score computation',  delay: 4700, duration: 1400 },
  { num: 6, title: 'Report rendered',          delay: 6100, duration: 1400 },
]

export function FlowPanel({ running, company, stepStates }) {
  return (
    <div style={{ flex: 1, padding: '20px 24px', overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <div style={{ fontFamily: 'Instrument Serif', fontSize: '16px', color: 'var(--text)' }}>Report generation flow</div>
        <span style={{ fontFamily: 'DM Mono', fontSize: '10px', padding: '3px 8px', borderRadius: '9999px', background: 'rgba(196,122,122,0.12)', border: '1px solid rgba(196,122,122,0.25)', color: 'var(--accent-t)' }}>
          {company || 'EthiksLabs'}
        </span>
      </div>
      <div>
        {STEPS.map(s => (
          <FlowStep key={s.num} num={s.num} title={s.title} state={stepStates[s.num] ?? 'pending'} output={stepStates[s.num] !== 'pending'} />
        ))}
      </div>
    </div>
  )
}
