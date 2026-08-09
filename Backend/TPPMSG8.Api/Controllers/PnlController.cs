using Microsoft.AspNetCore.Mvc;
using TPPMSG8.Application.Interfaces;

namespace TPPMSG8.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PnlController : ControllerBase
    {
        private readonly IPnlService _pnlService;

        public PnlController(IPnlService pnlService)
        {
            _pnlService = pnlService;
        }

        [HttpGet]
        public async Task<IActionResult> GetPnl([FromQuery] DateOnly valuationDate, [FromQuery] string? securityId)
        {
            try
            {

                var pnlData = await _pnlService.GetPnlAsOfDateAsync(valuationDate, securityId);
                return Ok(pnlData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while calculating PnL.");
            }
        }
    }
}