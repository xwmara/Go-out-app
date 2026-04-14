using System.Net.Sockets;

namespace Go_OutAppBackend.Models
{
    public class Event
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public decimal Price { get; set; }
        public int AvailableSeats { get; set; }

        public int OrganizerId { get; set; }
        public User Organizer { get; set; } = null!;

        public List<Ticket> Tickets { get; set; } = new();
    }
}
