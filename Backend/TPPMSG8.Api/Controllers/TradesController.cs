using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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
    public IActionResult GetTrades([FromQuery] string? securityId, [FromQuery] DateOnly? tradeDate) {
      return Ok(_trade.GetAllTrades(securityId, tradeDate));
    }
    [HttpGet("filters")]
    public IActionResult GetFilterOptions() {
      var trades = _trade.GetAllTrades(null, null);
      var securityIds = trades.Select(t => t.SecurityId).Distinct().ToList();
      var tradeDates = trades.Select(t => t.TradeDate).Distinct().ToList();
      return Ok(new { SecurityIds = securityIds, TradeDates = tradeDates });
    }
  }
}
