using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TPPMSG8.Application.Interfaces;
using TPPMSG8.Domain.Models;
using TPPMSG8.Infrastructure.DataAccess;

namespace TPPMSG8.Infrastructure.Respositories
{
    public class EodPriceRepository : IEODPrice
    {
        private readonly AppDbContext _context;

        public EodPriceRepository(AppDbContext context)
        {
            _context = context;
        }

        public List<EodPrice> GetAllEODPrices()
        {
            return _context.EodPrices.ToList();
        }

        public async Task<List<EodPrice>> GetEodPricesByDateAsync(DateOnly priceDate)
        {
            return await _context.EodPrices
                .AsNoTracking()
                .Where(e => e.PriceDate <= priceDate)
                .GroupBy(e => e.SecurityId)
                .Select(g => g.OrderByDescending(e => e.PriceDate).First())
                .ToListAsync();
        }
    }
}