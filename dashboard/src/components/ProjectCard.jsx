import { useNavigate } from 'react-router-dom'

const HEALTH_COLORS = {
  ok:           '#00e676',
  warn:         '#ffab00',
  danger:       '#ff3d00',
  unconfigured: '#2a2a2a',
  unknown:      '#2a2a2a',
}

function HealthBar({ health }) {
  if (!health || health.summary === 'unconfigured') return null
  const color = HEALTH_COLORS[health.summary] ?? '#2a2a2a'
  const label = health.summary === 'ok'
    ? `${health.checks.length} check${health.checks.length !== 1 ? 's' : ''} passing`
    : health.summary === 'danger' ? 'service issue detected'
    : health.summary === 'warn'   ? 'cert expiry warning'
    : 'checking…'
  return (
    <div className="health-bar" style={{ '--health-color': color }}>
      <span className="health-dot" />
      <span className="health-label">{label}</span>
    </div>
  )
}

const LIGHTS = {
  green: { color: '#00e676', label: 'LIVE' },
  amber: { color: '#ffab00', label: 'IN PROGRESS' },
  red:   { color: '#ff3d00', label: 'BLOCKED' },
  grey:  { color: '#3a3a3a', label: 'INCOMING' },
}

export default function ProjectCard({ project }) {
  const light = LIGHTS[project.light] ?? LIGHTS.grey
  const hasBlockers = project.blockers.length > 0
  const hasNext = project.next.length > 0
  const navigate = useNavigate()

  return (
    <article
      className={`card card--${project.light}`}
      style={{ '--accent': light.color, cursor: 'pointer' }}
      onClick={() => navigate(`/project/${project.id}`)}
    >
      <div className="card-header">
        <h2 className="card-name">{project.name}</h2>
        <div className="card-badge">
          <span className="card-dot" />
          {light.label}
        </div>
      </div>

      {project.description && (
        <p className="card-desc">{project.description}</p>
      )}

      <div className="card-status">{project.status}</div>

      {hasBlockers && (
        <div className="card-section card-section--blocked">
          <div className="card-section-title">BLOCKED ON</div>
          <ul>
            {project.blockers.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </div>
      )}

      {hasNext && (
        <div className="card-section">
          <div className="card-section-title">NEXT</div>
          <ul>
            {project.next.slice(0, 3).map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        </div>
      )}

      <HealthBar health={project.health} />
    </article>
  )
}
