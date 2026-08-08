namespace TPPMSG8.Domain.DTOs
{
    public class PnlDto
    {
        public string SecurityId { get; set; } = string.Empty;
        public string SecurityTicker { get; set; } = string.Empty;
        public decimal RealizedPnl { get; set; }
        public decimal UnrealizedPnl { get; set; }
        public decimal TotalPnl { get; set; }
    }
}