using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TPPMSG8.Application.DTOs;
using TPPMSG8.Application.Interfaces;
using TPPMSG8.Application.Services;
using TPPMSG8.Domain.Models;
using Xunit;

namespace TPPMSG8.Tests.Services {
  public class PnlServiceTests {
    private readonly PnlService _pnlService;

    private readonly Mock<ITrade> _mockTradeRepo;
    private readonly Mock<IEODPrice> _mockEodRepo;
    private readonly Mock<ISecurity> _mockSecurityRepo;

    public PnlServiceTests() {
      _mockTradeRepo = new Mock<ITrade>();
      _mockEodRepo = new Mock<IEODPrice>();
      _mockSecurityRepo = new Mock<ISecurity>();

      _pnlService = new PnlService(_mockTradeRepo.Object, _mockEodRepo.Object, _mockSecurityRepo.Object);
    }

    [Fact]
    public async Task GetPnlAsOfDateAsync_CalculatesPnlMathCorrectly() {
      var targetDate = new DateOnly(2026, 3, 31);
      var securityId = "EQ01";

      var dummySecurities = new List<SecuritiesDto>
      {
                new SecuritiesDto { SecurityId = securityId, SecurityName = "Apple" }
            };

      var dummyTrades = new List<Trade>
      {
                new Trade { TradeId = 1, SecurityId = securityId, BuySell = "BUY", Quantity = 100, Price = 10m, TradeDate = new DateOnly(2026, 3, 1) },
                new Trade { TradeId = 2, SecurityId = securityId, BuySell = "SELL", Quantity = 50, Price = 15m, TradeDate = new DateOnly(2026, 3, 15) }
            };

      var dummyPrices = new List<EodPrice>
      {
                new EodPrice { SecurityId = securityId, ClosePrice = 20m, PriceDate = targetDate }
            };

      _mockSecurityRepo.Setup(repo => repo.GetAllSecuritiesAsync()).ReturnsAsync(dummySecurities);
      _mockTradeRepo.Setup(repo => repo.GetTradesAsOfDateAsync(targetDate)).ReturnsAsync(dummyTrades);
      _mockEodRepo.Setup(repo => repo.GetEodPricesByDateAsync(targetDate)).ReturnsAsync(dummyPrices);

      var result = (await _pnlService.GetPnlAsOfDateAsync(targetDate, null)).ToList();

      Assert.NotNull(result);
      Assert.Single(result);

      var calculatedPnl = result.First();
      Assert.Equal("EQ01", calculatedPnl.SecurityId);
      Assert.Equal("Apple", calculatedPnl.SecurityTicker);
      Assert.Equal(250m, calculatedPnl.RealizedPnl);
      Assert.Equal(500m, calculatedPnl.UnrealizedPnl);
      Assert.Equal(750m, calculatedPnl.TotalPnl);
    }
  }
}