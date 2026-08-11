import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const MIN_DATE = '2026-02-02';
const MAX_DATE = '2026-03-31';

const TradeBlotter = () => {
    const [securityId, setSecurityId] = useState('');
    const [traderId, setTraderId] = useState('');
    const [fromDate, setFromDate] = useState(MIN_DATE);
    const [toDate, setToDate] = useState(MAX_DATE);
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Reset to page 1 whenever filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [securityId, traderId, fromDate, toDate, pageSize]);

    // React Query: Dropdowns
    const { data: securityOptions = [] } = useQuery({
        queryKey: ['blotterSecurityIds'],
        queryFn: async () => (await axios.get('https://localhost:7021/api/trades/securityIds')).data,
        staleTime: Infinity,
    });

    const { data: traderOptions = [] } = useQuery({
        queryKey: ['traderIds'],
        queryFn: async () => (await axios.get('https://localhost:7021/api/trades/traderIds')).data,
        staleTime: Infinity,
    });

    const isInvalidDateRange = useMemo(() => {
        if (fromDate < MIN_DATE || fromDate > MAX_DATE || toDate < MIN_DATE || toDate > MAX_DATE) {
            return `Trades are only available between ${MIN_DATE} and ${MAX_DATE}.`;
        }
        if (fromDate > toDate) return 'From Date cannot be after To Date.';
        return null;
    }, [fromDate, toDate]);

    // React Query: Trades Data
    const { data: trades = [], isLoading, error: apiError } = useQuery({
        queryKey: ['trades', securityId, traderId, fromDate, toDate],
        queryFn: async ({ signal }) => {
            const url = `https://localhost:7021/api/Trades?securityId=${securityId}&traderId=${traderId}&fromDate=${fromDate}&toDate=${toDate}`;
            return (await axios.get(url, { signal })).data; 
        },
        enabled: !isInvalidDateRange,
    });

    // Pagination Logic: Slice the data for the current page
    const totalPages = Math.ceil(trades.length / pageSize) || 1;
    const paginatedTrades = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return trades.slice(startIndex, startIndex + pageSize);
    }, [trades, currentPage, pageSize]);

    const clearFilters = () => {
        setSecurityId('');
        setTraderId('');
        setFromDate(MIN_DATE);
        setToDate(MAX_DATE);
        setCurrentPage(1);
    };

    const displayError = isInvalidDateRange || (apiError ? apiError.message : null);

    return (
        <div className="panel">
            <div className="toolbar">
                <div className="filter-group">
                    <label>Trader</label>
                    <select className="enterprise-select" value={traderId} onChange={(e) => setTraderId(e.target.value)}>
                        <option value="">-- All Traders --</option>
                        {traderOptions.map(trader => (
                            <option key={trader.traderId} value={trader.traderId}>{trader.traderId} - {trader.traderName}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Security ID</label>
                    <select className="enterprise-select" value={securityId} onChange={(e) => setSecurityId(e.target.value)}>
                        <option value="">-- All Securities --</option>
                        {securityOptions.map(id => <option key={id} value={id}>{id}</option>)}
                    </select>
                </div>
                
                <div className="filter-group">
                    <label>From Date</label>
                    <input type="date" className="enterprise-input" value={fromDate} min={MIN_DATE} max={MAX_DATE} onChange={(e) => setFromDate(e.target.value)} />
                </div>

                <div className="filter-group">
                    <label>To Date</label>
                    <input type="date" className="enterprise-input" value={toDate} min={MIN_DATE} max={MAX_DATE} onChange={(e) => setToDate(e.target.value)} />
                </div>
                
                <div className="button-group">
                    <button type="button" onClick={clearFilters} className="btn btn-secondary">Clear Filters</button>
                </div>
            </div>

            {displayError && <div className="alert-error">{displayError}</div>}
            
            <div className="table-container">
                {isLoading ? (
                    <div className="text-center" style={{padding: '40px'}}>Loading trades...</div>
                ) : (
                    <>
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
                                {paginatedTrades.length === 0 && !displayError ? (
                                    <tr><td colSpan="7" className="text-center">No trades found.</td></tr>
                                ) : (
                                    paginatedTrades.map(trade => (
                                        <tr key={trade.tradeId} className={trade.buySell === 'BUY' ? 'row-buy' : 'row-sell'}>
                                            <td className="font-bold">{trade.tradeId}</td>
                                            <td>{new Date(trade.tradeDate).toLocaleDateString()}</td>
                                            <td>{trade.traderId}</td>
                                            <td>{trade.securityId}</td>
                                            <td>
                                                <span className={`badge ${trade.buySell === 'BUY' ? 'badge-buy' : 'badge-sell'}`}>
                                                    {trade.buySell}
                                                </span>
                                            </td>
                                            <td className="text-right font-bold">{trade.quantity.toLocaleString()}</td>
                                            <td className="text-right">₹{trade.price.toFixed(2)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        
                        {/* Pagination Controls */}
                        {trades.length > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderTop: '1px solid var(--grid-color)' }}>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Rows per page:</span>
                                    <select 
                                        className="enterprise-select" 
                                        style={{ width: '70px', padding: '4px' }}
                                        value={pageSize} 
                                        onChange={(e) => setPageSize(Number(e.target.value))}
                                    >
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                        Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, trades.length)} of {trades.length}
                                    </span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button 
                                            className="btn btn-secondary" 
                                            disabled={currentPage === 1} 
                                            onClick={() => setCurrentPage(p => p - 1)}
                                        >
                                            Prev
                                        </button>
                                        <button 
                                            className="btn btn-secondary" 
                                            disabled={currentPage === totalPages} 
                                            onClick={() => setCurrentPage(p => p + 1)}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default TradeBlotter;