using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TPPMSG8.Application.Interfaces;
using TPPMSG8.Domain.Models;
using TPPMSG8.Infrastructure.DataAccess;

namespace TPPMSG8.Infrastructure.Respositories {
  public class PositionsRepository : IPositionsRepository {
    private readonly AppDbContext _db;
    private readonly ILogger<PositionsRepository> _logger;

    public PositionsRepository(AppDbContext db, ILogger<PositionsRepository> logger) {
      _db = db;
      _logger = logger;
    }

    public async Task<List<Security>> GetSecuritiesWithTradesAsync(DateOnly? asOfDate, string? securityId, string? assetClass) {
      try {
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
                    .OrderBy(t => t.TradeId)
                    .ToList()
            })
            .ToListAsync();
      } catch (Exception ex) {
        _logger.LogError(ex, "An error occurred while fetching securities and trades for asOfDate: {AsOfDate}, securityId: {SecurityId}, assetClass: {AssetClass}", asOfDate, securityId, assetClass);
        throw;
      }
    }
  }
}