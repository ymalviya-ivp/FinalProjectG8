import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Positions = () => {
    const [positionsData, setPositionsData] = useState([]);
    // Default the date picker to today's date
    const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPositions = async () => {
        if (!asOfDate) {
            setError('Please select an As Of Date.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Hitting the real API endpoint with the AsOfDate query parameter
            const response = await axios.get(`https://localhost:7021/api/PositionsTable/positions?AsOfDate=${asOfDate}`);
            setPositionsData(response.data);
        } catch (err) {
            setError(err.message || 'Failed to fetch Positions data. Ensure the backend API is running.');
            setPositionsData([]);
        } finally {
            setLoading(false);
        }
    };

    // Initial load when the component mounts
    useEffect(() => {
        fetchPositions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle manual searches when the user changes the date
    const handleSearch = (e) => {
        e.preventDefault();
        fetchPositions();
    };

    // Helper to format currency
    const formatCurrency = (value) => {
        const num = Number(value) || 0;
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
    };

    // Helper to style the asset class badge
    const getAssetClassBadge = (assetClass) => {
        const isEquity = assetClass?.toLowerCase() === 'equity';
        return (
            <span className="badge" style={{ 
                backgroundColor: isEquity ? '#dbeafe' : '#f3e8ff', 
                color: isEquity ? '#1e40af' : '#6b21a8' 
            }}>
                {assetClass}
            </span>
        );
    };

    return (
        <div className="positions-container">
            {/* Toolbar with As Of Date Filter */}
            <div className="panel" style={{ marginBottom: '20px' }}>
                <form onSubmit={handleSearch} className="toolbar">
                    <div className="filter-group">
                        <label>As Of Date</label>
                        <input 
                            type="date" 
                            className="enterprise-select" 
                            value={asOfDate} 
                            onChange={(e) => setAsOfDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="button-group">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Loading...' : 'Load Positions'}
                        </button>
                    </div>
                </form>
            </div>

            {error && <div className="alert-error" style={{marginBottom: '20px'}}>{error}</div>}

            {/* Positions Data Table */}
            <div className="panel">
                <div className="toolbar" style={{justifyContent: 'space-between'}}>
                    <h3>Current Positions</h3>
                </div>
                
                <div className="table-container">
                    {loading ? (
                        <div className="loading-spinner">Fetching positions data...</div>
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
                                        <td colSpan="5" className="text-center">No positions found for this date.</td>
                                    </tr>
                                ) : (
                                    positionsData.map((item, index) => (
                                        <tr key={index}>
                                            <td style={{fontWeight: 'bold'}}>{item.securityId}</td>
                                            <td>{item.securityName}</td>
                                            <td>{getAssetClassBadge(item.assetClass)}</td>
                                            <td className="text-right font-bold" style={{ color: item.netQuantity < 0 ? '#dc2626' : 'inherit' }}>
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