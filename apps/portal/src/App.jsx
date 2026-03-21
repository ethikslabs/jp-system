import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { PersonaProvider } from './contexts/PersonaContext'

export default function App() {
  const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0()
  if (isLoading) return <div style={{ color: 'var(--muted)', padding: '2rem', fontFamily: 'DM Mono' }}>Authenticating…</div>
  if (!isAuthenticated) { loginWithRedirect(); return null }
  return (
    <PersonaProvider>
      <Routes>
        <Route path="/" element={<div>Dashboard stub</div>} />
        <Route path="/engines/:engine" element={<div>Engine stub</div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PersonaProvider>
  )
}
