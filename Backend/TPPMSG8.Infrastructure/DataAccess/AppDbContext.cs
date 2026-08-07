using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using TPPMSG8.Domain.Models;

namespace TPPMSG8.Infrastructure.DataAccess;

public partial class AppDbContext : DbContext
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<EodPrice> EodPrices { get; set; }

    public virtual DbSet<Security> Securities { get; set; }

    public virtual DbSet<Trade> Trades { get; set; }

    public virtual DbSet<Trader> Traders { get; set; }

    //protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    //    => optionsBuilder.UseSqlServer("Server=192.168.0.13\\sqlexpress,49753; Database=TPPMSG8; User Id = sa; Password = sa@12345678; TrustServerCertificate=true;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<EodPrice>(entity =>
        {
            entity.HasKey(e => new { e.SecurityId, e.PriceDate });

            entity.ToTable("EOD_Prices", "G8");

            entity.Property(e => e.SecurityId)
                .HasMaxLength(10)
                .HasColumnName("SecurityID");
            entity.Property(e => e.ClosePrice).HasColumnType("decimal(15, 4)");

            entity.HasOne(d => d.Security).WithMany(p => p.EodPrices)
                .HasForeignKey(d => d.SecurityId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_EOD_Prices_Securities");
        });

        modelBuilder.Entity<Security>(entity =>
        {
            entity.ToTable("Securities", "G8");

            entity.Property(e => e.SecurityId)
                .HasMaxLength(10)
                .HasColumnName("SecurityID");
            entity.Property(e => e.AssetClass).HasMaxLength(50);
            entity.Property(e => e.Category).HasMaxLength(50);
            entity.Property(e => e.CouponRatePct).HasColumnType("decimal(7, 4)");
            entity.Property(e => e.FaceValue).HasColumnType("decimal(15, 4)");
            entity.Property(e => e.SecurityName).HasMaxLength(200);
            entity.Property(e => e.StartPrice).HasColumnType("decimal(15, 4)");
        });

        modelBuilder.Entity<Trade>(entity =>
        {
            entity.ToTable("Trades", "G8");

            entity.Property(e => e.TradeId)
                .ValueGeneratedNever()
                .HasColumnName("TradeID");
            entity.Property(e => e.BuySell)
                .HasMaxLength(4)
                .IsUnicode(false);
            entity.Property(e => e.Price).HasColumnType("decimal(15, 4)");
            entity.Property(e => e.SecurityId)
                .HasMaxLength(10)
                .HasColumnName("SecurityID");
            entity.Property(e => e.TraderId).HasColumnName("TraderID");

            entity.HasOne(d => d.Security).WithMany(p => p.Trades)
                .HasForeignKey(d => d.SecurityId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Trades_Securities");

            entity.HasOne(d => d.Trader).WithMany(p => p.Trades)
                .HasForeignKey(d => d.TraderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Trades_Traders");
        });

        modelBuilder.Entity<Trader>(entity =>
        {
            entity.ToTable("Traders", "G8");

            entity.Property(e => e.TraderId)
                .ValueGeneratedNever()
                .HasColumnName("TraderID");
            entity.Property(e => e.Desk).HasMaxLength(50);
            entity.Property(e => e.TraderName).HasMaxLength(50);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
