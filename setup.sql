use TPPMSG8;

Create Schema G8;

Select * from G8.Traders;

Select * from G8.Securities;

Select * from G8.EOD_Prices;

Select * from G8.Trades;

-- EOD Prices Table
Alter Table G8.EOD_Prices
Add Constraint FK_EOD_Prices_Securities
Foreign Key (SecurityID) References G8.Securities(SecurityID)

Alter Table G8.EOD_Prices
Add Constraint PK_EOD_Prices
Primary Key Clustered (SecurityID, PriceDate)


-- Trades Table
Alter Table G8.Trades
Add Constraint FK_Trades_Securities
Foreign Key (SecurityID) References G8.Securities(SecurityID)

Alter Table G8.Trades
Add Constraint FK_Trades_Traders
Foreign Key (TraderID) References G8.Traders(TraderID)