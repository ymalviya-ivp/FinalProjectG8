import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const Positions = () => {
    const [positionsData, setPositionsData] = useState([]);
    
    const [securityOptions, setSecurityOptions] = useState([]);
    const [assetClassOptions, setAssetClassOptions] = useState([]);
    
    const DEFAULT_AS_OF_DATE = '2026-03-31';
    const [asOfDate, setAsOfDate] = useState(DEFAULT_AS_OF_DATE);
    const [securityId, setSecurityId] = useState('');
    const [assetClass, setAssetClass] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPositions = useCallback(async () => {
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
        setAsOfDate(DEFAULT_AS_OF_DATE);
    };

    const formatCurrency = (value) => {
        const num = Number(value) || 0;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(num);
    };

    return (
        <div className="positions-container">
            {/* --- FILTER PANEL --- */}
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
                        <input type="date" className="enterprise-input" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} required />
                    </div>
                    
                    <div className="button-group">
                        <button type="button" onClick={clearFilters} className="btn btn-secondary">Clear Filters</button>
                    </div>
                </div>
            </div>

            {error && <div className="alert-error" style={{marginBottom: '24px'}}>{error}</div>}

            {/* --- DATA TABLE PANEL --- */}
            <div className="panel">
                <div className="table-container">
                    {loading ? (
                        <div className="text-center" style={{padding: '40px'}}>Fetching positions data...</div>
                    ) : (
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
                                {positionsData.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center">No positions found for this date/filter.</td>
                                    </tr>
                                ) : (
                                    positionsData.map((item, index) => (
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

export default Positions;