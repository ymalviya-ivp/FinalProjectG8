-- Indexes

-- Trades Table
CREATE NONCLUSTERED INDEX IX_Trades_SecurityID_TradeDate
ON G8.Trades(SecurityID, TradeDate)
INCLUDE (BuySell, Quantity, Price);

Create NonClustered Index 
IX_Trades_TraderID_SecurityID_TradeDate
on G8.Trades(TraderID, SecurityID, TradeDate);

CREATE NONCLUSTERED INDEX IX_Trades_TradeDate_TradeID
ON G8.Trades(TradeDate DESC, TradeID DESC);


-- Securities Table
CREATE NONCLUSTERED INDEX IX_Securities_SecurityName
ON G8.Securities(SecurityName);

CREATE NONCLUSTERED INDEX IX_Securities_AssetClass
ON G8.Securities(AssetClass)
INCLUDE (SecurityName);