import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { PersonaProvider } from './contexts/PersonaContext'
import { TopBar } from './components/TopBar/TopBar'

export default function App() {
  const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0()
  if (isLoading) return <div style={{ color: 'var(--muted)', padding: '2rem', fontFamily: 'DM Mono', fontSize: '11px' }}>Authenticating…</div>
  if (!isAuthenticated) { loginWithRedirect(); return null }
  return (
    <PersonaProvider>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <TopBar />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Routes>
            <Route path="/" element={<div style={{ color: 'var(--muted)', padding: '2rem' }}>Dashboard stub</div>} />
            <Route path="/engines/:engine" element={<div style={{ color: 'var(--muted)', padding: '2rem' }}>Engine stub</div>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </PersonaProvider>
  )
}
