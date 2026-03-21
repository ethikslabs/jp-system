// src/pages/Dashboard.jsx
import { LeftNav } from '../components/LeftNav/LeftNav'
import { RightPanel } from '../components/RightPanel/RightPanel'
import { EdisonView } from '../components/dashboard/views/EdisonView'
import { usePersona } from '../contexts/PersonaContext'

export function Dashboard() {
  const { persona } = usePersona()
  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <LeftNav />
      <main style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>
        {persona === 'edison' && <EdisonView />}
        {persona !== 'edison' && <div style={{ color: 'var(--muted)', fontFamily: 'DM Mono', fontSize: '11px' }}>{persona} view — coming in next task</div>}
      </main>
      <RightPanel />
    </div>
  )
}
