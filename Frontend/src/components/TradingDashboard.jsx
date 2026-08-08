import React, { useState } from 'react';
import TradeBlotter from './TradeBlotter';
import Positions from './Positions';
import PnL from './PnL';
import './Dashboard.css';

const TradingDashboard = () => {
    const [activeTab, setActiveTab] = useState('blotter');

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
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="logo">Trading Pro</div>
                <nav className="nav-menu">
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
            </aside>
            <main className="main-content">
                <header className="top-header">
                    <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} View</h2>
                    <div className="user-profile">User: Admin</div>
                </header>
                <div className="content-area">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default TradingDashboard;