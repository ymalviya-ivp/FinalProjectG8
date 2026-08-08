using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TPPMSG8.Application.Interfaces;
using TPPMSG8.Application.DTOs;
using TPPMSG8.Domain.Models;

namespace TPPMSG8.Application.Services
{
    public class PnlService : IPnlService
    {
        private readonly ITrade _tradeRepository;
        private readonly IEODPrice _eodPriceRepository;
        private readonly ISecurity _securityRepository;

        public PnlService(ITrade tradeRepository, IEODPrice eodPriceRepository, ISecurity securityRepository)
        {
            _tradeRepository = tradeRepository;
            _eodPriceRepository = eodPriceRepository;
            _securityRepository = securityRepository;
        }

        public Task<IEnumerable<PnlDto>> GetPnlAsOfDateAsync(DateOnly? valDateOnly)
        {
            var pnlResults = new List<PnlDto>();

            // Fetch everything synchronously as defined by your interfaces
            var allTrades = _tradeRepository.GetAllTrades(null, null);
            var validTrades = allTrades.Where(t => t.TradeDate <= valDateOnly).ToList();

            var securities = _securityRepository.GetAllSecurities();

            var allEodPrices = _eodPriceRepository.GetAllEODPrices();
            var eodPrices = allEodPrices.Where(e => e.PriceDate == valDateOnly).ToList();

            foreach (var security in securities)
            {
                var securityTrades = validTrades
                    .Where(t => t.SecurityId == security.SecurityId)
                    .OrderBy(t => t.TradeDate)
                    .ToList();

                decimal netPosition = 0;
                decimal avgCost = 0;
                decimal realizedPnl = 0;

                foreach (var trade in securityTrades)
                {
                    // UPDATED: Using trade.BuySell to match your Trade model
                    if (trade.BuySell.Equals("Buy", StringComparison.OrdinalIgnoreCase))
                    {
                        decimal newPosition = netPosition + trade.Quantity;
                        if (newPosition > 0)
                        {
                            avgCost = ((netPosition * avgCost) + (trade.Quantity * trade.Price)) / newPosition;
                        }
                        netPosition = newPosition;
                    }
                    else if (trade.BuySell.Equals("Sell", StringComparison.OrdinalIgnoreCase))
                    {
                        realizedPnl += (trade.Price - avgCost) * trade.Quantity;
                        netPosition -= trade.Quantity;
                    }
                }

                decimal unrealizedPnl = 0;
                var currentPriceRecord = eodPrices.FirstOrDefault(e => e.SecurityId == security.SecurityId);

                if (netPosition > 0 && currentPriceRecord != null)
                {
                    unrealizedPnl = (currentPriceRecord.ClosePrice - avgCost) * netPosition;
                }

                pnlResults.Add(new PnlDto
                {
                    SecurityId = security.SecurityId,
                    SecurityTicker = security.SecurityName,
                    RealizedPnl = realizedPnl,
                    UnrealizedPnl = unrealizedPnl,
                    TotalPnl = realizedPnl + unrealizedPnl
                });
            }

            return Task.FromResult<IEnumerable<PnlDto>>(pnlResults);
        }
    }
}