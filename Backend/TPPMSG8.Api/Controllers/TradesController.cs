using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using TPPMSG8.Application.Interfaces;

namespace TPPMSG8.Api.Controllers {
  [Route("api/[controller]")]
  [ApiController]
  public class TradesController : ControllerBase {
    private readonly ITrade _trade;

    public TradesController(ITrade trade) {
      _trade = trade;
    }

    [HttpGet]
    public async Task<IActionResult> GetTrades(
        [FromQuery] string? securityId,
        [FromQuery] int? traderId,
        [FromQuery] DateOnly? fromDate,
        [FromQuery] DateOnly? toDate) {
      try {
        var trades = await _trade.GetAllTradesAsync(securityId, traderId, fromDate, toDate);
        return Ok(trades);
      } catch (Exception) {
        return StatusCode(500, "An error occurred while fetching trades.");
      }
    }

    [HttpGet("securityIds")]
    public async Task<IActionResult> GetSecurityIds() {
      try {
        var ids = await _trade.GetDistinctSecurityIdsAsync();
        return Ok(ids);
      } catch (Exception ex) {
        return StatusCode(500, $"An error occurred while fetching security IDs. {ex}");
      }
    }

    [HttpGet("traderIds")] 
    public async Task<IActionResult> GetTraders() {
      try {
        var traders = await _trade.GetDistinctTradersAsync();
        return Ok(traders);
      } catch (Exception ex) {
        return StatusCode(500, $"An error occurred while fetching traders. {ex}");
      }
    }
  }
}