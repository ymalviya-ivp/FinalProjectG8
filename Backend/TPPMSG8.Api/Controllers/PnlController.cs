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
        public async Task<IActionResult> GetPnl([FromQuery] DateOnly? valuationDate)
        {
            try
            {
                // Default to the case study required date if none is provided
                if (valuationDate == default)
                {
                    valuationDate = new DateOnly(2026, 3, 31);
                }

                var pnlData = await _pnlService.GetPnlAsOfDateAsync(valuationDate);
                return Ok(pnlData);
            }
            catch (Exception ex)
            {
                // In a production app, log the exception here
                return StatusCode(500, "An error occurred while calculating PnL.");
            }
        }
    }
}