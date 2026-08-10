using Azure.Core.GeoJson;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TPPMSG8.Application.DTOs;
using TPPMSG8.Application.Interfaces;
using TPPMSG8.Domain.Models;
using TPPMSG8.Infrastructure.DataAccess;

namespace TPPMSG8.Infrastructure.Respositories {
  public class PTS : IPositionsTableService {
    private readonly AppDbContext _db;
    public PTS(AppDbContext db) {
      _db = db;
    }

    public async Task<List<PositionsTableDto>> GetPositionsAsync(DateOnly? asOfDate, string? securityId, string? assetClass) {

      var query = _db.Securities.AsNoTracking();
      if (!string.IsNullOrWhiteSpace(securityId)) {
        query = query.Where(s => s.SecurityId == securityId);
      }
      if (!string.IsNullOrWhiteSpace(assetClass)) {
        query = query.Where(s => s.AssetClass == assetClass);
      }
      var securities = await query
          .Select(s => new {
            s.SecurityId,
            s.SecurityName,
            s.AssetClass,
            Trades = s.Trades
                  .Where(t => t.TradeDate <= asOfDate)
                  .OrderBy(t => t.TradeDate)
                  .ThenBy(t => t.TradeId)
                  .Select(t => new { 
                    t.BuySell, t.Quantity, t.Price 
                  })
                  .ToList()
          })
          .ToListAsync();

      var results = new List<PositionsTableDto>();

      foreach(var security in securities) {
        int NetPosition = 0;
        decimal WeightedAverageCost = 0m;
        foreach(var trade in security.Trades) {
          if (trade.BuySell == "BUY") {
            int CurrentPosition = NetPosition;
            NetPosition += trade.Quantity;
            WeightedAverageCost = (CurrentPosition * WeightedAverageCost + trade.Price * trade.Quantity) / NetPosition;
          } else if (trade.BuySell == "SELL") {
            NetPosition -= trade.Quantity;
          }
        }
        results.Add(new PositionsTableDto {
          SecurityId = security.SecurityId,
          SecurityName = security.SecurityName,
          AssetClass = security.AssetClass,
          NetQuantity = NetPosition,
          AverageCost = Math.Round(WeightedAverageCost, 4)
        });
      }
      return results;
    }
  }
}
