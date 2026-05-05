using System.Text.Json.Serialization;

namespace Go_OutAppBackend.DTOs
{
    public class EventTicketTypeDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
    }

    public class EventDto
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string VenueName { get; set; } = string.Empty;
        public string VenueAddress { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = "draft";
        public string? OrganizerId { get; set; }
        public string CreatedAt { get; set; } = string.Empty;
        public decimal? TicketPrice { get; set; }
        public int? AvailableTickets { get; set; }
        public string? ImageUrl { get; set; }
        public List<string>? Performers { get; set; }
        public List<EventTicketTypeDto>? TicketTypes { get; set; }
    }

    public class CreateEventDto
    {
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string VenueName { get; set; } = string.Empty;
        public string VenueAddress { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public List<string>? Performers { get; set; }
        public List<EventTicketTypeDto>? TicketTypes { get; set; }
        public int? AvailableTickets { get; set; }
    }

    public class UpdateEventStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }

    public class PurchaseTicketDto
    {
        public string EventId { get; set; } = string.Empty;
        public string TicketTypeName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }

    public class TicketDto
    {
        public string Id { get; set; } = string.Empty;
        public string EventId { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string EventTitle { get; set; } = string.Empty;
        public string EventDate { get; set; } = string.Empty;
        public string EventCity { get; set; } = string.Empty;
        public string VenueName { get; set; } = string.Empty;
        public string TicketTypeName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public string PurchasedAt { get; set; } = string.Empty;
        public string TicketCode { get; set; } = string.Empty;
        public string QrCodeValue { get; set; } = string.Empty;
        public string QrCodeUrl { get; set; } = string.Empty;
        public string InvoiceNumber { get; set; } = string.Empty;
        public string InvoiceUrl { get; set; } = string.Empty;
    }
}
