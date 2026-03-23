import { useState, useEffect } from 'react'
import { getBpm } from '../services/api'

const DEFAULT_BPM = { current: 60, baseline: 60, max: 180, zone: 1, window_seconds: 60 }

export function useBPM() {
  const [bpm, setBpm] = useState(DEFAULT_BPM)

  useEffect(() => {
    const poll = async () => {
      try {
        const data = await getBpm()
        setBpm(data)
      } catch {
        // keep last known value on error
      }
    }

    poll()
    const id = setInterval(poll, 1000)
    return () => clearInterval(id)
  }, [])

  return bpm
}
