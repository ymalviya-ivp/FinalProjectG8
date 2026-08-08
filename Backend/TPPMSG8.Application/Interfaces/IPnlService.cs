using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TPPMSG8.Domain.DTOs;

namespace TPPMSG8.Application.Interfaces
{
    public interface IPnlService
    {
        Task<IEnumerable<PnlDto>> GetPnlAsOfDateAsync(DateTime valuationDate);
    }
}
