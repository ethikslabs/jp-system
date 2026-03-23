const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export async function getOnboarding() {
  const res = await fetch(`${API_URL}/onboarding`)
  return res.json()
}

export async function postOnboarding(maxBpm) {
  const res = await fetch(`${API_URL}/onboarding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ max_bpm: maxBpm }),
  })
  return res.json()
}

export async function getBpm() {
  const res = await fetch(`${API_URL}/bpm`)
  return res.json()
}

export async function getEntityPulses(entityId, limit = 10) {
  const res = await fetch(`${API_URL}/pulses?entity_id=${encodeURIComponent(entityId)}&limit=${limit}`)
  return res.json()
}

export async function getSourcePulses(source, limit = 10) {
  const res = await fetch(`${API_URL}/pulses?source=${encodeURIComponent(source)}&limit=${limit}`)
  return res.json()
}

export async function getActions() {
  const res = await fetch(`${API_URL}/actions`)
  return res.json()
}

export async function postLayout(lensId) {
  const res = await fetch(`${API_URL}/layout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lens_id: lensId }),
  })
  return res.json()
}
