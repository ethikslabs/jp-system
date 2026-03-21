import { useState } from 'react'
import { CorpusBrowser } from './CorpusBrowser'
import { DocList }       from './DocList'
import { QueryPanel }    from './QueryPanel'

export function Research360Engine() {
  const [activeLayer, setActiveLayer] = useState('l1')
  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <CorpusBrowser activeLayer={activeLayer} onLayerSelect={setActiveLayer} />
      <DocList activeLayer={activeLayer} />
      <QueryPanel />
    </div>
  )
}
