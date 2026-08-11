using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Serilog;
using TPPMSG8.Api.Middleware;
using TPPMSG8.Application.Interfaces;
using TPPMSG8.Application.Services;
using TPPMSG8.Domain.Models;
using TPPMSG8.Infrastructure.DataAccess;
using TPPMSG8.Infrastructure.Repositories;
using TPPMSG8.Infrastructure.Respositories;

namespace TPPMSG8.Api {
  public class Program {
    public static void Main(string[] args) {
      var builder = WebApplication.CreateBuilder(args);

      Log.Logger = new LoggerConfiguration()
          .ReadFrom.Configuration(builder.Configuration)
          .CreateLogger();

      builder.Host.UseSerilog();

      string connectionString = builder.Configuration.GetConnectionString("LogConn");
      if (string.IsNullOrWhiteSpace(connectionString)) {
        throw new InvalidOperationException("A valid connection string for 'LogConn' must be provided via configuration or environment variables.");
      }

      builder.Services.AddDbContext<AppDbContext>(context =>
      {
        context.UseSqlServer(connectionString);
      });

      builder.Services.AddCors(options => {
        options.AddPolicy("MyCorsPolicy", policy => {
          policy.WithOrigins("http://localhost:5173")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
      });

      builder.Services.AddControllers().AddNewtonsoftJson();
      builder.Services.AddEndpointsApiExplorer();
      builder.Services.AddSwaggerGen();
      builder.Services.AddHealthChecks();

      builder.Services.AddScoped<ITrade, TradeRepository>();
      builder.Services.AddScoped<IEODPrice, EodPriceRepository>();
      builder.Services.AddScoped<ISecurity, SecurityRepository>();
      builder.Services.AddScoped<IPnlService, PnlService>();
      builder.Services.AddScoped<IPositionsTableService, PositionsTableService>();
      builder.Services.AddScoped<IPositionsRepository, PositionsRepository>();

      var app = builder.Build();

      //app.UseMiddleware<ExceptionHandlingMiddleware>();
      app.UseSerilogRequestLogging();

      if (app.Environment.IsDevelopment()) {
        app.UseSwagger();
        app.UseSwaggerUI();
      }

      app.UseHttpsRedirection();
      app.UseCors("MyCorsPolicy");

      app.UseAuthorization();

      app.MapControllers();
      app.MapHealthChecks("/health");

      app.Run();
    }
  }
}