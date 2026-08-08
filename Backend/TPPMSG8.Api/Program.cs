
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.EntityFrameworkCore;
using TPPMSG8.Application.DTOs;
using TPPMSG8.Application.Interfaces;
using TPPMSG8.Infrastructure;
using TPPMSG8.Infrastructure.DataAccess;
using TPPMSG8.Infrastructure.Respositories;
using TPPMSG8.Application.Interfaces;

namespace TPPMSG8.Api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
   
            // Add services to the container.
            string ConnectionString = builder.Configuration.GetConnectionString("LogConn");
            builder.Services.AddDbContext<AppDbContext>(
              context => {
                context.UseSqlServer(ConnectionString);
              }
            );
            builder.Services.AddCors(options => {
              options.AddPolicy("MyCorsPolicy", policy => {
                policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
              });
            });
            builder.Services.AddControllers().AddNewtonsoftJson();
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddTransient<ITrade, TradeRepository>();
            builder.Services.AddScoped<IPositionsTableService, PositionsTableService>();
            var app = builder.Build();
            
            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();

            app.UseCors("MyCorsPolicy");
  
            app.MapControllers();
            app.Run();
        }
    }
}
