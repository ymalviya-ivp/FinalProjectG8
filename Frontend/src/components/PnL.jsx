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
        queryFn: async () => (await axios.get(`${import.meta.env.VITE_DOTNET_API_URL}/Securities/securityIds`)).data,
        staleTime: Infinity, 
    });

    // 1. HARD ERRORS (Blocks API call)
    const isInvalidDate = useMemo(() => {
        if (!valuationDate) return 'Please select a valuation date.';
        if (valuationDate < MIN_DATE || valuationDate > MAX_DATE) return `Data is only available between ${MIN_DATE} and ${MAX_DATE}.`;
        return null;
    }, [valuationDate]);

    // 2. WARNINGS (Does NOT block API call, just shows a message)
    const weekendWarning = useMemo(() => {
        if (!valuationDate) return null;
        const [year, month, day] = valuationDate.split('-');
        const dateObj = new Date(year, month - 1, day);
        if (dateObj.getDay() === 0 || dateObj.getDay() === 6) {
            return "Note: It's a weekend, so market prices reflect the last available EOD price (Friday).";
        }
        return null;
    }, [valuationDate]);

    const { data: pnlData = [], isLoading, error: apiError } = useQuery({
        queryKey: ['pnl', valuationDate, securityId],
        queryFn: async () => {
            const url = `${import.meta.env.VITE_DOTNET_API_URL}/Pnl?valuationDate=${valuationDate}&securityId=${securityId}`;
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

    // Helper: Dynamic Color Formatting for Financial Numbers
    const formatCurrency = (value) => {
        const num = Number(value) || 0;
        const formatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Math.abs(num));
        const colorClass = num > 0 ? 'text-positive' : num < 0 ? 'text-negative' : 'text-neutral';

        return (
            <span className={`pnl-val ${colorClass}`}>
                {num < 0 ? `-${formatted}` : formatted}
            </span>
        );
    };

    // Helper: Asset Class Badges
    const renderAssetBadge = (id) => {
        if (!id) return null;
        if (id.startsWith('EQ')) return <span className="asset-tag tag-equity">Equity</span>;
        if (id.startsWith('BD')) return <span className="asset-tag tag-bond">Bond</span>;
        if (id.startsWith('ET')) return <span className="asset-tag tag-etf">ETF</span>;
        return null;
    };

    const chartData = useMemo(() => ({
        labels: pnlData.map(item => item.securityTicker || item.securityId),
        datasets: [
            { 
                label: 'Realized PnL', 
                data: pnlData.map(item => item.realizedPnl), 
                backgroundColor: '#10b981', 
                borderRadius: 6 
            },
            { 
                label: 'Unrealized PnL', 
                data: pnlData.map(item => item.unrealizedPnl), 
                backgroundColor: '#3b82f6', 
                borderRadius: 6 
            },
        ],
    }), [pnlData]);

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
            {/* Filter Toolbar */}
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

            {/* HARD ERRORS */}
            {displayError && <div className="alert-error" style={{marginBottom: '24px'}}>{displayError}</div>}

            {/* WEEKEND WARNING BANNER */}
            {weekendWarning && !displayError && (
                <div className="alert-warning" style={{
                    marginBottom: '24px', 
                    padding: '12px 16px', 
                    backgroundColor: theme === 'dark' ? 'rgba(245, 158, 11, 0.1)' : '#fef3c7', 
                    color: theme === 'dark' ? '#fbbf24' : '#92400e', 
                    borderLeft: '4px solid #f59e0b',
                    borderRadius: '4px',
                    fontSize: '14px'
                }}>
                    {weekendWarning}
                </div>
            )}

            {/* KPI Summary Cards */}
            {pnlData.length > 0 && !isLoading && (
                <div className="kpi-container">
                    <div className={`kpi-pill ${totalRealized >= 0 ? 'kpi-border-positive' : 'kpi-border-negative'}`}>
                        <span className="kpi-label">Realized PnL</span>
                        <span className="kpi-value">{formatCurrency(totalRealized)}</span>
                    </div>
                    <div className={`kpi-pill ${totalUnrealized >= 0 ? 'kpi-border-positive' : 'kpi-border-negative'}`}>
                        <span className="kpi-label">Unrealized PnL</span>
                        <span className="kpi-value">{formatCurrency(totalUnrealized)}</span>
                    </div>
                    <div className={`kpi-pill ${netTotalPnL >= 0 ? 'kpi-border-positive' : 'kpi-border-negative'}`}>
                        <span className="kpi-label">Net PnL</span>
                        <span className="kpi-value">{formatCurrency(netTotalPnL)}</span>
                    </div>
                </div>
            )}

            {/* Table View */}
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
                                    <th>Asset Type</th>
                                    <th className="text-right">Realized PnL</th>
                                    <th className="text-right">Unrealized PnL</th>
                                    <th className="text-right">Total PnL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedPnl.map((item, index) => (
                                    <tr key={index} className={item.totalPnl >= 0 ? 'row-profit' : 'row-loss'}>
                                        <td className="font-bold">{item.securityId}</td>
                                        <td>{item.securityTicker}</td>
                                        <td>{renderAssetBadge(item.securityId)}</td>
                                        <td className="text-right">{formatCurrency(item.realizedPnl)}</td>
                                        <td className="text-right">{formatCurrency(item.unrealizedPnl)}</td>
                                        <td className="text-right font-bold">{formatCurrency(item.totalPnl)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderTop: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Rows per page:</span>
                                <select className="enterprise-select" style={{ width: '70px', padding: '4px' }} value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
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