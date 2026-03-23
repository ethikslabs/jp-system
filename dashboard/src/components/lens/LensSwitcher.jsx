const LENSES = [
  { id: 'john',    label: 'John'    },
  { id: 'sarvesh', label: 'Sarvesh' },
  { id: 'val',     label: 'Val'     },
]

export function LensSwitcher({ active, onChange }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '0.25rem',
        padding: '0.25rem',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
      }}
    >
      {LENSES.map((lens) => {
        const isActive = lens.id === active
        return (
          <button
            key={lens.id}
            onClick={() => onChange(lens.id)}
            style={{
              padding: '0.375rem 0.875rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: isActive ? '600' : '400',
              backgroundColor: isActive ? 'var(--text)' : 'transparent',
              color: isActive ? 'var(--bg)' : 'var(--text-muted)',
              transition: 'all 0.15s ease',
            }}
          >
            {lens.label}
          </button>
        )
      })}
    </div>
  )
}
