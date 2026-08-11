using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using TPPMSG8.Application.Interfaces;
using TPPMSG8.Application.DTOs;
using TPPMSG8.Domain.Models;

namespace TPPMSG8.Application.Services {
  public class PnlService : IPnlService {
    private readonly ITrade _tradeRepository;
    private readonly IEODPrice _eodPriceRepository;
    private readonly ISecurity _securityRepository;
    private readonly ILogger<PnlService> _logger;

    public PnlService(
        ITrade tradeRepository,
        IEODPrice eodPriceRepository,
        ISecurity securityRepository,
        ILogger<PnlService> logger) {
      _tradeRepository = tradeRepository;
      _eodPriceRepository = eodPriceRepository;
      _securityRepository = securityRepository;
      _logger = logger;
    }

    public async Task<IEnumerable<PnlDto>> GetPnlAsOfDateAsync(DateOnly targetDate, string? securityId) {
      try {
        var pnlResults = new List<PnlDto>();

        var validTrades = await _tradeRepository.GetTradesAsOfDateAsync(targetDate);
        var securities = await _securityRepository.GetAllSecuritiesAsync();
        var eodPrices = await _eodPriceRepository.GetEodPricesByDateAsync(targetDate);

        if (!string.IsNullOrWhiteSpace(securityId)) {
          securities = securities.Where(s => s.SecurityId == securityId).ToList();
        }

        var securityLookup = securities.ToDictionary(s => s.SecurityId, s => s.SecurityName);
        var priceLookup = eodPrices.ToDictionary(p => p.SecurityId, p => p.ClosePrice);

        var tradesGroupedBySecurity = validTrades.GroupBy(trade => trade.SecurityId);

        foreach (var tradeBucket in tradesGroupedBySecurity) {
          string currentSecurityId = tradeBucket.Key;

          string securityName = string.Empty;
          if (securityLookup.ContainsKey(currentSecurityId)) {
            securityName = securityLookup[currentSecurityId];
          } else {
            continue;
          }

          var sortedTrades = tradeBucket
              .OrderBy(t => t.TradeId)
              .ToList();

          decimal netPosition = 0;
          decimal avgCost = 0;
          decimal realizedPnl = 0;

          foreach (var trade in sortedTrades) {
            if (trade.BuySell == "BUY") {
              decimal newPosition = netPosition + trade.Quantity;
              if (newPosition > 0) {
                avgCost = ((netPosition * avgCost) + (trade.Quantity * trade.Price)) / newPosition;
              }
              netPosition = newPosition;
            } else {
              realizedPnl += (trade.Price - avgCost) * trade.Quantity;
              netPosition -= trade.Quantity;
            }
          }

          decimal unrealizedPnl = 0;

          if (netPosition > 0 && priceLookup.ContainsKey(currentSecurityId)) {
            decimal closePrice = priceLookup[currentSecurityId];
            unrealizedPnl = (closePrice - avgCost) * netPosition;
          }

          pnlResults.Add(new PnlDto {
            SecurityId = currentSecurityId,
            SecurityTicker = securityName,
            RealizedPnl = realizedPnl,
            UnrealizedPnl = unrealizedPnl,
            TotalPnl = realizedPnl + unrealizedPnl
          });
        }

        return pnlResults;
      } catch (Exception ex) {
        _logger.LogError(ex, "An error occurred while calculating PnL for target date {TargetDate} and security ID {SecurityId}", targetDate, securityId);
        throw;
      }
    }
  }
}