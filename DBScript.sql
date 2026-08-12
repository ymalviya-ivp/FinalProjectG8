--- Foreign Key/ Primary Key setup
-- EOD Prices Table
Alter Table G8.EOD_Prices
Add Constraint FK_EOD_Prices_Securities
Foreign Key (SecurityID) References G8.Securities(SecurityID)
GO

Alter Table G8.EOD_Prices
Add Constraint PK_EOD_Prices
Primary Key Clustered (SecurityID, PriceDate)
GO


-- Trades Table
Alter Table G8.Trades
Add Constraint FK_Trades_Securities
Foreign Key (SecurityID) References G8.Securities(SecurityID)
GO

Alter Table G8.Trades
Add Constraint FK_Trades_Traders
Foreign Key (TraderID) References G8.Traders(TraderID)
GO


--- Procedures
Create Procedure G8.Sp_GetPosition 
	@SID varchar(50) = null,
	@AsOfDate date = null
as 
begin
	Select TradeDate, SecurityId,
	SUM(
		CASE 
		when BuySell = 'BUY' then Quantity
		else -Quantity
		end
	) as NetPosition
	from G8.Trades
	where SecurityID = @SID and TradeDate <= @AsOfDate
	group by TradeDate, SecurityId;
end;
GO


CREATE PROCEDURE G8.sp_GetTradeBlotter
    @TraderID INT = NULL,
    @SecurityID VARCHAR(20) = NULL
AS
BEGIN
    SELECT 
        t.TradeID, 
        t.TradeDate, 
        t.BuySell, 
        t.Quantity, 
        t.Price,
        s.SecurityID, 
        s.SecurityName, 
        s.AssetClass,
        tr.TraderID,
        tr.TraderName
    FROM G8.Trades t
    INNER JOIN G8.Securities s ON t.SecurityID = s.SecurityID
    INNER JOIN G8.Traders tr ON t.TraderID = tr.TraderID
    WHERE (@TraderID IS NULL OR t.TraderID = @TraderID)
      AND (@SecurityID IS NULL OR t.SecurityID = @SecurityID)
    ORDER BY t.TradeDate DESC, t.TradeID DESC;
END;
GO


--- Indexes
-- Trades Table
CREATE NONCLUSTERED INDEX IX_Trades_SecurityID_TradeDate
ON G8.Trades(SecurityID, TradeDate)
INCLUDE (BuySell, Quantity, Price);
GO

Create NonClustered Index 
IX_Trades_TraderID_SecurityID_TradeDate
on G8.Trades(TraderID, SecurityID, TradeDate);
GO

CREATE NONCLUSTERED INDEX IX_Trades_TradeDate_TradeID
ON G8.Trades(TradeDate DESC, TradeID DESC);
GO


-- Securities Table
CREATE NONCLUSTERED INDEX IX_Securities_SecurityName
ON G8.Securities(SecurityName);
GO

CREATE NONCLUSTERED INDEX IX_Securities_AssetClass
ON G8.Securities(AssetClass)
INCLUDE (SecurityName);
GO



--- Functions
Create or ALTER   Function [G8].[fn_GetLatestEodPrices] (@AsOfDate date)
returns @result table (
	SecurityId nvarchar(100), 
    PriceDate date, 
    ClosePrice decimal(18, 4)
)
as
begin
    with RankedPrices as (
        select SecurityId, PriceDate, ClosePrice,
        row_number() over (partition by SecurityId order by PriceDate desc) as RowNum
        FROM G8.EOD_Prices
        where PriceDate <= @AsOfDate
    )
	Insert into @result (SecurityId, PriceDate, ClosePrice)
    select SecurityId, PriceDate, ClosePrice
    from RankedPrices
    where RowNum = 1;
	return;
end;
GO


--- Views 
Create View G8.vw_ActiveTraders as
select distinct tr.*
from G8.Traders tr
inner join G8.Trades t on tr.TraderID = t.TraderID;
GO