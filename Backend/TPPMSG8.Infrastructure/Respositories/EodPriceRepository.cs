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
  public class EodPriceRepository : IEODPrice {
    private readonly AppDbContext _context;
    private readonly ILogger<EodPriceRepository> _logger;

    public EodPriceRepository(AppDbContext context, ILogger<EodPriceRepository> logger) {
      _context = context;
      _logger = logger;
    }

    public List<EodPrice> GetAllEODPrices() {
      try {
        return _context.EodPrices.ToList();
      } catch (Exception ex) {
        _logger.LogError(ex, "An error occurred while fetching all EOD prices.");
        throw;
      }
    }

    public async Task<List<EodPrice>> GetEodPricesByDateAsync(DateOnly priceDate) {
      try {
        //return await _context.EodPrices
        //    .AsNoTracking()
        //    .Where(e => e.PriceDate <= priceDate)
        //    .GroupBy(e => e.SecurityId)
        //    .Select(g => g.OrderByDescending(e => e.PriceDate).First())
        //    .ToListAsync();
        return await _context.EodPrices
            .FromSqlInterpolated($"SELECT SecurityId, PriceDate, ClosePrice FROM G8.fn_GetLatestEodPrices({priceDate})")
            .AsNoTracking()
            .ToListAsync();
      } catch (Exception ex) {
        _logger.LogError(ex, "An error occurred while fetching EOD prices for date: {PriceDate}", priceDate);
        throw;
      }
    }
  }
}