import { useState } from 'react'

const LAYERS = [
  { id: 'l1', num: 'L1', name: 'Core corpus',         count: '1,240', desc: 'Frameworks, standards, governance. Static reference.', fill: 100, live: false },
  { id: 'l2', num: 'L2', name: 'Customer corpus',     count: '38',    desc: 'Company-specific docs per session.', fill: 15, live: false },
  { id: 'l3', num: 'L3', name: 'Real-time signals',   count: 'live',  desc: 'Continuous crawl. ASX, ASIC, GitHub, web.', fill: 60, live: true },
  { id: 'l4', num: 'L4', name: 'LLM working memory',  count: 'session',desc: 'Ephemeral. Claude Sonnet reasoning context per run.', fill: 30, live: false },
  { id: 'l5', num: 'L5', name: 'External layer',      count: 'API',   desc: 'Vanta, GitHub, Xero, HubSpot integrations.', fill: 45, live: false },
  { id: 'l6', num: 'L6', name: 'Decision log',        count: '412',   desc: 'Every gap assessment, vendor pick, closure action.', fill: 55, live: false },
]

export function CorpusBrowser({ activeLayer, onLayerSelect }) {
  return (
    <div style={{ width: '240px', minWidth: '240px', borderRight: '1px solid var(--border)', padding: '20px 0', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '0 16px', marginBottom: '16px' }}>
        <div style={{ fontFamily: 'DM Mono', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-r)', marginBottom: '6px' }}>Corpus browser</div>
        <div style={{ fontFamily: 'Instrument Serif', fontSize: '15px', color: 'var(--text)' }}>Six-layer architecture</div>
      </div>
      {LAYERS.map(l => (
        <div
          key={l.id}
          onClick={() => onLayerSelect(l.id)}
          style={{
            padding: '10px 16px', cursor: 'pointer', transition: 'all 0.2s ease',
            borderLeft: activeLayer === l.id ? '2px solid var(--accent-r)' : '2px solid transparent',
            background: activeLayer === l.id ? 'rgba(176,138,212,0.06)' : 'transparent',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontFamily: 'DM Mono', fontSize: '8px', padding: '1px 5px', borderRadius: '3px', background: 'rgba(176,138,212,0.12)', color: 'var(--accent-r)' }}>{l.num}</span>
              <span style={{ fontSize: '12px', color: 'var(--text)' }}>{l.name}</span>
            </div>
            <span style={{ fontFamily: 'DM Mono', fontSize: '9px', color: l.live ? 'var(--green)' : 'var(--muted)' }}>{l.count}</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '6px', lineHeight: 1.4 }}>{l.desc}</div>
          <div style={{ height: '2px', background: 'var(--faint)', borderRadius: '1px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${l.fill}%`, borderRadius: '1px',
              background: 'var(--accent-r)',
              animation: l.live ? 'bar-pulse 1.8s ease-in-out infinite' : 'none',
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}
