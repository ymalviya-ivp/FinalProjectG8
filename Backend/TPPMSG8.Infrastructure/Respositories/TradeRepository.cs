using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TPPMSG8.Application.Interfaces;
using TPPMSG8.Domain.Models;
using TPPMSG8.Infrastructure.DataAccess;

namespace TPPMSG8.Infrastructure.Respositories {
  public class TradeRepository : ITrade {
    AppDbContext _db;
    public TradeRepository(AppDbContext db) {
      _db = db;
    }
    public List<Trade> GetAllTrades(string? securityId, DateOnly? tradeDate) {
      var tradeList = _db.Trades.AsQueryable();
      if (securityId != null) {
        tradeList = tradeList.Where(t => t.SecurityId == securityId);
      }
      if (tradeDate != null) {
        tradeList = tradeList.Where(t => t.TradeDate == tradeDate.Value);
      }
      return tradeList.ToList();
    }
  }
}
