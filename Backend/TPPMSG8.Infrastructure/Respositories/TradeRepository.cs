using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TPPMSG8.Application.DTOs;
using TPPMSG8.Application.Interfaces;
using TPPMSG8.Domain.Models;
using TPPMSG8.Infrastructure.DataAccess;

namespace TPPMSG8.Infrastructure.Repositories {
  public class TradeRepository : ITrade {
    private readonly AppDbContext _db;
    private readonly ILogger<TradeRepository> _logger;

    public TradeRepository(AppDbContext db, ILogger<TradeRepository> logger) {
      _db = db;
      _logger = logger;
    }

    public async Task<List<Trade>> GetAllTradesAsync(string? securityId, int? traderId, DateOnly? fromDate, DateOnly? toDate) {
      try {
        var query = _db.Trades.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(securityId)) {
          query = query.Where(t => t.SecurityId == securityId);
        }
        if (traderId != null) {
          query = query.Where(t => t.TraderId == traderId.Value);
        }
        if (fromDate != null) {
          query = query.Where(t => t.TradeDate >= fromDate.Value);
        }
        if (toDate != null) {
          query = query.Where(t => t.TradeDate <= toDate.Value);
        }

        return await query
            .OrderByDescending(t => t.TradeDate)
            .ThenByDescending(t => t.TradeId)
            .ToListAsync();
      } catch (Exception ex) {
        _logger.LogError(ex, "An error occurred while fetching trades with filters - SecurityId: {SecurityId}, TraderId: {TraderId}, FromDate: {FromDate}, ToDate: {ToDate}", securityId, traderId, fromDate, toDate);
        throw;
      }
    }

    public async Task<List<Trade>> GetTradesAsOfDateAsync(DateOnly valuationDate) {
      try {
        return await _db.Trades
            .AsNoTracking()
            .Where(t => t.TradeDate <= valuationDate)
            .ToListAsync();
      } catch (Exception ex) {
        _logger.LogError(ex, "An error occurred while fetching trades as of date: {ValuationDate}", valuationDate);
        throw;
      }
    }

    public async Task<List<string>> GetDistinctSecurityIdsAsync() {
      try {
        return await _db.Trades
            .AsNoTracking()
            .Select(t => t.SecurityId)
            .Distinct()
            .OrderBy(id => id)
            .ToListAsync();
      } catch (Exception ex) {
        _logger.LogError(ex, "An error occurred while fetching distinct security IDs.");
        throw;
      }
    }

    public async Task<List<TraderDto>> GetDistinctTradersAsync() {
      try {
        return await _db.Traders
            .AsNoTracking()
            .Select(t => new TraderDto {
              TraderId = t.TraderId,
              TraderName = t.TraderName
            })
            .Distinct()
            .OrderBy(t => t.TraderName)
            .ToListAsync();
      } catch (Exception ex) {
        _logger.LogError(ex, "An error occurred while fetching distinct traders.");
        throw;
      }
    }
  }
}