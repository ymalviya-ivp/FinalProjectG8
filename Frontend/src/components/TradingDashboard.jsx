import React, { useState, useEffect } from 'react';
import TradeBlotter from './TradeBlotter';
import Positions from './Positions';
import PnL from './PnL';
import './Dashboard.css';

const TradingDashboard = () => {
    const [activeTab, setActiveTab] = useState('blotter');
    
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });

    useEffect(() => {
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'blotter':
                return <TradeBlotter />;
            case 'positions':
                return <Positions />;
            case 'pnl':
                return <PnL />;
            default:
                return <TradeBlotter />;
        }
    };

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
                        <button 
                            className={activeTab === 'blotter' ? 'active' : ''} 
                            onClick={() => setActiveTab('blotter')}
                        >
                            Trade Blotter
                        </button>
                        <button 
                            className={activeTab === 'positions' ? 'active' : ''} 
                            onClick={() => setActiveTab('positions')}
                        >
                            Positions
                        </button>
                        <button 
                            className={activeTab === 'pnl' ? 'active' : ''} 
                            onClick={() => setActiveTab('pnl')}
                        >
                            PnL & Risk
                        </button>
                    </nav>
                    
                    <div className="header-divider"></div>
                    
                    <button onClick={toggleTheme} className="theme-toggle-btn" title="Toggle Theme">
                        {theme === 'light' ? '☾' : '☀'}
                    </button>
                </div>
            </header>
            
            <main className="main-content">
                <div className="content-area">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default TradingDashboard;