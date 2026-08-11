// components/TradingDashboard.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Dashboard.css';

const TradingDashboard = ({ theme, toggleTheme }) => {
    return (
        <header className="top-header">
            <div className="header-left">
                <div className="logo-container">
                    <span className="logo-main">Vantage</span>
                    <span className="logo-sub">Capital Markets</span>
                </div>
            </div>
            
            <div className="header-right">
                <nav className="top-nav">
                    <NavLink 
                        to="/blotter" 
                        className={({ isActive }) => isActive ? 'active' : ''}
                    >
                        Trade Blotter
                    </NavLink>
                    <NavLink 
                        to="/positions" 
                        className={({ isActive }) => isActive ? 'active' : ''}
                    >
                        Positions
                    </NavLink>
                    <NavLink 
                        to="/pnl" 
                        className={({ isActive }) => isActive ? 'active' : ''}
                    >
                        PnL & Risk
                    </NavLink>
                </nav>
                
                <div className="header-divider"></div>
                
                <button onClick={toggleTheme} className="theme-toggle-btn" title="Toggle Theme">
                    {theme === 'light' ? '☾' : '☀'}
                </button>
            </div>
        </header>
    );
};

export default TradingDashboard;