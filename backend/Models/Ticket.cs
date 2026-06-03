namespace Go_OutAppBackend.Models
{
    public class Ticket
    {
        public int Id { get; set; }
        public int Quantity { get; set; }
        public string TicketTypeName { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        // Optional discount code applied at purchase time (null when none was used).
        public string? DiscountCode { get; set; }
        public DateTime PurchaseDate { get; set; } = DateTime.UtcNow;
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        public int EventId { get; set; }
        public Event Event { get; set; } = null!;
    }
}
