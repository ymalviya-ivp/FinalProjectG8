using System.Net;
using System.Text.Json;

namespace TPPMSG8.Api.Middleware;

public class ExceptionHandlingMiddleware {
  private readonly RequestDelegate _next;
  private readonly ILogger<ExceptionHandlingMiddleware> _logger;

  public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger) {
    _next = next;
    _logger = logger;
  }

  public async Task InvokeAsync(HttpContext context) {
    try {
      await _next(context);
    } catch (Exception ex) {
      _logger.LogError(ex, "An unhandled exception occurred during the request.");
      await HandleExceptionAsync(context, ex);
    }
  }

  private static Task HandleExceptionAsync(HttpContext context, Exception exception) {
    context.Response.ContentType = "application/json";
    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

    var response = new {
      StatusCode = context.Response.StatusCode,
      Message = "An internal server error occurred. Please try again later.",
      // Note: You can expose exception.Message here if in Development, 
      // but keep it generic in Production for security.
    };

    return context.Response.WriteAsync(JsonSerializer.Serialize(response));
  }
}