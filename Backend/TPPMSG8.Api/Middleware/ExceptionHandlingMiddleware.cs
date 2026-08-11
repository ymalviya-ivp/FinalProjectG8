using System.Net;
using System.Text.Json;

namespace TPPMSG8.Api.Middleware;

public class ExceptionHandlingMiddleware : IMiddleware {
  private readonly ILogger<ExceptionHandlingMiddleware> _logger;

  public ExceptionHandlingMiddleware(ILogger<ExceptionHandlingMiddleware> logger) {
    _logger = logger;
  }

  public async Task InvokeAsync(HttpContext context, RequestDelegate next) {
    try {
      await next(context);
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
    };

    return context.Response.WriteAsync(JsonSerializer.Serialize(response));
  }
}