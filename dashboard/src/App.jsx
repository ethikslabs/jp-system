import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Onboarding } from './screens/Onboarding'
import { Dashboard } from './screens/Dashboard'
import { ProjectRoom } from './screens/ProjectRoom'
import { getOnboarding } from './services/api'

function AppShell() {
  const [screen, setScreen] = useState('loading')

  useEffect(() => {
    getOnboarding()
      .then((data) => {
        setScreen(data.configured === false ? 'onboarding' : 'ready')
      })
      .catch(() => {
        setScreen('ready')
      })
  }, [])

  if (screen === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.875rem',
      }}>
        Loading…
      </div>
    )
  }

  if (screen === 'onboarding') {
    return <Onboarding onComplete={() => setScreen('ready')} />
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/projects/:slug" element={<ProjectRoom />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
