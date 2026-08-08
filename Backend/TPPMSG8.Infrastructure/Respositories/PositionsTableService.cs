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
using TPPMSG8.Infrastructure.DataAccess;

namespace TPPMSG8.Infrastructure.Respositories {
  public class PositionsTableService : IPositionsTableService {
    private readonly AppDbContext _db;
    public PositionsTableService(AppDbContext db) {
      _db = db;
    }

    public List<PositionsTableDto> GetPositions(DateOnly? AsOfDate) {
      var Trades = _db.Trades
        .Include(t => t.Security)
        .Where(t => t.TradeDate <= AsOfDate)
        .OrderBy(t => t.TradeId)
        .ToList();

      var groupedTrades = Trades.GroupBy(t => t.SecurityId);
      var results = new List<PositionsTableDto>();

      foreach(var group in groupedTrades) {
        int NetPosition = 0;
        decimal WeightedAverageCost = 0m;
        foreach(var trade in group) {
          if (trade.BuySell == "BUY") {
            int CurrentPosition = NetPosition;
            NetPosition += trade.Quantity;
            WeightedAverageCost = (CurrentPosition * WeightedAverageCost + trade.Price * trade.Quantity) / NetPosition;
          } else if (trade.BuySell == "SELL") {
            NetPosition -= trade.Quantity;
          }
        }
        results.Add(new PositionsTableDto {
          SecurityId = group.Key,
          SecurityName = group.ElementAt(0).Security.SecurityName,
          AssetClass = group.ElementAt(0).Security.AssetClass,
          NetQuantity = NetPosition,
          AverageCost = Math.Round(WeightedAverageCost, 4)
        });
      }
      return results;
    }
  }
}
