import { useState, useEffect, useRef } from 'react'
import { postLayout } from '../services/api'

export function useLayout(lens) {
  const [spec, setSpec] = useState(null)
  const [loading, setLoading] = useState(false)
  const currentLens = useRef(lens)

  useEffect(() => {
    currentLens.current = lens
    setLoading(true)

    postLayout(lens)
      .then(data => {
        // Only apply if this is still the active lens (no stale updates)
        if (currentLens.current === lens) {
          setSpec(data)
        }
      })
      .catch(() => {
        if (currentLens.current === lens) setSpec(null)
      })
      .finally(() => {
        if (currentLens.current === lens) setLoading(false)
      })
  }, [lens])

  // spec is deliberately NOT cleared on lens switch — old layout stays visible
  // (dimmed via opacity in Dashboard) while new one loads
  return { spec, loading }
}
