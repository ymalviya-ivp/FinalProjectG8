// TPPMSG8.Application.Interfaces.IPositionsTableService.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TPPMSG8.Application.DTOs;

namespace TPPMSG8.Application.Interfaces {
  public interface IPositionsTableService {
    Task<List<PositionsTableDto>> GetPositionsAsync(DateOnly? asOfDate, string? securityId, string? assetClass);
  }
}