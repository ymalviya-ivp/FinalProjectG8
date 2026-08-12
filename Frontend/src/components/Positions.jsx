import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MIN_DATE = '2026-02-02';
const MAX_DATE = '2026-03-31';

const Positions = ({ theme }) => {
    const [viewMode, setViewMode] = useState('table');
    const [asOfDate, setAsOfDate] = useState(MAX_DATE);
    const [securityId, setSecurityId] = useState('');
    const [assetClass, setAssetClass] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        setCurrentPage(1);
    }, [asOfDate, securityId, assetClass, pageSize]);

    const { data: securityOptions = [] } = useQuery({
        queryKey: ['securities'],
        queryFn: async () => (await axios.get(`${import.meta.env.VITE_DOTNET_API_URL}/Securities/securityIds`)).data,
        staleTime: Infinity,
    });

    const { data: assetClassOptions = [] } = useQuery({
        queryKey: ['assetClasses'],
        queryFn: async () => (await axios.get(`${import.meta.env.VITE_DOTNET_API_URL}/Securities/assetClasses`)).data,
        staleTime: Infinity,
    });

    // 1. HARD ERRORS (Blocks API call)
    const isInvalidDate = useMemo(() => {
        if (!asOfDate) return 'Please select an As Of Date.';
        if (asOfDate < MIN_DATE || asOfDate > MAX_DATE) return `Data is only available between ${MIN_DATE} and ${MAX_DATE}.`;
        return null;
    }, [asOfDate]);

    // 2. WARNINGS (Does NOT block API call, just shows a message)
    const weekendWarning = useMemo(() => {
        if (!asOfDate) return null;
        const [year, month, day] = asOfDate.split('-');
        const dateObj = new Date(year, month - 1, day);
        if (dateObj.getDay() === 0 || dateObj.getDay() === 6) {
            return "Note: It's a weekend, so market prices reflect the last available EOD price (Friday).";
        }
        return null;
    }, [asOfDate]);

    const { data: positionsData = [], isLoading, error: apiError } = useQuery({
        queryKey: ['positions', asOfDate, securityId, assetClass],
        queryFn: async () => {
            const url = `${import.meta.env.VITE_DOTNET_API_URL}/PositionsTable/positions?AsOfDate=${asOfDate}&securityId=${securityId}&assetClass=${assetClass}`;
            return (await axios.get(url)).data;
        },
        enabled: !isInvalidDate,
    });

    // React Query: Python Risk Engine (VaR)
    const { data: riskData, isLoading: isRiskLoading } = useQuery({
        queryKey: ['riskVaR', positionsData],
        queryFn: async () => {
            if (!positionsData || positionsData.length === 0) return null;
            
            const response = await axios.post(`${import.meta.env.VITE_PYTHON_RISK_API_URL}/risk/var`, {
                asOfDate: asOfDate,
                positions: positionsData.map(p => ({
                    securityId: p.securityId,
                    netQuantity: p.netQuantity,
                    averageCost: p.averageCost
                }))
            });
            return response.data;
        },
        enabled: positionsData.length > 0,
    });

    // Pagination Logic
    const totalPages = Math.ceil(positionsData.length / pageSize) || 1;
    const paginatedPositions = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return positionsData.slice(startIndex, startIndex + pageSize);
    }, [positionsData, currentPage, pageSize]);

    const clearFilters = () => {
        setSecurityId('');
        setAssetClass('');
        setAsOfDate(MAX_DATE);
        setCurrentPage(1);
    };

    const formatCurrency = (value) => {
        const num = Number(value) || 0;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(num);
    };

    // Helper: Asset Class Badges Color Coding
    const renderAssetBadge = (type) => {
        const normalized = (type || '').toLowerCase();
        if (normalized.includes('equity')) return <span className="asset-tag tag-equity">Equity</span>;
        if (normalized.includes('bond')) return <span className="asset-tag tag-bond">Bond</span>;
        if (normalized.includes('etf')) return <span className="asset-tag tag-etf">ETF</span>;
        return <span className="asset-tag">{type}</span>;
    };

    // Chart Data with Asset-based Colors
    const chartData = useMemo(() => {
        const getColorByAsset = (ac) => {
            const norm = (ac || '').toLowerCase();
            if (norm.includes('equity')) return '#3b82f6';
            if (norm.includes('bond')) return '#f59e0b';
            if (norm.includes('etf')) return '#8b5cf6';
            return '#64748b';
        };

        return {
            labels: positionsData.map(item => item.securityId),
            datasets: [
                { 
                    label: 'Average Cost (₹)', 
                    data: positionsData.map(item => item.averageCost), 
                    backgroundColor: positionsData.map(item => getColorByAsset(item.assetClass)),
                    borderRadius: 6 
                },
            ],
        };
    }, [positionsData]);

    const chartOptions = useMemo(() => ({
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { color: theme === 'dark' ? '#94a3b8' : '#64748b' } } },
        scales: {
            x: { grid: { display: false }, ticks: { color: theme === 'dark' ? '#94a3b8' : '#64748b' } },
            y: { grid: { color: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)' }, ticks: { color: theme === 'dark' ? '#94a3b8' : '#64748b' } }
        }
    }), [theme]);

    const displayError = isInvalidDate || (apiError ? apiError.message : null);

    return (
        <div className="positions-container">
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
                        <label>Asset Class</label>
                        <select className="enterprise-select" value={assetClass} onChange={(e) => setAssetClass(e.target.value)}>
                            <option value="">-- All Asset Classes --</option>
                            {assetClassOptions.map(ac => <option key={ac} value={ac}>{ac}</option>)}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>As Of Date</label>
                        <input type="date" className="enterprise-input" value={asOfDate} min={MIN_DATE} max={MAX_DATE} onChange={(e) => setAsOfDate(e.target.value)} />
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

            {/* PYTHON RISK ENGINE KPI CARDS */}
            {riskData && !isRiskLoading && !displayError && (
                <div className="kpi-container" style={{ marginBottom: '24px' }}>
                    <div className="kpi-pill kpi-border-blue">
                        <span className="kpi-label">Portfolio Value</span>
                        <span className="kpi-value text-blue">{formatCurrency(riskData.totalPortfolioValue)}</span>
                    </div>
                    <div className="kpi-pill kpi-border-amber">
                        <span className="kpi-label" title="95% confidence max daily loss">1-Day VaR (95%)</span>
                        <span className="kpi-value text-amber">
                            {formatCurrency(riskData.var95)}
                        </span>
                    </div>
                    <div className="kpi-pill kpi-border-red">
                        <span className="kpi-label" title="99% confidence worst-case daily loss">1-Day VaR (99%)</span>
                        <span className="kpi-value text-red">
                            {formatCurrency(riskData.var99)}
                        </span>
                    </div>
                </div>
            )}

            {/* Table or Graph Content */}
            <div className="panel">
                {isLoading ? (
                    <div className="text-center" style={{padding: '40px'}}>Fetching positions data...</div>
                ) : positionsData.length === 0 && !displayError ? (
                    <div className="text-center" style={{padding: '40px'}}>No positions found for this date/filter.</div>
                ) : viewMode === 'table' && positionsData.length > 0 ? (
                    <div className="table-container">
                        <table className="enterprise-table">
                            <thead>
                                <tr>
                                    <th>Security ID</th>
                                    <th>Security Name</th>
                                    <th>Asset Class</th>
                                    <th className="text-right">Net Quantity</th>
                                    <th className="text-right">Average Cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedPositions.map((item, index) => (
                                    <tr key={index}>
                                        <td className="font-bold">{item.securityId}</td>
                                        <td>{item.securityName}</td>
                                        <td>{renderAssetBadge(item.assetClass)}</td>
                                        <td className="text-right font-bold" style={{ color: item.netQuantity < 0 ? '#ef4444' : 'inherit' }}>
                                            {item.netQuantity.toLocaleString()}
                                        </td>
                                        <td className="text-right font-bold">{formatCurrency(item.averageCost)}</td>
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
                                    Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, positionsData.length)} of {positionsData.length}
                                </span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn btn-secondary" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
                                    <button className="btn btn-secondary" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
                                </div>
                            </div>
                        </div>

                    </div>
                ) : positionsData.length > 0 ? (
                    <div style={{ height: '400px', position: 'relative', width: '100%' }}>
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default Positions;