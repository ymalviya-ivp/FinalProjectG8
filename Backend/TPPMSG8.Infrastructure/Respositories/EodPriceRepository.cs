using System.Collections.Generic;
using System.Linq;
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
    }
}