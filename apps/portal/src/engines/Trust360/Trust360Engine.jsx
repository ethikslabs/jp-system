// apps/portal/src/engines/Trust360/Trust360Engine.jsx
import { useState, useRef } from 'react'
import { ConfigPanel } from './ConfigPanel'
import { FlowPanel }   from './FlowPanel'

const STEP_SCHEDULE = [
  { num: 1, delay: 0,    runFor: 1100 },
  { num: 2, delay: 1100, runFor: 1100 },
  { num: 3, delay: 2200, runFor: 1200 },
  { num: 4, delay: 3400, runFor: 1300 },
  { num: 5, delay: 4700, runFor: 1400 },
  { num: 6, delay: 6100, runFor: 1400 },
]

export function Trust360Engine() {
  const [running, setRunning]       = useState(false)
  const [stepStates, setStepStates] = useState({})
  const [company, setCompany]       = useState('EthiksLabs')
  const timers = useRef([])

  function clearTimers() { timers.current.forEach(clearTimeout); timers.current = [] }

  function runAssessment({ company: c }) {
    clearTimers()
    setCompany(c)
    setRunning(true)
    setStepStates({})

    STEP_SCHEDULE.forEach(({ num, delay, runFor }) => {
      // Start step
      timers.current.push(setTimeout(() => {
        setStepStates(prev => ({ ...prev, [num]: 'running' }))
      }, delay))
      // Complete step
      timers.current.push(setTimeout(() => {
        setStepStates(prev => ({ ...prev, [num]: 'done' }))
        // Re-enable button after last step completes
        if (num === 6) setRunning(false)
      }, delay + runFor))
    })
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* onCompanyChange fires on every keystroke — FlowPanel header tag updates live */}
      <ConfigPanel onRun={runAssessment} running={running} onCompanyChange={setCompany} />
      <FlowPanel running={running} company={company} stepStates={stepStates} />
    </div>
  )
}
