import { createContext, useContext, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

const ROLE_TO_PERSONA = {
  founder:  'edison',
  cto:      'edison',
  coo:      'sophia',
  partner:  'sophia',
  investor: 'leonardo',
}

const PersonaContext = createContext(null)

export function PersonaProvider({ children }) {
  const { user } = useAuth0()
  const role = user?.['app_metadata']?.role ?? 'founder'
  const defaultPersona = ROLE_TO_PERSONA[role] ?? 'edison'
  const [persona, setPersona] = useState(defaultPersona)
  return (
    <PersonaContext.Provider value={{ persona, setPersona }}>
      {children}
    </PersonaContext.Provider>
  )
}

export function usePersona() {
  const ctx = useContext(PersonaContext)
  if (!ctx) throw new Error('usePersona must be used inside PersonaProvider')
  return ctx
}
