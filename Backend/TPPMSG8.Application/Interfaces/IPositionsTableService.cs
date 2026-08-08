using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TPPMSG8.Application.DTOs;

namespace TPPMSG8.Application.Interfaces {
  public interface IPositionsTableService {
    public List<PositionsTableDto> GetPositions(DateOnly? AsOfdate);
  }
}
