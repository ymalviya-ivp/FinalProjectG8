using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TPPMSG8.Application.DTOs;
using TPPMSG8.Domain.Models;

namespace TPPMSG8.Application.Interfaces {
  public interface IPositionsRepository {
    public Task<List<Security>> GetSecuritiesWithTradesAsync(DateOnly? asOfDate, string? securityId, string? assetClass);
    }
}
