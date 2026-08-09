using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Serilog;
using TPPMSG8.Api.Middleware;
using TPPMSG8.Application.Interfaces;
using TPPMSG8.Application.Services;
using TPPMSG8.Infrastructure.DataAccess;
using TPPMSG8.Infrastructure.Repositories;
using TPPMSG8.Infrastructure.Respositories; 

namespace TPPMSG8.Api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            Log.Logger = new LoggerConfiguration()
                .ReadFrom.Configuration(builder.Configuration)
                .CreateLogger();
            
            builder.Host.UseSerilog();

            string connectionString = builder.Configuration.GetConnectionString("LogConn");
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new InvalidOperationException("A valid connection string for 'LogConn' must be provided via configuration or environment variables.");
            }

            builder.Services.AddDbContext<AppDbContext>(context => 
            {
                context.UseSqlServer(connectionString);
            });

            // 3. Secure CORS Configuration
            builder.Services.AddCors(options => {
                options.AddPolicy("MyCorsPolicy", policy => {
                    // TODO: Replace with your actual frontend URL (e.g., React/Angular app)
                    policy.WithOrigins("http://localhost:5173") 
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
            });

            // 4. Controllers & Features
            builder.Services.AddControllers().AddNewtonsoftJson();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddHealthChecks(); // Added infrastructure health checks

            // 5. Dependency Injection (Changed to Scoped to match DbContext lifecycle)
            // Note: If you renamed interfaces to *Repository as recommended earlier, update them here.
            builder.Services.AddScoped<ITrade, TradeRepository>();
            builder.Services.AddScoped<IEODPrice, EodPriceRepository>();
            builder.Services.AddScoped<ISecurity, SecurityRepository>();
            
            builder.Services.AddScoped<IPnlService, PnlService>();
            builder.Services.AddScoped<IPositionsTableService, PositionsTableService>();

            var app = builder.Build();

            // 6. Global Exception Middleware (Catches crashes and returns clean 500 JSON)
            app.UseMiddleware<ExceptionHandlingMiddleware>();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            // IMPORTANT: UseCors MUST be placed BEFORE UseAuthorization
            app.UseCors("MyCorsPolicy");
            
            app.UseAuthorization();

            app.MapControllers();
            app.MapHealthChecks("/health"); // Expose health status for load balancers

            app.Run();
        }
    }
}