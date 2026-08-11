using Microsoft.AspNetCore.Mvc;
using Moq;
using TPPMSG8.Api.Controllers;
using TPPMSG8.Application.DTOs;
using TPPMSG8.Application.Interfaces;

namespace TPPMSG8.Tests.Controllers {
    public class PnlControllerTests {
      private readonly PnlController _controller;
      private readonly Mock<IPnlService> _mockPnlService;

      public PnlControllerTests() {
        _mockPnlService = new Mock<IPnlService>();
        _controller = new PnlController(_mockPnlService.Object);
      }

    [Theory]
    [InlineData("2026-03-14", "EQ02", "Prime Energy Corp", -24.02, -2431.68, -2455.7)]
    public async Task GetPnl_ReturnsOkResultWithData(string dateString, string sid, string st, double rpnl, double urpnl, double tpnl) {
      var testDate = DateOnly.Parse(dateString); 

      var expectedData = new List<PnlDto> {
      new PnlDto {
        SecurityId = sid,
        SecurityTicker = st,
        RealizedPnl = (decimal)rpnl,   
        UnrealizedPnl = (decimal)urpnl,
        TotalPnl = (decimal)tpnl        
        }
      };

      _mockPnlService.Setup(s => s.GetPnlAsOfDateAsync(testDate, sid)).ReturnsAsync(expectedData);

      var result = await _controller.GetPnl(testDate, sid) as OkObjectResult;

      Assert.NotNull(result);
      Assert.Equal(200, result.StatusCode);
      Assert.Equal(expectedData, result.Value);
    }
    [Fact]
    public async Task GetPnl_ReturnsOkResultWithEmptyList_WhenNoDataExists() {
      var testDate = new DateOnly(2026, 4, 1);
      var securityId = "UNKNOWN";
      _mockPnlService.Setup(s => s.GetPnlAsOfDateAsync(testDate, securityId))
                     .ReturnsAsync(new List<PnlDto>());
      var result = await _controller.GetPnl(testDate, securityId) as OkObjectResult;
      Assert.NotNull(result);
      Assert.Equal(200, result.StatusCode);

      var returnedList = result.Value as IEnumerable<PnlDto>;
      Assert.NotNull(returnedList);
      Assert.Empty(returnedList);
    }
  }
}