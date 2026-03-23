import { useState } from 'react'
import { postOnboarding } from '../services/api'

export function Onboarding({ onComplete }) {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    const maxBpm = parseInt(value, 10)
    if (!maxBpm || maxBpm < 40 || maxBpm > 300) {
      setError('Enter a valid max heart rate (40–300)')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await postOnboarding(maxBpm)
      onComplete()
    } catch {
      setError('Failed to save — is the API running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
      }}
    >
      <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
        EthiksLabs
      </div>

      <div style={{ color: 'var(--text)', fontSize: '1.5rem', fontWeight: '600' }}>
        What is your max heart rate?
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '240px' }}>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. 180"
          min="40"
          max="300"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text)',
            fontSize: '1.25rem',
            textAlign: 'center',
            outline: 'none',
          }}
          autoFocus
        />

        {error && (
          <div style={{ color: '#EF4444', fontSize: '0.875rem', textAlign: 'center' }}>{error}</div>
        )}

        <button
          type="submit"
          disabled={loading || !value}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: loading || !value ? 'var(--border)' : 'var(--text)',
            color: loading || !value ? 'var(--text-muted)' : 'var(--bg)',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: loading || !value ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {loading ? 'Saving…' : 'Begin'}
        </button>
      </form>
    </div>
  )
}
