import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PnL = () => {
    const [pnlData, setPnlData] = useState([]);
    const [valuationDate, setValuationDate] = useState('2026-03-31');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Calculate Summary Totals dynamically from the payload
    const totalRealized = pnlData.reduce((sum, item) => sum + (item.realizedPnl || 0), 0);
    const totalUnrealized = pnlData.reduce((sum, item) => sum + (item.unrealizedPnl || 0), 0);
    const netTotalPnL = pnlData.reduce((sum, item) => sum + (item.totalPnl || 0), 0);

    const fetchPnL = async () => {
        if (!valuationDate) {
            setError('Please select a valuation date.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Hitting the real API endpoint with the valuationDate query parameter
            const response = await axios.get(`https://localhost:7021/api/Pnl?valuationDate=${valuationDate}`);
            setPnlData(response.data);
        } catch (err) {
            setError(err.message || 'Failed to fetch PnL data. Ensure the backend API is running.');
            setPnlData([]);
        } finally {
            setLoading(false);
        }
    };

    // Initial load when the component mounts
    useEffect(() => {
        fetchPnL();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle manual searches when the user changes the date
    const handleSearch = (e) => {
        e.preventDefault();
        fetchPnL();
    };

    // Helper to format currency and automatically apply red/green color classes
    const formatCurrency = (value) => {
        const num = Number(value) || 0;
        const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(num));
        const colorClass = num >= 0 ? 'text-green' : 'text-red';
        return <span className={colorClass}>{num < 0 ? `-${formatted}` : formatted}</span>;
    };

    return (
        <div className="pnl-container">
            {/* Toolbar with Valuation Date Filter */}
            <div className="panel" style={{ marginBottom: '20px' }}>
                <form onSubmit={handleSearch} className="toolbar">
                    <div className="filter-group">
                        <label>Valuation Date</label>
                        <input 
                            type="date" 
                            className="enterprise-select" 
                            value={valuationDate} 
                            onChange={(e) => setValuationDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="button-group">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Loading...' : 'Calculate PnL'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Top Summary Cards */}
            <div className="summary-cards">
                <div className="card">
                    <h4>Total Realized PnL</h4>
                    <div className="card-value">{formatCurrency(totalRealized)}</div>
                </div>
                <div className="card">
                    <h4>Total Unrealized PnL</h4>
                    <div className="card-value">{formatCurrency(totalUnrealized)}</div>
                </div>
                <div className="card highlight-card">
                    <h4>Net Total PnL</h4>
                    <div className="card-value">{formatCurrency(netTotalPnL)}</div>
                </div>
            </div>

            {error && <div className="alert-error" style={{marginTop: '20px'}}>{error}</div>}

            {/* PnL Data Table */}
            <div className="panel" style={{marginTop: '20px'}}>
                <div className="toolbar" style={{justifyContent: 'space-between'}}>
                    <h3>PnL by Asset</h3>
                </div>
                
                <div className="table-container">
                    {loading ? (
                        <div className="loading-spinner">Fetching PnL data...</div>
                    ) : (
                        <table className="enterprise-table">
                            <thead>
                                <tr>
                                    <th>Security ID</th>
                                    <th>Security Ticker</th>
                                    <th className="text-right">Realized PnL</th>
                                    <th className="text-right">Unrealized PnL</th>
                                    <th className="text-right">Total PnL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pnlData.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center">No PnL data available for this date.</td>
                                    </tr>
                                ) : (
                                    pnlData.map((item, index) => (
                                        <tr key={index}>
                                            <td style={{fontWeight: 'bold'}}>{item.securityId}</td>
                                            <td>{item.securityTicker}</td>
                                            <td className="text-right">{formatCurrency(item.realizedPnl)}</td>
                                            <td className="text-right">{formatCurrency(item.unrealizedPnl)}</td>
                                            <td className="text-right font-bold">{formatCurrency(item.totalPnl)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PnL;