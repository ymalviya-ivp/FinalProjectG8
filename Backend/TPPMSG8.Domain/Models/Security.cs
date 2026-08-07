using System;
using System.Collections.Generic;

namespace TPPMSG8.Domain.Models;

public partial class Security
{
    public string SecurityId { get; set; } = null!;

    public string SecurityName { get; set; } = null!;

    public string AssetClass { get; set; } = null!;

    public string Category { get; set; } = null!;

    public decimal? FaceValue { get; set; }

    public decimal? CouponRatePct { get; set; }

    public DateOnly? MaturityDate { get; set; }

    public decimal? StartPrice { get; set; }

    public virtual ICollection<EodPrice> EodPrices { get; set; } = new List<EodPrice>();

    public virtual ICollection<Trade> Trades { get; set; } = new List<Trade>();
}
