using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using TPPMSG8.Application.DTOs;
using TPPMSG8.Application.Interfaces;

namespace TPPMSG8.Application.Services {
  public class PositionsTableService : IPositionsTableService {
    private readonly IPositionsRepository _positionsRepository;
    private readonly ILogger<PositionsTableService> _logger;

    public PositionsTableService(
        IPositionsRepository positionsRepository,
        ILogger<PositionsTableService> logger) {
      _positionsRepository = positionsRepository;
      _logger = logger;
    }

    public async Task<List<PositionsTableDto>> GetPositionsAsync(DateOnly? asOfDate, string? securityId, string? assetClass) {
      try {
        var securities = await _positionsRepository.GetSecuritiesWithTradesAsync(asOfDate, securityId, assetClass);

        var results = new List<PositionsTableDto>();

        foreach (var security in securities) {
          int netPosition = 0;
          decimal weightedAverageCost = 0m;

          foreach (var trade in security.Trades) {
            if (trade.BuySell == "BUY") {
              int currentPosition = netPosition;
              netPosition += trade.Quantity;
              weightedAverageCost = (currentPosition * weightedAverageCost + trade.Price * trade.Quantity) / netPosition;
            } else if (trade.BuySell == "SELL") {
              netPosition -= trade.Quantity;
              if (netPosition < 0) {
                throw new InvalidOperationException($"Invalid trade sequence: Net position for SecurityId '{trade.SecurityId}' dropped below zero on TradeId {trade.TradeId}. Short positions are not allowed.");
              }
            }
          }

          results.Add(new PositionsTableDto {
            SecurityId = security.SecurityId,
            SecurityName = security.SecurityName,
            AssetClass = security.AssetClass,
            NetQuantity = netPosition,
            AverageCost = Math.Round(weightedAverageCost, 4)
          });
        }

        return results;
      } catch (Exception ex) {
        _logger.LogError(ex, "An error occurred while calculating positions for asOfDate: {AsOfDate}, securityId: {SecurityId}, assetClass: {AssetClass}", asOfDate, securityId, assetClass);
        throw;
      }
    }
  }
}