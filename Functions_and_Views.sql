-- Functions and Views
CREATE FUNCTION G8.fn_GetLatestEodPrices (@AsOfDate DATE)
RETURNS TABLE
AS
RETURN
(
	-- CTE (Common Table Expression)
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
);

Select SecurityID, PriceDate, ClosePrice
from G8.fn_GetLatestEodPrices ('2026-02-14');


-- Views 
Create View G8.vw_ActiveTraders as
select distinct tr.*
from G8.Traders tr
inner join G8.Trades t on tr.TraderID = t.TraderID;

Select * from G8.vw_ActiveTraders;








-- Others
Select s.SecurityID, s.SecurityName, s.AssetClass, t.BuySell, t.Quantity, t.Price
from G8.Securities s left join G8.Trades t
on s.SecurityID = t.SecurityID and t.TradeDate <= '2026-02-03'
order by t.TradeID;