import { useAuth0 } from '@auth0/auth0-react'
import { useCallback } from 'react'

export function useApi() {
  const { getAccessTokenSilently } = useAuth0()
  const base = import.meta.env.VITE_API_URL ?? ''

  const apiFetch = useCallback(async (path, options = {}) => {
    const token = await getAccessTokenSilently()
    const res = await fetch(`${base}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    })
    if (!res.ok) throw new Error(`API ${res.status}: ${path}`)
    return res.json()
  }, [getAccessTokenSilently, base])

  return { apiFetch }
}
