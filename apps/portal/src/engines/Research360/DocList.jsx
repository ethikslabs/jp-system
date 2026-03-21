import { useState } from 'react'

const DOCS = [
  { name: 'SOC 2 Type II — AICPA 2017',              type: 'PDF', layer: 'L1', tag: 'framework', meta: '48 chunks · 0.94 density' },
  { name: 'ISO 27001:2022 Controls Annex A',          type: 'PDF', layer: 'L1', tag: 'framework', meta: '112 chunks · 0.97 density' },
  { name: 'Vanta — Product capability map',           type: 'WEB', layer: 'L1', tag: 'vendor',    meta: '22 chunks · 0.88 density' },
  { name: 'NIST CSF 2.0 — Core Functions',           type: 'PDF', layer: 'L1', tag: 'framework', meta: '67 chunks · 0.92 density' },
  { name: 'Ingram Micro AU — Catalog snapshot',       type: 'API', layer: 'L5', tag: 'signal',   meta: 'Live · updated 4h ago' },
  { name: 'ASIC — Disclosure obligations (Aus)',      type: 'WEB', layer: 'L3', tag: 'signal',   meta: 'Crawl: daily' },
  { name: 'REACH Leading Profile — ReachLX',          type: 'API', layer: 'L5', tag: 'vendor',   meta: 'founder_trust gap · teaser integration' },
  { name: 'Dicker Data AU — Distributor map',         type: 'API', layer: 'L5', tag: 'signal',   meta: 'Live · updated 2h ago' },
  { name: 'Privacy Act 1988 — APPs (Aus)',            type: 'PDF', layer: 'L1', tag: 'framework', meta: '31 chunks · 0.91 density' },
  { name: 'GitHub — Security advisory feed',          type: 'WEB', layer: 'L3', tag: 'signal',   meta: 'Crawl: hourly' },
]

const TAG_COLORS = {
  framework: 'var(--accent-r)',
  vendor:    'var(--accent-s)',
  signal:    'var(--accent-e)',
}

const FILTERS = ['Framework', 'Vendor', 'Signal']

export function DocList({ activeLayer }) {
  const [query, setQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState(new Set())
  const [selectedDoc, setSelectedDoc] = useState(null)

  function toggleFilter(f) {
    setActiveFilters(prev => {
      const next = new Set(prev)
      next.has(f) ? next.delete(f) : next.add(f)
      return next
    })
  }

  const filtered = DOCS.filter(d => {
    const matchesQuery = d.name.toLowerCase().includes(query.toLowerCase())
    const matchesFilter = activeFilters.size === 0 || activeFilters.has(d.tag.charAt(0).toUpperCase() + d.tag.slice(1))
    return matchesQuery && matchesFilter
  })

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search corpus…"
          style={{
            flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '6px',
            padding: '6px 10px', color: 'var(--text)', fontSize: '12px', fontFamily: 'DM Sans',
            outline: 'none',
          }}
        />
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => toggleFilter(f)}
            style={{
              fontFamily: 'DM Mono', fontSize: '9px', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer',
              background: activeFilters.has(f) ? `${TAG_COLORS[f.toLowerCase()]}18` : 'var(--bg3)',
              border: activeFilters.has(f) ? `1px solid ${TAG_COLORS[f.toLowerCase()]}44` : '1px solid var(--border)',
              color: activeFilters.has(f) ? TAG_COLORS[f.toLowerCase()] : 'var(--muted)',
              transition: 'all 0.2s ease',
            }}
          >{f}</button>
        ))}
      </div>

      {/* Doc rows */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {filtered.map((doc, i) => (
          <div
            key={i}
            onClick={() => setSelectedDoc(doc.name === selectedDoc ? null : doc.name)}
            style={{
              padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)',
              background: selectedDoc === doc.name ? 'rgba(176,138,212,0.06)' : 'transparent',
              transition: 'background 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
              <span style={{ fontFamily: 'DM Mono', fontSize: '8px', padding: '1px 5px', borderRadius: '3px', background: 'var(--bg4)', color: 'var(--muted)', flexShrink: 0 }}>{doc.type}</span>
              <span style={{ fontSize: '12px', color: 'var(--text)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</span>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontFamily: 'DM Mono', fontSize: '8px', padding: '1px 5px', borderRadius: '3px', background: `${TAG_COLORS[doc.tag]}18`, color: TAG_COLORS[doc.tag] }}>{doc.layer}</span>
              <span style={{ fontFamily: 'DM Mono', fontSize: '8px', padding: '1px 5px', borderRadius: '3px', background: `${TAG_COLORS[doc.tag]}12`, color: TAG_COLORS[doc.tag] }}>{doc.tag}</span>
              <span style={{ fontFamily: 'DM Mono', fontSize: '9px', color: 'var(--muted)' }}>{doc.meta}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
