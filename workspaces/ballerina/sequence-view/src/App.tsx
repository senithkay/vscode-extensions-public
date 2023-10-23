import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { SequenceView } from "../"

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <SequenceView></SequenceView>
    </>
  )
}

export default App
