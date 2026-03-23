import { useState, useEffect } from 'react'
import { getActions } from '../services/api'

export function useActions() {
  const [actions, setActions] = useState([])

  useEffect(() => {
    const poll = async () => {
      try {
        const data = await getActions()
        if (Array.isArray(data)) setActions(data)
      } catch {
        // keep last known value on error
      }
    }

    poll()
    const id = setInterval(poll, 30_000)
    return () => clearInterval(id)
  }, [])

  return actions
}
