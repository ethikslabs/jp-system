// src/components/LeftNav/LeftNav.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './LeftNav.css'

function Section({ label, children }) {
  return (
    <div>
      <div className="leftnav__section-label">{label}</div>
      {children}
    </div>
  )
}

function Item({ label, badge, badgeVariant, onClick, active }) {
  return (
    <div className={`leftnav__item${active ? ' active' : ''}`} onClick={onClick}>
      <span>{label}</span>
      {badge && <span className={`leftnav__badge${badgeVariant === 'blocker' ? ' leftnav__badge--blocker' : ''}`}>{badge}</span>}
    </div>
  )
}

export function LeftNav() {
  const navigate = useNavigate()
  const [active, setActive] = useState('proof360')

  function nav(id, path) {
    setActive(id)
    if (path) navigate(path)
  }

  return (
    <nav className="leftnav">
      <Section label="Stack">
        <Item label="Proof360"    badge="primary"  active={active === 'proof360'}    onClick={() => nav('proof360')} />
        <Item label="Research360"                  active={active === 'research360'} onClick={() => nav('research360')} />
        <Item label="Voice360"                     active={active === 'voice360'}    onClick={() => nav('voice360')} />
        <Item label="Fund360"                      active={active === 'fund360'}     onClick={() => nav('fund360')} />
        <Item label="Raise360"                     active={active === 'raise360'}    onClick={() => nav('raise360')} />
        <Item label="Ethiks360"                    active={active === 'ethiks360'}   onClick={() => nav('ethiks360')} />
        <Item label="Civique"                      active={active === 'civique'}     onClick={() => nav('civique')} />
      </Section>

      <Section label="Engines">
        <Item label="Research360 engine" badge="↗" active={active === 'eng-r'} onClick={() => nav('eng-r', '/engines/research')} />
        <Item label="Trust360 engine"    badge="↗" active={active === 'eng-t'} onClick={() => nav('eng-t', '/engines/trust')} />
      </Section>

      <Section label="System">
        <Item label="Pipeline · PIPELINE.md" active={active === 'pipeline'}    onClick={() => nav('pipeline')} />
        <Item label="Kiro queue"  badge="3"  active={active === 'kiro'}        onClick={() => nav('kiro')} />
        <Item label="Convergence loop"       active={active === 'convergence'} onClick={() => nav('convergence')} />
      </Section>

      <Section label="Relationships">
        <Item label="Ingram ANZ"   badge="↗" active={active === 'ingram'}  onClick={() => nav('ingram')} />
        <Item label="ReachLX · Paul"          active={active === 'reachlx'} onClick={() => nav('reachlx')} />
        <Item label="Partners"               active={active === 'partners'} onClick={() => nav('partners')} />
      </Section>
    </nav>
  )
}
