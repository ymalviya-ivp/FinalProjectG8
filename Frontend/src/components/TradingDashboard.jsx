import React, { useState, useEffect, Suspense } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom'; // Import router hooks
import './Dashboard.css';

const TradingDashboard = () => {
    const location = useLocation(); // Used to highlight the active tab
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    useEffect(() => {
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    return (
        <div className="dashboard-layout" data-theme={theme}>
            <header className="top-header">
                <div className="header-left">
                    <div className="logo-container">
                        <span className="logo-main">Vantage</span>
                        <span className="logo-sub">Capital Markets</span>
                    </div>
                </div>
                
                <div className="header-right">
                    <nav className="top-nav">
                        {/* Replace state buttons with React Router Links */}
                        <Link 
                            to="/trades-blotter" 
                            className={location.pathname === '/trades-blotter' ? 'active' : ''}
                        >
                            Trade Blotter
                        </Link>
                        <Link 
                            to="/positions" 
                            className={location.pathname === '/positions' ? 'active' : ''}
                        >
                            Positions
                        </Link>
                        <Link 
                            to="/pnl" 
                            className={location.pathname === '/pnl' ? 'active' : ''}
                        >
                            PnL & Risk
                        </Link>
                    </nav>
                    
                    <div className="header-divider"></div>
                    
                    <button onClick={toggleTheme} className="theme-toggle-btn" title="Toggle Theme">
                        {theme === 'light' ? '☾' : '☀'}
                    </button>
                </div>
            </header>
            
            <main className="main-content">
                <div className="content-area">
                    {/* Suspense handles the lazy-loaded route components */}
                    <Suspense fallback={<div className="text-center" style={{padding: '40px'}}>Loading module...</div>}>
                        {/* Outlet renders whatever component matches the current URL */}
                        <Outlet context={{ theme }} /> 
                    </Suspense>
                </div>
            </main>
        </div>
    );
};

export default TradingDashboard;