namespace Go_OutAppBackend.Models
{
    public class Event
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string VenueName { get; set; } = string.Empty;
        public string VenueAddress { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = "draft";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string ImageUrl { get; set; } = string.Empty;
        public string PerformersJson { get; set; } = "[]";
        public string TicketTypesJson { get; set; } = "[]";
        public DateTime Date { get; set; }
        public decimal Price { get; set; }
        public int AvailableSeats { get; set; }
        public int OrganizerId { get; set; }
        public User Organizer { get; set; } = null!;
        public List<Ticket> Tickets { get; set; } = new();
    }
}
