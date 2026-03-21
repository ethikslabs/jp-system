import { useParams } from 'react-router-dom'
import { Research360Engine } from '../engines/Research360/Research360Engine'
import { Trust360Engine }    from '../engines/Trust360/Trust360Engine'

export function EngineView() {
  const { engine } = useParams()
  if (engine === 'research') return <Research360Engine />
  if (engine === 'trust')    return <Trust360Engine />
  return <div style={{ color: 'var(--muted)', padding: '2rem', fontFamily: 'DM Mono' }}>Unknown engine: {engine}</div>
}
