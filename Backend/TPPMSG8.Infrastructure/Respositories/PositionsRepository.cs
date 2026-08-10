using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TPPMSG8.Application.Interfaces;
using TPPMSG8.Domain.Models;
using TPPMSG8.Infrastructure.DataAccess;

namespace TPPMSG8.Infrastructure.Respositories {
  public class PositionsRepository : IPositionsRepository {
    private readonly AppDbContext _db;

    public PositionsRepository(AppDbContext db) {
      _db = db;
    }

    public async Task<List<Security>> GetSecuritiesWithTradesAsync(DateOnly? asOfDate, string? securityId, string? assetClass) {
      var query = _db.Securities.AsNoTracking();

      if (!string.IsNullOrWhiteSpace(securityId)) {
        query = query.Where(s => s.SecurityId == securityId);
      }

      if (!string.IsNullOrWhiteSpace(assetClass)) {
        query = query.Where(s => s.AssetClass == assetClass);
      }

      return await query
          .Select(s => new Security {
            SecurityId = s.SecurityId,
            SecurityName = s.SecurityName,
            AssetClass = s.AssetClass,
            Trades = s.Trades
                  .Where(t => t.TradeDate <= asOfDate)
                  .OrderBy(t => t.TradeDate)
                  .ThenBy(t => t.TradeId)
                  .ToList()
          })
          .ToListAsync();
    }
  }
}