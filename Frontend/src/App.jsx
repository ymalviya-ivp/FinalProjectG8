import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import TradeBlotter from './components/TradeBlotter'
import TradingDashboard from './components/TradingDashboard'
import './App.css'

function App() {

  return (
    <div className="App">
      <TradingDashboard />
      {/* <TradeBlotter /> */}
    </div>
  )
}

export default App
