import { Routes, Route, Navigate } from "react-router-dom";
import TradingDashboard from './components/TradingDashboard';
import NoMatch from './components/NoMatch';
import React from "react";
import './App.css';

// Lazy load the route components
const TradeBlotter = React.lazy(() => import('./components/TradeBlotter'));
const Positions = React.lazy(() => import('./components/Positions'));
const Pnl = React.lazy(() => import('./components/PnL'));

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<TradingDashboard />}>
          <Route index element={<Navigate to="/trades-blotter" replace />} />
          <Route path="/trades-blotter" element={<TradeBlotter />} />
          <Route path="/pnl" element={<Pnl />} />
          <Route path="/positions" element={<Positions />} />
        </Route>
        <Route path="/*" element={<NoMatch />} />
      </Routes>
    </div>
  );
}

export default App;  