import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MIN_DATE = '2026-02-02';
const MAX_DATE = '2026-03-31';

const PnL = ({ theme }) => {
    const [viewMode, setViewMode] = useState('table');
    const [valuationDate, setValuationDate] = useState(MAX_DATE);
    const [securityId, setSecurityId] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        setCurrentPage(1);
    }, [valuationDate, securityId, pageSize]);

    const { data: securityOptions = [] } = useQuery({
        queryKey: ['securities'],
        queryFn: async () => (await axios.get('https://localhost:7021/api/Securities/securityIds')).data,
        staleTime: Infinity, 
    });

    const isInvalidDate = useMemo(() => {
        if (!valuationDate) return 'Please select a valuation date.';
        if (valuationDate < MIN_DATE || valuationDate > MAX_DATE) return `Data is only available between ${MIN_DATE} and ${MAX_DATE}.`;
        
        const [year, month, day] = valuationDate.split('-');
        const dateObj = new Date(year, month - 1, day);
        if (dateObj.getDay() === 0 || dateObj.getDay() === 6) return "It's a weekend so markets are closed. Please select a weekday.";
        return null;
    }, [valuationDate]);

    const { data: pnlData = [], isLoading, error: apiError } = useQuery({
        queryKey: ['pnl', valuationDate, securityId],
        queryFn: async () => {
            const url = `https://localhost:7021/api/Pnl?valuationDate=${valuationDate}&securityId=${securityId}`;
            return (await axios.get(url)).data;
        },
        enabled: !isInvalidDate, 
    });

    // Pagination Logic
    const totalPages = Math.ceil(pnlData.length / pageSize) || 1;
    const paginatedPnl = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return pnlData.slice(startIndex, startIndex + pageSize);
    }, [pnlData, currentPage, pageSize]);

    const { totalRealized, totalUnrealized, netTotalPnL } = useMemo(() => {
        return pnlData.reduce((acc, item) => {
            acc.totalRealized += (item.realizedPnl || 0);
            acc.totalUnrealized += (item.unrealizedPnl || 0);
            acc.netTotalPnL += (item.totalPnl || 0);
            return acc;
        }, { totalRealized: 0, totalUnrealized: 0, netTotalPnL: 0 });
    }, [pnlData]);

    const clearFilters = () => {
        setSecurityId('');
        setValuationDate(MAX_DATE);
        setCurrentPage(1);
    };

    const formatCurrency = (value) => {
        const num = Number(value) || 0;
        const formatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Math.abs(num));
        const colorVar = num >= 0 ? 'var(--text-main)' : 'var(--danger-text)';
        return <span style={{ color: colorVar, fontWeight: '600' }}>{num < 0 ? `-${formatted}` : formatted}</span>;
    };

    const chartData = useMemo(() => ({
        labels: pnlData.map(item => item.securityTicker || item.securityId),
        datasets: [
            { label: 'Realized PnL', data: pnlData.map(item => item.realizedPnl), backgroundColor: theme === 'dark' ? '#ffffff' : '#111111', borderRadius: 4 },
            { label: 'Unrealized PnL', data: pnlData.map(item => item.unrealizedPnl), backgroundColor: theme === 'dark' ? '#555555' : '#888888', borderRadius: 4 },
        ],
    }), [pnlData, theme]);

    const chartOptions = useMemo(() => ({
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { color: theme === 'dark' ? '#888888' : '#666666' } } },
        scales: {
            x: { grid: { display: false }, ticks: { color: theme === 'dark' ? '#888888' : '#666666' } },
            y: { grid: { color: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)' }, ticks: { color: theme === 'dark' ? '#888888' : '#666666' } }
        }
    }), [theme]);

    const displayError = isInvalidDate || (apiError ? apiError.message : null);

    return (
        <div className="pnl-container">
            <div className="panel" style={{ marginBottom: '24px' }}>
                <div className="toolbar">
                    <div className="filter-group">
                        <label>Security</label>
                        <select className="enterprise-select" value={securityId} onChange={(e) => setSecurityId(e.target.value)}>
                            <option value="">-- All Securities --</option>
                            {securityOptions.map(sec => <option key={sec.securityId} value={sec.securityId}>{sec.securityId} - {sec.securityName}</option>)}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Valuation Date</label>
                        <input type="date" className="enterprise-input" value={valuationDate} min={MIN_DATE} max={MAX_DATE} onChange={(e) => setValuationDate(e.target.value)} />
                    </div>
                    
                    <div className="button-group">
                        <button type="button" onClick={clearFilters} className="btn btn-secondary">Clear Filters</button>
                    </div>

                    <div className="view-toggle">
                        <button className={viewMode === 'table' ? 'active' : ''} onClick={() => setViewMode('table')}>Table</button>
                        <button className={viewMode === 'graph' ? 'active' : ''} onClick={() => setViewMode('graph')}>Graph</button>
                    </div>
                </div>
            </div>

            {displayError && <div className="alert-error" style={{marginBottom: '24px'}}>{displayError}</div>}

            {pnlData.length > 0 && !isLoading && (
                <div className="kpi-container">
                    <div className="kpi-pill">
                        <span className="kpi-label">Realized PnL</span>
                        <span className="kpi-value">{formatCurrency(totalRealized)}</span>
                    </div>
                    <div className="kpi-pill">
                        <span className="kpi-label">Unrealized PnL</span>
                        <span className="kpi-value">{formatCurrency(totalUnrealized)}</span>
                    </div>
                    <div className="kpi-pill">
                        <span className="kpi-label">Net PnL</span>
                        <span className="kpi-value">{formatCurrency(netTotalPnL)}</span>
                    </div>
                </div>
            )}

            <div className="panel">
                {isLoading ? (
                    <div className="text-center" style={{padding: '40px'}}>Fetching PnL data...</div>
                ) : pnlData.length === 0 && !displayError ? (
                    <div className="text-center" style={{padding: '40px'}}>No PnL data available.</div>
                ) : viewMode === 'table' && pnlData.length > 0 ? (
                    <div className="table-container">
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
                                {paginatedPnl.map((item, index) => (
                                    <tr key={index}>
                                        <td className="font-bold">{item.securityId}</td>
                                        <td>{item.securityTicker}</td>
                                        <td className="text-right">{formatCurrency(item.realizedPnl)}</td>
                                        <td className="text-right">{formatCurrency(item.unrealizedPnl)}</td>
                                        <td className="text-right font-bold">{formatCurrency(item.totalPnl)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderTop: '1px solid var(--grid-color)' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Rows per page:</span>
                                <select className="enterprise-select" style={{ width: '70px', padding: '4px' }} value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                                    <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                    Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, pnlData.length)} of {pnlData.length}
                                </span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn btn-secondary" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
                                    <button className="btn btn-secondary" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
                                </div>
                            </div>
                        </div>

                    </div>
                ) : pnlData.length > 0 ? (
                    <div style={{ height: '400px', position: 'relative', width: '100%' }}>
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default PnL;