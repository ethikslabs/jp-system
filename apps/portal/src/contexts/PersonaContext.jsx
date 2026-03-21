// Stub — will be implemented in Task 2
import { createContext, useContext, useState } from 'react'

const PersonaContext = createContext(null)

export function PersonaProvider({ children }) {
  const [persona, setPersona] = useState('Edison')
  return <PersonaContext.Provider value={{ persona, setPersona }}>{children}</PersonaContext.Provider>
}

export function usePersona() {
  return useContext(PersonaContext)
}
