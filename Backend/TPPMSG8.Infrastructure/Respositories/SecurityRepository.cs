using System.Collections.Generic;
using System.Linq;
using TPPMSG8.Application.Interfaces;
using TPPMSG8.Domain.Models;
using TPPMSG8.Infrastructure.DataAccess;

namespace TPPMSG8.Infrastructure.Respositories
{
    public class SecurityRepository : ISecurity
    {
        private readonly AppDbContext _context;

        public SecurityRepository(AppDbContext context)
        {
            _context = context;
        }

        public List<Security> GetAllSecurities()
        {
            return _context.Securities.ToList();
        }
    }
}