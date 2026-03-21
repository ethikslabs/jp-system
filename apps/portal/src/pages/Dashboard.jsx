// src/pages/Dashboard.jsx
import { LeftNav } from '../components/LeftNav/LeftNav'
import { RightPanel } from '../components/RightPanel/RightPanel'
import { EdisonView } from '../components/dashboard/views/EdisonView'
import { SophiaView } from '../components/dashboard/views/SophiaView'
import { LeonardoView } from '../components/dashboard/views/LeonardoView'
import { usePersona } from '../contexts/PersonaContext'

export function Dashboard() {
  const { persona } = usePersona()
  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <LeftNav />
      <main style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>
        {persona === 'edison' && <EdisonView />}
        {persona === 'sophia' && <SophiaView />}
        {persona === 'leonardo' && <LeonardoView />}
      </main>
      <RightPanel />
    </div>
  )
}
