-- Functions and Views

Drop Function G8.fn_GetLatestEodPrices;

Create or Alter Function G8.fn_GetLatestEodPrices (@AsOfDate date)
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