import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const PnL = () => {
    const [pnlData, setPnlData] = useState([]);
    const [securityOptions, setSecurityOptions] = useState([]);
    
    const DEFAULT_VALUATION_DATE = '2026-03-31';
    const [valuationDate, setValuationDate] = useState(DEFAULT_VALUATION_DATE);
    const [securityId, setSecurityId] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPnL = useCallback(async () => {
        if (!valuationDate) {
            setError('Please select a valuation date.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
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

    useEffect(() => {
        fetchPnL();
    }, [fetchPnL]);

    const clearFilters = () => {
        setSecurityId('');
        setValuationDate(DEFAULT_VALUATION_DATE);
    };

    const formatCurrency = (value) => {
        const num = Number(value) || 0;
        const formatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Math.abs(num));
        const colorVar = num >= 0 ? 'var(--text-main)' : 'var(--danger-text)';
        
        return <span style={{ color: colorVar, fontWeight: '600' }}>
            {num < 0 ? `-${formatted}` : formatted}
        </span>;
    };

    return (
        <div className="pnl-container">
            <div className="panel" style={{ marginBottom: '24px' }}>
                <div className="toolbar">
                    <div className="filter-group">
                        <label>Security</label>
                        <select className="enterprise-select" value={securityId} onChange={(e) => setSecurityId(e.target.value)}>
                            <option value="">-- All Securities --</option>
                            {securityOptions.map(sec => (
                                <option key={sec.securityId} value={sec.securityId}>
                                    {sec.securityId} - {sec.securityName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Valuation Date</label>
                        <input type="date" className="enterprise-input" value={valuationDate} onChange={(e) => setValuationDate(e.target.value)} required />
                    </div>
                    
                    <div className="button-group">
                        <button type="button" onClick={clearFilters} className="btn btn-secondary">Clear Filters</button>
                    </div>
                </div>
            </div>

            {error && <div className="alert-error" style={{marginBottom: '24px'}}>{error}</div>}

            <div className="panel">
                <div className="table-container">
                    {loading ? (
                        <div className="text-center" style={{padding: '40px'}}>Fetching PnL data...</div>
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
                                            <td className="font-bold">{item.securityId}</td>
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