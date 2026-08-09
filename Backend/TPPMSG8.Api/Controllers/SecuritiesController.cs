// TPPMSG8.Api.Controllers.SecuritiesController.cs
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using TPPMSG8.Application.Interfaces;
using TPPMSG8.Infrastructure.Respositories;

namespace TPPMSG8.Api.Controllers {
  [Route("api/[controller]")]
  [ApiController]
  public class SecuritiesController : ControllerBase {
    private readonly ISecurity _securityRepository;

    public SecuritiesController(ISecurity securityRepository) {
      _securityRepository = securityRepository;
    }

    [HttpGet("securityIds")]
    public async Task<IActionResult> GetSecurityIds() {
      // E.g., returns ["EQ01", "EQ02", "FI01"]
      var ids = await _securityRepository.GetDistinctSecuritiesAsync();
      return Ok(ids);
    }

    [HttpGet("assetClasses")]
    public async Task<IActionResult> GetAssetClasses() {
      var classes = await _securityRepository.GetDistinctAssetClassesAsync();
      return Ok(classes);
    }
  }
}