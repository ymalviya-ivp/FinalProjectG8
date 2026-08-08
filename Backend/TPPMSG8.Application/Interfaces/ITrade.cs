  using System;
  using System.Collections.Generic;
  using System.Linq;
  using System.Text;
  using System.Threading.Tasks;
  using TPPMSG8.Domain.Models;

  namespace TPPMSG8.Application.Interfaces {
    public interface ITrade {
      public List<Trade> GetAllTrades(string? securityId, DateOnly? tradeDate);
    }
  }
