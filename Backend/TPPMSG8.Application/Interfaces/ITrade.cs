using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TPPMSG8.Application.DTOs;
using TPPMSG8.Domain.Models;

namespace TPPMSG8.Application.Interfaces {
  public interface ITrade {
    Task<List<Trade>> GetAllTradesAsync(string? securityId, int? traderId, DateOnly? fromDate, DateOnly? toDate);
    Task<List<Trade>> GetTradesAsOfDateAsync(DateOnly valuationDate);

    Task<List<string>> GetDistinctSecurityIdsAsync();
    Task<List<TraderDto>> GetDistinctTradersAsync();
  }
}