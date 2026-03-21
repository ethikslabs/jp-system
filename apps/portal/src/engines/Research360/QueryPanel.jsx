import { useState } from 'react'

const MOCK_RESULTS = [
  { score: 0.94, source: 'SOC 2 Type II — L1', text: 'Access control requirements mandate that logical access is restricted to authorized individuals, with periodic access reviews conducted at least annually.' },
  { score: 0.89, source: 'ISO 27001:2022 — L1', text: 'A.9.1.1: An access control policy shall be established, documented and reviewed based on business and information security requirements.' },
  { score: 0.81, source: 'NIST CSF 2.0 — L1', text: 'PR.AC-1: Identities and credentials are issued, managed, verified, revoked, and audited for authorized devices, users and processes.' },
]

export function QueryPanel() {
  const [query, setQuery] = useState('')
  const [state, setState] = useState('idle') // idle | loading | results
  const [results, setResults] = useState([])

  async function runQuery() {
    if (!query.trim()) return
    setState('loading')
    setResults([])
    // Simulate ~900ms retrieval then show mock results
    await new Promise(r => setTimeout(r, 900))
    setResults(MOCK_RESULTS)
    setState('results')
  }

  return (
    <div style={{ width: '270px', minWidth: '270px', borderLeft: '1px solid var(--border)', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <div style={{ fontFamily: 'DM Mono', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-r)', marginBottom: '6px' }}>Corpus query</div>
        <div style={{ fontFamily: 'Instrument Serif', fontSize: '15px', color: 'var(--text)' }}>Semantic search</div>
      </div>

      {/* Results / empty state */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {state === 'idle' && (
          <div style={{ color: 'var(--muted)', fontSize: '12px', textAlign: 'center', marginTop: '40px' }}>Enter a query to search the corpus</div>
        )}
        {state === 'loading' && (
          <div style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'var(--accent-r)', textAlign: 'center', marginTop: '40px' }}>RETRIEVING · embedding-3-large…</div>
        )}
        {state === 'results' && results.map((r, i) => (
          <div key={i} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: i < results.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontFamily: 'DM Mono', fontSize: '12px', color: 'var(--accent-r)', fontWeight: '500' }}>{r.score}</span>
              <div style={{ flex: 1, height: '2px', background: 'var(--faint)', borderRadius: '1px' }}>
                <div style={{ height: '100%', width: `${r.score * 100}%`, background: 'var(--accent-r)', borderRadius: '1px' }} />
              </div>
            </div>
            <div style={{ fontFamily: 'DM Mono', fontSize: '9px', color: 'var(--muted)', marginBottom: '4px' }}>{r.source}</div>
            <div style={{ fontSize: '11px', color: 'var(--text)', opacity: 0.85, lineHeight: 1.55 }}>{r.text}</div>
          </div>
        ))}
      </div>

      {/* Input row */}
      <div>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && runQuery()}
            placeholder="Query the corpus…"
            style={{
              flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '6px',
              padding: '7px 10px', color: 'var(--text)', fontSize: '12px', fontFamily: 'DM Sans', outline: 'none',
            }}
          />
          <button
            onClick={runQuery}
            style={{
              fontFamily: 'DM Mono', fontSize: '11px', padding: '7px 12px', borderRadius: '6px', cursor: 'pointer',
              background: 'rgba(176,138,212,0.12)', border: '1px solid rgba(176,138,212,0.25)', color: 'var(--accent-r)',
              transition: 'all 0.2s ease', whiteSpace: 'nowrap',
            }}
          >↵ Run</button>
        </div>
        <div style={{ fontFamily: 'DM Mono', fontSize: '9px', color: 'var(--muted)' }}>Searching L1 · L2 · L5 · embedding-3-large</div>
      </div>
    </div>
  )
}
