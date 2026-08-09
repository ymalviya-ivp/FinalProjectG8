import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const PnL = () => {
    const [pnlData, setPnlData] = useState([]);
    
    // Filter Options
    const [securityOptions, setSecurityOptions] = useState([]);
    
    // Filter Values
    const DEFAULT_VALUATION_DATE = '2026-03-31';
    const [valuationDate, setValuationDate] = useState(DEFAULT_VALUATION_DATE);
    const [securityId, setSecurityId] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Calculate Summary Totals dynamically
    const totalRealized = pnlData.reduce((sum, item) => sum + (item.realizedPnl || 0), 0);
    const totalUnrealized = pnlData.reduce((sum, item) => sum + (item.unrealizedPnl || 0), 0);
    const netTotalPnL = pnlData.reduce((sum, item) => sum + (item.totalPnl || 0), 0);

    const fetchPnL = useCallback(async () => {
        if (!valuationDate) {
            setError('Please select a valuation date.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Added securityId to the API call
            const url = `https://localhost:7021/api/Pnl?valuationDate=${valuationDate}&securityId=${securityId}`;
            const response = await axios.get(url);
            setPnlData(response.data);
        } catch (err) {
            setError(err.message || 'Failed to fetch PnL data.');
            setPnlData([]);
        } finally {
            setLoading(false);
        }
    }, [valuationDate, securityId]);

    // Fetch Security dropdown options on mount
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const securityRes = await axios.get('https://localhost:7021/api/Securities/securityIds');
                setSecurityOptions(securityRes.data || []);
            } catch (err) {
                console.error("Failed to load filter options", err);
            }
        };

        fetchDropdownData();
    }, []);

    // Auto-fetch PnL whenever filters change
    useEffect(() => {
        fetchPnL();
    }, [fetchPnL]);

    const clearFilters = () => {
        setSecurityId('');
        setValuationDate(DEFAULT_VALUATION_DATE);
    };

    const formatCurrency = (value) => {
        const num = Number(value) || 0;
        const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(num));
        const colorClass = num >= 0 ? 'text-green' : 'text-red';
        return <span className={colorClass}>{num < 0 ? `-${formatted}` : formatted}</span>;
    };

    return (
        <div className="pnl-container">
            <div className="panel" style={{ marginBottom: '20px' }}>
                <div className="toolbar">
                    
                    {/* Security ID Dropdown */}
                    <div className="filter-group">
                        <label>Security</label>
                        <select 
                            className="enterprise-select"
                            value={securityId} 
                            onChange={(e) => setSecurityId(e.target.value)}
                        >
                            <option value="">-- All Securities --</option>
                            {securityOptions.map(sec => (
                                <option key={sec.securityId} value={sec.securityId}>
                                    {sec.securityId} - {sec.securityName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Valuation Date Filter */}
                    <div className="filter-group">
                        <label>Valuation Date</label>
                        <input 
                            type="date" 
                            className="enterprise-input" 
                            value={valuationDate} 
                            onChange={(e) => setValuationDate(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="button-group">
                        <button type="button" onClick={clearFilters} className="btn btn-secondary">Clear Filters</button>
                    </div>
                </div>
            </div>

            {error && <div className="alert-error" style={{marginTop: '20px'}}>{error}</div>}

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
                                        <td colSpan="5" className="text-center">No PnL data available.</td>
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