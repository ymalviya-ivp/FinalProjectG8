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
  public class SecurityRepository : ISecurity {
    private readonly AppDbContext _context;
    private readonly ILogger<SecurityRepository> _logger;

    public SecurityRepository(AppDbContext context, ILogger<SecurityRepository> logger) {
      _context = context;
      _logger = logger;
    }

    public async Task<List<SecuritiesDto>> GetAllSecuritiesAsync() {
      try {
        return await _context.Securities.AsNoTracking().Select(s => new SecuritiesDto {
          SecurityId = s.SecurityId,
          SecurityName = s.SecurityName
        }).ToListAsync();
      } catch (Exception ex) {
        _logger.LogError(ex, "An error occurred while fetching all securities.");
        throw;
      }
    }

    public async Task<List<SecuritiesDto>> GetDistinctSecuritiesAsync() {
      try {
        return await _context.Securities
            .AsNoTracking()
            .Select(s => new SecuritiesDto {
              SecurityId = s.SecurityId,
              SecurityName = s.SecurityName
            })
            .Distinct()
            .OrderBy(s => s.SecurityName)
            .ToListAsync();
      } catch (Exception ex) {
        _logger.LogError(ex, "An error occurred while fetching distinct securities.");
        throw;
      }
    }

    public async Task<List<string>> GetDistinctAssetClassesAsync() {
      try {
        return await _context.Securities
            .AsNoTracking()
            .Select(s => s.AssetClass)
            .Distinct()
            .OrderBy(ac => ac)
            .ToListAsync();
      } catch (Exception ex) {
        _logger.LogError(ex, "An error occurred while fetching distinct asset classes.");
        throw;
      }
    }
  }
}