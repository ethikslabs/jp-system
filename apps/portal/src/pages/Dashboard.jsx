// src/pages/Dashboard.jsx
import { LeftNav } from '../components/LeftNav/LeftNav'
import { RightPanel } from '../components/RightPanel/RightPanel'

export function Dashboard() {
  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <LeftNav />
      <main style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>
        {/* Persona views rendered here in Task 5–7 */}
        <div style={{ color: 'var(--muted)', fontFamily: 'DM Mono', fontSize: '11px' }}>Loading persona view…</div>
      </main>
      <RightPanel />
    </div>
  )
}
