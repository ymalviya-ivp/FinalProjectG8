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
  public class PositionsTableServiceTests {
    private readonly PositionsTableService _service;
    private readonly Mock<IPositionsRepository> _mockRepo;
    public PositionsTableServiceTests() {
      _mockRepo = new Mock<IPositionsRepository>();
      _service = new PositionsTableService(_mockRepo.Object);
    }

    [Fact]
    public async Task GetPositionsAsync_WithBuyAndSellTrades_CalculatesNetQuantityAndAverageCostCorrectly() {
      var testDate = new DateOnly(2026, 3, 31);
      var dummySecurities = new List<Security>
      {
                new Security
                {
                    SecurityId = "EQ01",
                    SecurityName = "Apple",
                    AssetClass = "Equity",
                    Trades = new List<Trade>
                    {
                        new Trade { BuySell = "BUY", Quantity = 100, Price = 10m },
                        
                        new Trade { BuySell = "BUY", Quantity = 50, Price = 16m },
                        
                        new Trade { BuySell = "SELL", Quantity = 50, Price = 20m }
                    }
                }
            };

      _mockRepo.Setup(r => r.GetSecuritiesWithTradesAsync(testDate, null, null))
               .ReturnsAsync(dummySecurities);

      // Act
      var result = await _service.GetPositionsAsync(testDate, null, null);
      var positionsList = result.ToList();

      // Assert
      Assert.NotNull(positionsList);
      Assert.Single(positionsList); 

      var position = positionsList.First();
      Assert.Equal("EQ01", position.SecurityId);
      Assert.Equal("Apple", position.SecurityName);
      Assert.Equal("Equity", position.AssetClass);
      Assert.Equal(100, position.NetQuantity);
      Assert.Equal(12.0000m, position.AverageCost); 
    }
    [Fact]
    public async Task GetPositionsAsync_HandlesClosedPosition_AvoidsDivisionByZero() {
      // Arrange
      var testDate = new DateOnly(2026, 3, 31);
      var dummySecurities = new List<Security>
      {
        new Security
        {
            SecurityId = "EQ02",
            SecurityName = "Tesla",
            AssetClass = "Equity",
            Trades = new List<Trade>
            {
                new Trade { BuySell = "BUY", Quantity = 100, Price = 200m }, // Bought 100
                new Trade { BuySell = "SELL", Quantity = 100, Price = 250m } // Sold all 100 (Fully Closed)
            }
        }
    };

      _mockRepo.Setup(r => r.GetSecuritiesWithTradesAsync(testDate, null, null))
               .ReturnsAsync(dummySecurities);

      // Act
      var result = await _service.GetPositionsAsync(testDate, null, null);
      var positionsList = result.ToList();

      // Assert
      Assert.NotNull(positionsList);
      Assert.Single(positionsList);

      var position = positionsList.First();
      Assert.Equal(0, position.NetQuantity); 
      Assert.Equal(0m, position.AverageCost);
    }
  }
}