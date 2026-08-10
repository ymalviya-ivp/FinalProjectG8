using TPPMSG8.Application.DTOs;
using TPPMSG8.Application.Interfaces;

namespace TPPMSG8.Application.Services {
  public class PositionsTableService : IPositionsTableService {
    private readonly IPositionsRepository _positionsRepository;

    public PositionsTableService(IPositionsRepository positionsRepository) {
      _positionsRepository = positionsRepository;
    }

    public async Task<List<PositionsTableDto>> GetPositionsAsync(DateOnly? asOfDate, string? securityId, string? assetClass) {
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
          } else {
            netPosition -= trade.Quantity;
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
    }
  }
}