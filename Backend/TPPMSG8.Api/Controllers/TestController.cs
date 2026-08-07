using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TPPMSG8.Infrastructure.DataAccess;

namespace TPPMSG8.Api.Controllers {
  [Route("api/[controller]")]
  [ApiController]
  public class TestController : ControllerBase {
    AppDbContext db;
    public TestController(AppDbContext db) {
      this.db = db;
    }
    [HttpGet("trades/")]
    public IActionResult GetTrades() {
      var s = db.Trades.ToList();
      return Ok(s);
    }
  }
}
