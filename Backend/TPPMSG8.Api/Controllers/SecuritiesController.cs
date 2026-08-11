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
      try {
        var ids = await _securityRepository.GetDistinctSecuritiesAsync();
        return Ok(ids);
      } catch (Exception ex) {
        return StatusCode(500, $"An error occurred while fetching security IDs. {ex}");
      }
    }

    [HttpGet("assetClasses")]
    public async Task<IActionResult> GetAssetClasses() {
      try {
        var classes = await _securityRepository.GetDistinctAssetClassesAsync(); 
        return Ok(classes);       
      } catch (Exception ex) {
        return StatusCode(500, $"An error occurred while fetching security IDs. {ex}");
      }
    }
  }
}