using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TPPMSG8.Application.DTOs;
using TPPMSG8.Application.Interfaces;
using TPPMSG8.Domain.Models;
using TPPMSG8.Infrastructure.DataAccess;

namespace TPPMSG8.Infrastructure.Repositories // Fixed typo in namespace (Respositories -> Repositories)
{
  public class SecurityRepository : ISecurity {
    private readonly AppDbContext _context;

    public SecurityRepository(AppDbContext context) {
      _context = context;
    }

    public async Task<List<SecuritiesDto>> GetAllSecuritiesAsync() {
      return await _context.Securities.AsNoTracking().Select(s => new SecuritiesDto {
        SecurityId = s.SecurityId,
        SecurityName = s.SecurityName
      }).ToListAsync();
    }
    public async Task<List<SecuritiesDto>> GetDistinctSecuritiesAsync() {
      return await _context.Securities
          .AsNoTracking()
          .Select(s => new SecuritiesDto {
            SecurityId = s.SecurityId,
            SecurityName = s.SecurityName
          })
          .Distinct()
          .OrderBy(s => s.SecurityName) 
          .ToListAsync();
    }

    public async Task<List<string>> GetDistinctAssetClassesAsync() {
      return await _context.Securities
          .AsNoTracking()
          .Select(s => s.AssetClass)
          .Distinct()
          .OrderBy(ac => ac) 
          .ToListAsync();
    }
  }
}