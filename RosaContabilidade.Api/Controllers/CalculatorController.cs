using Microsoft.AspNetCore.Mvc;
using RosaContabilidade.Api.DTOs;
using RosaContabilidade.Api.Services;

namespace RosaContabilidade.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CalculatorController : ControllerBase
{
    private readonly CalculatorService _calculatorService;

    public CalculatorController(CalculatorService calculatorService)
    {
        _calculatorService = calculatorService;
    }

    /// <summary>
    /// Calcula estimativa de impostos (público, educativo)
    /// </summary>
    [HttpPost]
    public ActionResult<CalculatorResponse> Calcular([FromBody] CalculatorRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = _calculatorService.Calcular(request);
        return Ok(result);
    }
}
