import { useState, useEffect } from 'react'
import ProjectCard from './components/ProjectCard'

function Clock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <time className="clock">
      {time.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </time>
  )
}

const PRIORITY = { red: 0, amber: 1, green: 2, grey: 3 }

export default function App() {
  const [projects, setProjects] = useState([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(data => setProjects(data.sort((a, b) => PRIORITY[a.light] - PRIORITY[b.light])))
  }, [])

  useEffect(() => {
    const es = new EventSource('/api/events')
    es.addEventListener('connected', () => setConnected(true))
    es.addEventListener('update', e => {
      const updated = JSON.parse(e.data)
      setProjects(prev =>
        prev.map(p => p.id === updated.id ? updated : p)
            .sort((a, b) => PRIORITY[a.light] - PRIORITY[b.light])
      )
    })
    es.addEventListener('health', e => {
      const { id, health } = JSON.parse(e.data)
      setProjects(prev => prev.map(p => p.id === id ? { ...p, health } : p))
    })
    es.onerror = () => setConnected(false)
    return () => es.close()
  }, [])

  const active = projects.filter(p => p.light !== 'grey')
  const incoming = projects.filter(p => p.light === 'grey')
  const date = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <span className="wordmark">ETHIKSLABS</span>
          <span className="header-divider">·</span>
          <span className="header-sub">Operations Console</span>
        </div>
        <div className="header-right">
          <Clock />
          <div className={`live-pill ${connected ? 'live' : 'offline'}`}>
            <span className="live-dot" />
            {connected ? 'LIVE' : 'OFFLINE'}
          </div>
        </div>
      </header>

      <main className="main">
        {active.length > 0 && (
          <section>
            <div className="section-label">Active — {active.length} project{active.length !== 1 ? 's' : ''}</div>
            <div className="grid">
              {active.map(p => <ProjectCard key={p.id} project={p} />)}
            </div>
          </section>
        )}

        {incoming.length > 0 && (
          <section>
            <div className="section-label dim">Incoming</div>
            <div className="grid">
              {incoming.map(p => <ProjectCard key={p.id} project={p} />)}
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <span>{date}</span>
        <span className="footer-path">~/jp-system/projects</span>
      </footer>
    </div>
  )
}
