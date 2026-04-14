using System.Net.Sockets;
using Microsoft.Extensions.Logging;

namespace Go_OutAppBackend.Models
{
    public class User
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "User";

        public List<Event> OrganizedEvents { get; set; } = new();
        public List<Ticket> Tickets { get; set; } = new();
    }
}
