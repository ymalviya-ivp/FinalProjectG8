using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TPPMSG8.Application.DTOs {
  public class PositionsTableDto {
    public string SecurityId { get; set; }
    public string SecurityName { get; set; }
    public string AssetClass { get; set; }
    public int NetQuantity { get; set; }
    public decimal AverageCost { get; set; }
  }
}
