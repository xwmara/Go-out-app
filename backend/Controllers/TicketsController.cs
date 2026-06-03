using Go_OutAppBackend.Data;
using Go_OutAppBackend.DTOs;
using Go_OutAppBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace Go_OutAppBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "client,admin")]
    public class TicketsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

        public TicketsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("me")]
        public async Task<ActionResult<IEnumerable<TicketDto>>> GetMyTickets()
        {
            var userId = GetCurrentUserId();
            if (userId is null)
            {
                return Unauthorized();
            }

            var tickets = await _context.Tickets
                .AsNoTracking()
                .Include(t => t.Event)
                .Where(t => t.UserId == userId.Value)
                .OrderByDescending(t => t.PurchaseDate)
                .ToListAsync();

            return Ok(tickets.Select(MapTicket));
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<TicketDto>> GetTicketById(int id)
        {
            var userId = GetCurrentUserId();
            if (userId is null)
            {
                return Unauthorized();
            }

            var ticket = await _context.Tickets
                .AsNoTracking()
                .Include(t => t.Event)
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId.Value);

            if (ticket == null)
            {
                return NotFound(new { message = "Ticket not found." });
            }

            return Ok(MapTicket(ticket));
        }

        [HttpGet("{id:int}/invoice")]
        public async Task<IActionResult> DownloadInvoice(int id)
        {
            var userId = GetCurrentUserId();
            if (userId is null)
            {
                return Unauthorized();
            }

            var ticket = await _context.Tickets
                .AsNoTracking()
                .Include(t => t.Event)
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId.Value);

            if (ticket == null)
            {
                return NotFound(new { message = "Ticket not found." });
            }

            var invoiceNumber = BuildInvoiceNumber(ticket);
            var ticketCode = BuildTicketCode(ticket);
            var total = ticket.UnitPrice * ticket.Quantity;
            var issueDate = ticket.PurchaseDate.ToString("dd.MM.yyyy HH:mm");
            var eventDate = ticket.Event.Date.ToString("dd.MM.yyyy HH:mm");

            var html = $@"<!doctype html>
<html lang=""ro"">
<head>
  <meta charset=""utf-8"" />
  <title>{invoiceNumber}</title>
  <style>
    body {{ font-family: Arial, sans-serif; margin: 40px; color: #0f172a; }}
    .card {{ border: 1px solid #e2e8f0; border-radius: 18px; padding: 24px; }}
    .muted {{ color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.18em; }}
    h1, h2 {{ margin: 0 0 12px; }}
    .row {{ display: flex; justify-content: space-between; gap: 24px; margin: 10px 0; }}
    .total {{ font-size: 22px; font-weight: 700; }}
  </style>
</head>
<body>
  <div class=""card"">
    <p class=""muted"">Factura Go-Out App</p>
    <h1>{invoiceNumber}</h1>
    <div class=""row""><span>Client</span><strong>{System.Net.WebUtility.HtmlEncode(ticket.User.FullName)}</strong></div>
    <div class=""row""><span>Email</span><strong>{System.Net.WebUtility.HtmlEncode(ticket.User.Email)}</strong></div>
    <div class=""row""><span>Data emitere</span><strong>{issueDate}</strong></div>
    <hr />
    <h2>{System.Net.WebUtility.HtmlEncode(ticket.Event.Title)}</h2>
    <div class=""row""><span>Locatie</span><strong>{System.Net.WebUtility.HtmlEncode(ticket.Event.City)}, {System.Net.WebUtility.HtmlEncode(ticket.Event.VenueName)}</strong></div>
    <div class=""row""><span>Data eveniment</span><strong>{eventDate}</strong></div>
    <div class=""row""><span>Tip bilet</span><strong>{System.Net.WebUtility.HtmlEncode(ticket.TicketTypeName)}</strong></div>
    <div class=""row""><span>Cantitate</span><strong>{ticket.Quantity}</strong></div>
    <div class=""row""><span>Pret unitar</span><strong>{ticket.UnitPrice:0.##} lei</strong></div>
    <div class=""row total""><span>Total</span><strong>{total:0.##} lei</strong></div>
    <hr />
    <div class=""row""><span>Cod bilet</span><strong>{ticketCode}</strong></div>
  </div>
</body>
</html>";

            return File(Encoding.UTF8.GetBytes(html), "text/html", $"{invoiceNumber}.html");
        }

        [HttpPost("purchase")]
        public async Task<ActionResult<TicketDto>> PurchaseTicket(PurchaseTicketDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId is null)
            {
                return Unauthorized();
            }

            if (!int.TryParse(dto.EventId, out var eventId))
            {
                return BadRequest(new { message = "Invalid event id." });
            }

            if (dto.Quantity <= 0)
            {
                return BadRequest(new { message = "Quantity must be greater than zero." });
            }

            var eventEntity = await _context.Events.FirstOrDefaultAsync(e => e.Id == eventId && e.Status == "published");
            if (eventEntity is null)
            {
                return NotFound(new { message = "Event not found." });
            }

            // Resolve the selected ticket type from the event's JSON definition (if any).
            var ticketTypes = DeserializeTicketTypes(eventEntity.TicketTypesJson);
            EventTicketTypeDto? selected = null;
            if (ticketTypes.Count > 0)
            {
                selected = ticketTypes.FirstOrDefault(t => !string.IsNullOrEmpty(dto.TicketTypeId) && t.Id == dto.TicketTypeId)
                    ?? ticketTypes.FirstOrDefault(t => t.Name == dto.TicketTypeName)
                    ?? ticketTypes.FirstOrDefault();
            }

            decimal unitPrice;
            if (selected != null)
            {
                // Server-side sold-out / availability validation (cannot be bypassed by direct requests).
                var soldOut = selected.SoldOut || (selected.AvailableQuantity.HasValue && selected.AvailableQuantity.Value <= 0);
                if (soldOut)
                {
                    return BadRequest(new { message = "Acest tip de bilet este SOLD OUT." });
                }

                if (selected.AvailableQuantity.HasValue && selected.AvailableQuantity.Value < dto.Quantity)
                {
                    return BadRequest(new { message = "Nu mai sunt suficiente bilete disponibile pentru acest tip." });
                }

                // Authoritative price comes from the server, not from the client payload.
                unitPrice = selected.Price;
            }
            else
            {
                // Legacy single-price event: rely on the aggregate seat pool.
                if (eventEntity.AvailableSeats < dto.Quantity)
                {
                    return BadRequest(new { message = "Not enough tickets available." });
                }

                unitPrice = eventEntity.Price > 0 ? eventEntity.Price : dto.UnitPrice;
            }

            // Optional discount code, validated and applied server-side.
            string? appliedDiscountCode = null;
            var subtotal = unitPrice * dto.Quantity;
            var effectiveTotal = subtotal;

            if (!string.IsNullOrWhiteSpace(dto.DiscountCode))
            {
                var normalizedCode = dto.DiscountCode.Trim().ToUpperInvariant();
                var discount = await _context.Discounts
                    .FirstOrDefaultAsync(d => d.Code == normalizedCode && (d.EventId == null || d.EventId == eventId));

                if (discount is null)
                {
                    return BadRequest(new { message = "Codul de reducere nu exista." });
                }

                var validationError = discount.GetValidationError(eventId, DateTime.UtcNow);
                if (validationError != null)
                {
                    return BadRequest(new { message = validationError });
                }

                var discountAmount = discount.ComputeDiscount(subtotal);
                effectiveTotal = Math.Max(0m, subtotal - discountAmount);
                discount.UsedCount += 1;
                appliedDiscountCode = discount.Code;
            }

            var effectiveUnitPrice = dto.Quantity > 0
                ? Math.Round(effectiveTotal / dto.Quantity, 2, MidpointRounding.AwayFromZero)
                : effectiveTotal;

            var ticket = new Ticket
            {
                EventId = eventEntity.Id,
                UserId = userId.Value,
                Quantity = dto.Quantity,
                TicketTypeName = selected?.Name ?? (string.IsNullOrWhiteSpace(dto.TicketTypeName) ? "General Access" : dto.TicketTypeName),
                UnitPrice = effectiveUnitPrice,
                DiscountCode = appliedDiscountCode,
                PurchaseDate = DateTime.UtcNow
            };

            // Decrement stock: per-type when tracked, plus the aggregate seat pool for overview continuity.
            if (selected != null && selected.AvailableQuantity.HasValue)
            {
                selected.AvailableQuantity = Math.Max(0, selected.AvailableQuantity.Value - dto.Quantity);
                if (selected.AvailableQuantity.Value <= 0)
                {
                    selected.SoldOut = true;
                }

                eventEntity.TicketTypesJson = JsonSerializer.Serialize(ticketTypes, JsonOptions);
            }

            eventEntity.AvailableSeats = Math.Max(0, eventEntity.AvailableSeats - dto.Quantity);

            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();

            await _context.Entry(ticket).Reference(t => t.Event).LoadAsync();
            return Ok(MapTicket(ticket));
        }

        private static List<EventTicketTypeDto> DeserializeTicketTypes(string? json)
        {
            if (string.IsNullOrWhiteSpace(json))
            {
                return new List<EventTicketTypeDto>();
            }

            try
            {
                return JsonSerializer.Deserialize<List<EventTicketTypeDto>>(json, JsonOptions) ?? new List<EventTicketTypeDto>();
            }
            catch
            {
                return new List<EventTicketTypeDto>();
            }
        }

        private int? GetCurrentUserId()
        {
            var claimValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(claimValue, out var userId) ? userId : null;
        }

        private TicketDto MapTicket(Ticket ticket)
        {
            var ticketCode = BuildTicketCode(ticket);
            var qrCodeValue = BuildQrCodeValue(ticket);
            var invoiceNumber = BuildInvoiceNumber(ticket);
            var invoiceUrl = $"{Request.Scheme}://{Request.Host}/api/Tickets/{ticket.Id}/invoice";

            return new TicketDto
            {
                Id = ticket.Id.ToString(),
                EventId = ticket.EventId.ToString(),
                UserId = ticket.UserId.ToString(),
                EventTitle = ticket.Event.Title,
                EventDate = ticket.Event.Date.ToString("O"),
                EventCity = ticket.Event.City,
                VenueName = ticket.Event.VenueName,
                TicketTypeName = ticket.TicketTypeName,
                Quantity = ticket.Quantity,
                UnitPrice = ticket.UnitPrice,
                TotalPrice = ticket.UnitPrice * ticket.Quantity,
                DiscountCode = ticket.DiscountCode,
                PurchasedAt = ticket.PurchaseDate.ToString("O"),
                TicketCode = ticketCode,
                QrCodeValue = qrCodeValue,
                QrCodeUrl = $"https://api.qrserver.com/v1/create-qr-code/?size=280x280&data={Uri.EscapeDataString(qrCodeValue)}",
                InvoiceNumber = invoiceNumber,
                InvoiceUrl = invoiceUrl
            };
        }

        private static string BuildTicketCode(Ticket ticket)
        {
            return $"GOOUT-{ticket.EventId:D4}-{ticket.UserId:D4}-{ticket.Id:D6}";
        }

        private static string BuildInvoiceNumber(Ticket ticket)
        {
            return $"INV-{ticket.PurchaseDate:yyyyMMdd}-{ticket.Id:D6}";
        }

        private static string BuildQrCodeValue(Ticket ticket)
        {
            return $"GOOUT|{BuildTicketCode(ticket)}|EVENT:{ticket.EventId}|USER:{ticket.UserId}|QTY:{ticket.Quantity}|DATE:{ticket.PurchaseDate:yyyyMMddHHmmss}";
        }
    }
}
