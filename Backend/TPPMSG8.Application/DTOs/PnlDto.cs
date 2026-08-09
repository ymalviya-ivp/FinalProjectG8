namespace TPPMSG8.Application.DTOs
{
    public class PnlDto
    {
        public string SecurityId { get; set; }
        public string SecurityTicker { get; set; }
        public decimal RealizedPnl { get; set; }
        public decimal UnrealizedPnl { get; set; }
        public decimal TotalPnl { get; set; }
    }
}