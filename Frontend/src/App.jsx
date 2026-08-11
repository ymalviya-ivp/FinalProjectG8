// App.jsx
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TradingDashboard from './components/TradingDashboard';
import TradeBlotter from './components/TradeBlotter';
import NoMatch from './components/NoMatch'
import './App.css';

// 1. Lazy-load heavy chart components
const Positions = lazy(() => import('./components/Positions'));
const PnL = lazy(() => import('./components/PnL'));

function App() {
    // 2. Lift theme state so both Header and Routes share the active theme
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });

    useEffect(() => {
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <div className="dashboard-layout" data-theme={theme}>
            {/* Top Navigation Header */}
            <TradingDashboard theme={theme} toggleTheme={toggleTheme} />

            {/* Main Content Area */}
            <main className="main-content">
                <div className="content-area">
                    <Suspense fallback={<div className="text-center" style={{ padding: '40px' }}>Loading module...</div>}>
                        <Routes>
                            <Route path="/" element={<Navigate to="/blotter" replace />} />
                            <Route path="/blotter" element={<TradeBlotter theme={theme} />} />
                            <Route path="/positions" element={<Positions theme={theme} />} />
                            <Route path="/pnl" element={<PnL theme={theme} />} />
                            <Route path="*" element={<NoMatch />} />
                        </Routes>
                    </Suspense>
                </div>
            </main>
        </div>
    );
}

export default App;