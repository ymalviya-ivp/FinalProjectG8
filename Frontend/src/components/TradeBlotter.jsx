import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TradeBlotter = () => {
    const [trades, setTrades] = useState([]);
    const [filterOptions, setFilterOptions] = useState({ securityIds: [], tradeDates: [] });
    
    const [securityId, setSecurityId] = useState('');
    const [tradeDate, setTradeDate] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTrades = async () => {
        setLoading(true);
        setError(null);
        try {
            const url = `https://localhost:7021/api/Trades?securityId=${securityId}&tradeDate=${tradeDate}`;
            console.log("URL: " + url)
            
            const response = await axios.get(url);
            const data = response.data;
            console.log(data)
            setTrades(data);
            console.log("Data fetched after trades:" + filterOptions.securityIds + " " + filterOptions.tradeDates);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchFilterOptions = async () => {
        try {
            const response = await axios.get('https://localhost:7021/api/trades/filters');
            console.log("Data fetched after filter options:" + response.data);
            if (response.status === 200) {
                const data = response.data;
                setFilterOptions(data);
            }
        } catch (err) {
            console.error("Failed to load filter options", err);
        }
    };

    // Initial load: fetch options and initial data
    useEffect(() => {
        fetchFilterOptions();
        fetchTrades();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchTrades();
    };

    const clearFilters = () => {
        setSecurityId('');
        setTradeDate('');
        setTimeout(() => fetchTrades(), 0); 
    };

    return (
        <div className="trade-blotter-container">
            <h2>Trade Blotter</h2>
            
            <form onSubmit={handleSearch} className="filter-form">
                <div className="form-group">
                    <label>Security ID: </label>
                    <select value={securityId} onChange={(e) => setSecurityId(e.target.value)}>
    <option value="">-- All Securities --</option>
    {filterOptions.securityIds?.map(id => (
        <option key={id} value={id}>{id}</option>
    ))}
</select>
                </div>
                
                <div className="form-group">
                    <label>Trade Date: </label>
                    <select value={tradeDate} onChange={(e) => setTradeDate(e.target.value)}>
    <option value="">-- All Dates --</option>
    {filterOptions.tradeDates?.map(date => (
        <option key={date} value={date}>{date}</option>
    ))}
</select>
                </div>
                
                <button type="submit">Search</button>
                <button type="button" onClick={clearFilters}>Clear</button>
            </form>

            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            
            {loading ? (
                <p>Loading trades...</p>
            ) : (
                <table border="1" cellPadding="10" style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                            <th>Trade ID</th>
                            <th>Trade Date</th>
                            <th>Trader ID</th>
                            <th>Security ID</th>
                            <th>Type (Buy/Sell)</th>
                            <th>Quantity</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trades.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center' }}>No trades found.</td>
                            </tr>
                        ) : (
                            trades.map(trade => (
                                <tr key={trade.tradeId}>
                                    <td>{trade.tradeId}</td>
                                    <td>{new Date(trade.tradeDate).toLocaleDateString()}</td>
                                    <td>{trade.traderId}</td>
                                    <td>{trade.securityId}</td>
                                    <td style={{ color: trade.buySell === 'BUY' ? 'green' : 'red' }}>
                                        {trade.buySell}
                                    </td>
                                    <td>{trade.quantity}</td>
                                    <td>${trade.price.toFixed(2)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default TradeBlotter;