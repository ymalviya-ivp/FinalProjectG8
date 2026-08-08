using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TPPMSG8.Application.DTOs;
using TPPMSG8.Application.Interfaces;

namespace TPPMSG8.Api.Controllers {
  [Route("api/[controller]")]
  [ApiController]
  public class PositionsTableController : ControllerBase {
    IPositionsTableService pts;
    public PositionsTableController(IPositionsTableService pts) {
      this.pts = pts;
    }
    [HttpGet("positions")]
    public List<PositionsTableDto> GetPositions([FromQuery] DateOnly? AsOfDate) {
      var asOfDate = (AsOfDate == null) ? new DateOnly(2026, 3, 31) : AsOfDate;

      var positions = pts.GetPositions(asOfDate);
      return positions;
    }
  }
}
