using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TPPMSG8.Application.DTOs;
using TPPMSG8.Application.Interfaces;

namespace TPPMSG8.Api.Controllers {
  [Route("api/[controller]")]
  [ApiController]
  public class PositionsTableController : ControllerBase {
    private readonly IPositionsTableService pts;
    public PositionsTableController(IPositionsTableService pts) {
      this.pts = pts;
    }
    [HttpGet("positions")]
    public async Task<IActionResult> GetPositions([FromQuery] DateOnly? asOfDate, [FromQuery] string? securityId, [FromQuery] string?assetClass) {
      var positions = await pts.GetPositionsAsync(asOfDate, securityId, assetClass);
      return Ok(positions);
    }
  }
}
