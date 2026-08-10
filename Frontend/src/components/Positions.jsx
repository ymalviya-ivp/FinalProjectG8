import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Positions = ({ theme }) => {
    const [positionsData, setPositionsData] = useState([]);
    const [securityOptions, setSecurityOptions] = useState([]);
    const [assetClassOptions, setAssetClassOptions] = useState([]);
    const [viewMode, setViewMode] = useState('table');
    
    const MIN_DATE = '2026-02-02';
    const MAX_DATE = '2026-03-31';
    
    const [asOfDate, setAsOfDate] = useState(MAX_DATE);
    const [securityId, setSecurityId] = useState('');
    const [assetClass, setAssetClass] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPositions = useCallback(async () => {
        if (!asOfDate) {
            setError('Please select an As Of Date.');
            return;
        }

        // --- DATE RANGE VALIDATION ---
        if (asOfDate < MIN_DATE || asOfDate > MAX_DATE) {
            setError(`Data is only available between ${MIN_DATE} and ${MAX_DATE}.`);
            setPositionsData([]);
            return;
        }

        // --- WEEKEND VALIDATION ---
        const [year, month, day] = asOfDate.split('-');
        const dateObj = new Date(year, month - 1, day);
        const dayOfWeek = dateObj.getDay();
        
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            setError("It's a weekend so markets are closed. Please select a weekday.");
            setPositionsData([]);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const url = `https://localhost:7021/api/PositionsTable/positions?AsOfDate=${asOfDate}&securityId=${securityId}&assetClass=${assetClass}`;
            const response = await axios.get(url);
            setPositionsData(response.data);
        } catch (err) {
            setError(err.message || 'Failed to fetch Positions data.');
            setPositionsData([]);
        } finally {
            setLoading(false);
        }
    }, [asOfDate, securityId, assetClass]);

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [securityRes, assetClassRes] = await Promise.all([
                    axios.get('https://localhost:7021/api/Securities/securityIds'),
                    axios.get('https://localhost:7021/api/Securities/assetClasses')
                ]);
                setSecurityOptions(securityRes.data || []);
                setAssetClassOptions(assetClassRes.data || []);
            } catch (err) {
                console.error("Failed to load filter options", err);
            }
        };
        fetchDropdownData();
    }, []);

    useEffect(() => {
        fetchPositions();
    }, [fetchPositions]);

    const clearFilters = () => {
        setSecurityId('');
        setAssetClass('');
        setAsOfDate(MAX_DATE);
    };

    const formatCurrency = (value) => {
        const num = Number(value) || 0;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(num);
    };

    const primaryBarColor = theme === 'dark' ? '#ffffff' : '#111111';
    const axisTextColor = theme === 'dark' ? '#888888' : '#666666';
    const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

    const chartData = {
        labels: positionsData.map(item => item.securityId),
        datasets: [
            {
                label: 'Average Cost (₹)',
                data: positionsData.map(item => item.averageCost),
                backgroundColor: primaryBarColor,
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
        <div className="positions-container">
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
                        <label>Asset Class</label>
                        <select className="enterprise-select" value={assetClass} onChange={(e) => setAssetClass(e.target.value)}>
                            <option value="">-- All Asset Classes --</option>
                            {assetClassOptions.map(ac => (
                                <option key={ac} value={ac}>{ac}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>As Of Date</label>
                        <input 
                            type="date" 
                            className="enterprise-input" 
                            value={asOfDate} 
                            min={MIN_DATE}
                            max={MAX_DATE}
                            onChange={(e) => setAsOfDate(e.target.value)} 
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

            <div className="panel">
                {loading ? (
                    <div className="text-center" style={{padding: '40px'}}>Fetching positions data...</div>
                ) : positionsData.length === 0 && !error ? (
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
                                {positionsData.map((item, index) => (
                                    <tr key={index}>
                                        <td className="font-bold">{item.securityId}</td>
                                        <td>{item.securityName}</td>
                                        <td>
                                            <span className="badge" style={{ backgroundColor: 'transparent', color: 'var(--text-main)' }}>
                                                {item.assetClass}
                                            </span>
                                        </td>
                                        <td className="text-right font-bold" style={{ color: item.netQuantity < 0 ? 'var(--danger-text)' : 'inherit' }}>
                                            {item.netQuantity.toLocaleString()}
                                        </td>
                                        <td className="text-right">{formatCurrency(item.averageCost)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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