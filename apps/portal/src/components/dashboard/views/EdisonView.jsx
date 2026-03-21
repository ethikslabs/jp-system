// src/components/dashboard/views/EdisonView.jsx
import { PlatformGrid } from '../PlatformGrid/PlatformGrid'
import { EngineEntryRow } from '../EngineEntryRow/EngineEntryRow'
import { PipelineStrip } from '../PipelineStrip/PipelineStrip'

export function EdisonView() {
  return (
    <div>
      <div style={{ fontFamily: 'DM Mono', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-e)', marginBottom: '8px' }}>
        Edison · operational
      </div>
      <div style={{ fontFamily: 'Instrument Serif', fontSize: '26px', color: 'var(--text)', marginBottom: '6px' }}>
        What's actually shipping.
      </div>
      <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '24px' }}>
        Build velocity, pipeline state, blockers. The unvarnished read.
      </div>
      <PlatformGrid />
      <EngineEntryRow />
      <PipelineStrip />
    </div>
  )
}
