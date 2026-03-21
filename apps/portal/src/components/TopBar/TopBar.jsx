// src/components/TopBar/TopBar.jsx
import { useNavigate, useLocation } from 'react-router-dom'
import { usePersona } from '../../contexts/PersonaContext'
import './TopBar.css'

const PERSONAS = [
  { id: 'edison',   label: 'Edison',   color: 'var(--accent-e)' },
  { id: 'sophia',   label: 'Sophia',   color: 'var(--accent-s)' },
  { id: 'leonardo', label: 'Leonardo', color: 'var(--accent-l)' },
]

const ENGINES = [
  { id: 'research', label: 'Research360', color: 'var(--accent-r)' },
  { id: 'trust',    label: 'Trust360',    color: 'var(--accent-t)' },
]

const DATE = '21 Mar 2026 · Coledale'

export function TopBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { persona, setPersona } = usePersona()
  const engineMatch = location.pathname.match(/^\/engines\/(\w+)/)
  const activeEngine = engineMatch?.[1] ?? null
  const isEngine = Boolean(activeEngine)

  return (
    <header className="topbar">
      {/* Left */}
      <div className="topbar__brand">
        {isEngine && (
          <button className="topbar__back" onClick={() => navigate('/')}>← dashboard</button>
        )}
        jp-system · ethikslabs
      </div>

      {/* Centre */}
      <div className="topbar__centre">
        {!isEngine
          ? PERSONAS.map(p => (
              <button
                key={p.id}
                className={`topbar__tab${persona === p.id ? ' active' : ''}`}
                data-persona={p.id}
                onClick={() => setPersona(p.id)}
              >
                <span className="topbar__dot" style={{ background: p.color }} />
                {p.label}
              </button>
            ))
          : ENGINES.map(e => (
              <button
                key={e.id}
                className={`topbar__tab${activeEngine === e.id ? ' active' : ''}`}
                data-engine={e.id}
                onClick={() => navigate(`/engines/${e.id}`)}
              >
                <span className="topbar__dot" style={{ background: e.color }} />
                {e.label}
              </button>
            ))
        }
      </div>

      {/* Right */}
      <div className="topbar__right">
        <span className="topbar__live-dot" />
        {DATE}
      </div>
    </header>
  )
}
