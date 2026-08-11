-- Procedures
Create or Alter Procedure sp_GetLatestEODPrices (@AsOfDate Date = '2026-03-31')
as
begin
	-- Select t.SecurityID, t.PriceDate, t.ClosePrice
	-- from G8.EOD_Prices t
	-- inner join (
		-- Select SecurityId, MAX(PriceDate) as LatestDate
		-- from G8.EOD_Prices 
		-- where PriceDate <= @AsOfDate
		-- group by SecurityId
	-- ) as Latest on t.SecurityID = Latest.SecurityID and t.PriceDate = Latest.LatestDate;
	WITH RankedPrices AS (
        SELECT 
            SecurityId, 
            PriceDate, 
            ClosePrice,
            ROW_NUMBER() OVER (PARTITION BY SecurityId ORDER BY PriceDate DESC) as RowNum
        FROM G8.EOD_Prices
        WHERE PriceDate <= @AsOfDate

    )
    SELECT 
        SecurityId, 
        PriceDate, 
        ClosePrice
    FROM RankedPrices
    WHERE RowNum = 1
end;

execute sp_GetLatestEODPrices '2026-02-14';

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

execute G8.Sp_GetPosition 'EQ02', '2026-02-03';



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


execute G8.sp_GetTradeBlotter;

Select SecurityId,
	SUM(
		CASE 
		when BuySell = 'BUY' then Quantity
		else -Quantity
		end
	) as NetPosition
	from G8.Trades
	where TradeDate <= '2026-02-03'
	group by SecurityID;