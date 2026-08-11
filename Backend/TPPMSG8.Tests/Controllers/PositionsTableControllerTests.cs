using Microsoft.AspNetCore.Mvc;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TPPMSG8.Api.Controllers;
using TPPMSG8.Application.DTOs;
using TPPMSG8.Application.Interfaces;
using Xunit;

namespace TPPMSG8.Tests.Controllers {
  public class PositionsTableControllerTests {
    private readonly PositionsTableController _controller;
    private readonly Mock<IPositionsTableService> _mockPts;

    public PositionsTableControllerTests() {
      _mockPts = new Mock<IPositionsTableService>();
      _controller = new PositionsTableController(_mockPts.Object);
    }

    [Fact]
    public async Task GetPositions_ReturnsOkResultWithPositions() {
      // Arrange
      var date = new DateOnly(2026, 3, 31);
      var expectedPositions = new List<PositionsTableDto> {
        new PositionsTableDto {
          SecurityId = "EQ01",
          SecurityName = "Prime Energy Corp",
          AssetClass = "Equity",
          NetQuantity = 278,
          AverageCost = (decimal)428.1471
        }
      };
      _mockPts.Setup(s => s.GetPositionsAsync(date, null, null)).ReturnsAsync(expectedPositions);

      // Act
      var result = await _controller.GetPositions(date, null, null) as OkObjectResult;

      // Assert
      Assert.NotNull(result);
      Assert.Equal(200, result.StatusCode);
    }
    [Fact]
    public async Task GetPositions_ReturnsOkResultWithEmptyList_WhenFilterFindsNothing() {
      // Arrange
      var date = new DateOnly(2026, 3, 31);
      var invalidAssetClass = "Crypto"; 

      _mockPts.Setup(s => s.GetPositionsAsync(date, null, invalidAssetClass))
              .ReturnsAsync(new List<PositionsTableDto>());

      // Act
      var result = await _controller.GetPositions(date, null, invalidAssetClass) as OkObjectResult;

      // Assert
      Assert.NotNull(result);
      Assert.Equal(200, result.StatusCode);

      var positions = result.Value as IEnumerable<PositionsTableDto>;
      Assert.NotNull(positions);
      Assert.Empty(positions);
    }
  }
}