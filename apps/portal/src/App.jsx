import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { PersonaProvider } from './contexts/PersonaContext'
import { TopBar } from './components/TopBar/TopBar'
import { Dashboard } from './pages/Dashboard'
import { EngineView } from './pages/EngineView'

export default function App() {
  const { isLoading, isAuthenticated, loginWithRedirect, error } = useAuth0()
  if (isLoading) return <div style={{ color: 'var(--muted)', padding: '2rem', fontFamily: 'DM Mono', fontSize: '11px' }}>Authenticating…</div>
  if (error) return <div style={{ color: 'var(--accent-t)', padding: '2rem', fontFamily: 'DM Mono', fontSize: '11px' }}>{error.message}<br/><br/><span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => loginWithRedirect()}>Retry</span></div>
  if (!isAuthenticated) { loginWithRedirect(); return null }
  return (
    <PersonaProvider>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <TopBar />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/engines/:engine" element={<EngineView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </PersonaProvider>
  )
}
