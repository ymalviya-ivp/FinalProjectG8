import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const TradeBlotter = () => {
    const [trades, setTrades] = useState([]);
    
    const [securityOptions, setSecurityOptions] = useState([]);
    const [traderOptions, setTraderOptions] = useState([]);
    
    const [securityId, setSecurityId] = useState('');
    const [traderId, setTraderId] = useState('');
    
    const DEFAULT_FROM_DATE = '2026-02-02';
    const DEFAULT_TO_DATE = '2026-03-31';
    const [fromDate, setFromDate] = useState(DEFAULT_FROM_DATE);
    const [toDate, setToDate] = useState(DEFAULT_TO_DATE);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTrades = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const url = `https://localhost:7021/api/Trades?securityId=${securityId}&traderId=${traderId}&fromDate=${fromDate}&toDate=${toDate}`;
            const response = await axios.get(url);
            setTrades(response.data);
        } catch (err) {
            setError(err.message || 'Failed to fetch trades.');
        } finally {
            setLoading(false);
        }
    }, [securityId, traderId, fromDate, toDate]);

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [securityRes, traderRes] = await Promise.all([
                    axios.get('https://localhost:7021/api/trades/securityIds'),
                    axios.get('https://localhost:7021/api/trades/traderIds')
                ]);
                
                setSecurityOptions(securityRes.data || []);
                setTraderOptions(traderRes.data || []);
            } catch (err) {
                console.error(err);
            }
        };

        fetchDropdownData();
    }, []);

    useEffect(() => {
        fetchTrades();
    }, [fetchTrades]);

    const clearFilters = () => {
        setSecurityId('');
        setTraderId('');
        setFromDate(DEFAULT_FROM_DATE);
        setToDate(DEFAULT_TO_DATE);
    };

    return (
        <div className="panel">
            <div className="toolbar">
                <div className="filter-group">
                    <label>Trader</label>
                    <select 
                        className="enterprise-select"
                        value={traderId} 
                        onChange={(e) => setTraderId(e.target.value)}
                    >
                        <option value="">-- All Traders --</option>
                        {traderOptions.map(trader => (
                            <option key={trader.traderId} value={trader.traderId}>
                                {trader.traderId} - {trader.traderName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Security ID</label>
                    <select 
                        className="enterprise-select"
                        value={securityId} 
                        onChange={(e) => setSecurityId(e.target.value)}
                    >
                        <option value="">-- All Securities --</option>
                        {securityOptions.map(id => (
                            <option key={id} value={id}>{id}</option>
                        ))}
                    </select>
                </div>
                
                <div className="filter-group">
                    <label>From Date</label>
                    <input 
                        type="date" 
                        className="enterprise-input"
                        value={fromDate} 
                        onChange={(e) => setFromDate(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <label>To Date</label>
                    <input 
                        type="date" 
                        className="enterprise-input"
                        value={toDate} 
                        onChange={(e) => setToDate(e.target.value)}
                    />
                </div>
                
                <div className="button-group">
                    <button type="button" onClick={clearFilters} className="btn btn-secondary">Clear Filters</button>
                </div>
            </div>

            {error && <div className="alert-error">{error}</div>}
            
            <div className="table-container">
                {loading ? (
                    <div className="loading-spinner">Loading trades...</div>
                ) : (
                    <table className="enterprise-table">
                        <thead>
                            <tr>
                                <th>Trade ID</th>
                                <th>Trade Date</th>
                                <th>Trader ID</th>
                                <th>Security ID</th>
                                <th>Type</th>
                                <th className="text-right">Quantity</th>
                                <th className="text-right">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trades.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center">No trades found.</td>
                                </tr>
                            ) : (
                                trades.map(trade => (
                                    <tr key={trade.tradeId}>
                                        <td>{trade.tradeId}</td>
                                        <td>{new Date(trade.tradeDate).toLocaleDateString()}</td>
                                        <td>{trade.traderId}</td>
                                        <td>{trade.securityId}</td>
                                        <td>
                                            <span className={`badge ${trade.buySell === 'BUY' ? 'badge-buy' : 'badge-sell'}`}>
                                                {trade.buySell}
                                            </span>
                                        </td>
                                        <td className="text-right">{trade.quantity.toLocaleString()}</td>
                                        <td className="text-right">${trade.price.toFixed(2)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default TradeBlotter;