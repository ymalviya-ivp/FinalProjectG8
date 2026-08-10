import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PnL = ({ theme }) => {
    const [pnlData, setPnlData] = useState([]);
    const [securityOptions, setSecurityOptions] = useState([]);
    const [viewMode, setViewMode] = useState('table');
    
    const MIN_DATE = '2026-02-02';
    const MAX_DATE = '2026-03-31';
    
    const [valuationDate, setValuationDate] = useState(MAX_DATE);
    const [securityId, setSecurityId] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const totalRealized = pnlData.reduce((sum, item) => sum + (item.realizedPnl || 0), 0);
    const totalUnrealized = pnlData.reduce((sum, item) => sum + (item.unrealizedPnl || 0), 0);
    const netTotalPnL = pnlData.reduce((sum, item) => sum + (item.totalPnl || 0), 0);

    const fetchPnL = useCallback(async () => {
        if (!valuationDate) {
            setError('Please select a valuation date.');
            return;
        }

        // --- DATE RANGE VALIDATION ---
        if (valuationDate < MIN_DATE || valuationDate > MAX_DATE) {
            setError(`Data is only available between ${MIN_DATE} and ${MAX_DATE}.`);
            setPnlData([]);
            return;
        }

        // --- WEEKEND VALIDATION ---
        const [year, month, day] = valuationDate.split('-');
        const dateObj = new Date(year, month - 1, day);
        const dayOfWeek = dateObj.getDay();
        
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            setError("It's a weekend so markets are closed. Please select a weekday.");
            setPnlData([]);
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
        setValuationDate(MAX_DATE);
    };

    const formatCurrency = (value) => {
        const num = Number(value) || 0;
        const formatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Math.abs(num));
        const colorVar = num >= 0 ? 'var(--text-main)' : 'var(--danger-text)';
        return <span style={{ color: colorVar, fontWeight: '600' }}>{num < 0 ? `-${formatted}` : formatted}</span>;
    };

    const primaryBarColor = theme === 'dark' ? '#ffffff' : '#111111';
    const secondaryBarColor = theme === 'dark' ? '#555555' : '#888888';
    const axisTextColor = theme === 'dark' ? '#888888' : '#666666';
    const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

    const chartData = {
        labels: pnlData.map(item => item.securityTicker || item.securityId),
        datasets: [
            {
                label: 'Realized PnL',
                data: pnlData.map(item => item.realizedPnl),
                backgroundColor: primaryBarColor,
                borderRadius: 4,
            },
            {
                label: 'Unrealized PnL',
                data: pnlData.map(item => item.unrealizedPnl),
                backgroundColor: secondaryBarColor,
                borderRadius: 4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { font: { family: 'Inter', size: 12 }, boxWidth: 14, color: axisTextColor } },
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: axisTextColor } },
            y: { grid: { color: gridColor }, ticks: { color: axisTextColor } }
        }
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
                        <input 
                            type="date" 
                            className="enterprise-input" 
                            value={valuationDate} 
                            min={MIN_DATE}
                            max={MAX_DATE}
                            onChange={(e) => setValuationDate(e.target.value)} 
                            required 
                        />
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

            {error && <div className="alert-error" style={{marginBottom: '24px'}}>{error}</div>}

            {pnlData.length > 0 && !loading && (
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
                {loading ? (
                    <div className="text-center" style={{padding: '40px'}}>Fetching PnL data...</div>
                ) : pnlData.length === 0 && !error ? (
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
                                {pnlData.map((item, index) => (
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