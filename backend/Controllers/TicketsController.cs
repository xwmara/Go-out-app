using Go_OutAppBackend.Data;
using Go_OutAppBackend.DTOs;
using Go_OutAppBackend.Models;
using Go_OutAppBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net;
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
        private readonly IConfiguration _configuration;
        private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

        public TicketsController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
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
            var pdf = InvoicePdfGenerator.Generate(ticket, invoiceNumber, BuildTicketCode(ticket));

            return File(pdf, "application/pdf", $"{invoiceNumber}.pdf");
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
                var soldOut = selected.SoldOut || (selected.AvailableQuantity.HasValue && selected.AvailableQuantity.Value <= 0);
                if (soldOut)
                {
                    return BadRequest(new { message = "Acest tip de bilet este SOLD OUT." });
                }

                if (selected.AvailableQuantity.HasValue && selected.AvailableQuantity.Value < dto.Quantity)
                {
                    return BadRequest(new { message = "Nu mai sunt suficiente bilete disponibile pentru acest tip." });
                }

                unitPrice = selected.Price;
            }
            else
            {
                if (eventEntity.AvailableSeats < dto.Quantity)
                {
                    return BadRequest(new { message = "Not enough tickets available." });
                }

                unitPrice = eventEntity.Price > 0 ? eventEntity.Price : dto.UnitPrice;
            }

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
            await _context.Entry(ticket).Reference(t => t.User).LoadAsync();

            try
            {
                var invoiceNumber = BuildInvoiceNumber(ticket);
                var invoicePdf = InvoicePdfGenerator.Generate(ticket, invoiceNumber, BuildTicketCode(ticket));
                await EmailSender.TrySendAsync(
                    _configuration,
                    ticket.User.Email,
                    $"Biletul tau pentru {ticket.Event.Title}",
                    BuildPurchaseEmailBody(ticket),
                    $"factura-{invoiceNumber}.pdf",
                    invoicePdf,
                    "application/pdf");
            }
            catch
            {
            }

            return Ok(MapTicket(ticket));
        }

        private static string BuildPurchaseEmailBody(Ticket ticket)
        {
            var ticketCode = BuildTicketCode(ticket);
            var qrCodeValue = BuildQrCodeValue(ticket);
            var qrCodeUrl = $"https://api.qrserver.com/v1/create-qr-code/?size=280x280&data={Uri.EscapeDataString(qrCodeValue)}";
            var total = ticket.UnitPrice * ticket.Quantity;
            var eventDate = ticket.Event.Date.ToString("dd.MM.yyyy HH:mm");

            return $@"<!doctype html>
<html lang=""ro"">
  <body style=""margin:0;padding:24px;background:#f5f5f7;font-family:Arial,sans-serif;color:#111827;"">
    <div style=""max-width:620px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px;border:1px solid #e5e7eb;"">
      <p style=""margin:0 0 10px;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#b71e4c;font-weight:700;"">Go-Out App - bilet confirmat</p>
      <h1 style=""margin:0 0 16px;font-size:26px;line-height:1.2;"">{WebUtility.HtmlEncode(ticket.Event.Title)}</h1>
      <p style=""margin:0 0 18px;font-size:16px;line-height:1.6;"">Buna, {WebUtility.HtmlEncode(ticket.User.FullName)}! Biletul tau a fost confirmat. Prezinta codul QR de mai jos la intrare.</p>
      <div style=""background:#f9fafb;border-radius:12px;padding:16px;margin:0 0 20px;"">
        <p style=""margin:0 0 8px;""><strong>Data:</strong> {eventDate}</p>
        <p style=""margin:0 0 8px;""><strong>Locatie:</strong> {WebUtility.HtmlEncode(ticket.Event.City)}, {WebUtility.HtmlEncode(ticket.Event.VenueName)}</p>
        <p style=""margin:0 0 8px;""><strong>Tip bilet:</strong> {WebUtility.HtmlEncode(ticket.TicketTypeName)}</p>
        <p style=""margin:0 0 8px;""><strong>Cantitate:</strong> {ticket.Quantity}</p>
        <p style=""margin:0 0 8px;""><strong>Total:</strong> {total:0.##} lei</p>
        <p style=""margin:0;""><strong>Cod bilet:</strong> {ticketCode}</p>
      </div>
      <div style=""text-align:center;margin:0 0 20px;"">
        <img src=""{qrCodeUrl}"" alt=""Cod QR bilet"" width=""240"" height=""240"" style=""border-radius:12px;background:#ffffff;"" />
      </div>
      <p style=""margin:0;font-size:14px;line-height:1.6;color:#4b5563;"">Factura este atasata acestui email. Te asteptam la eveniment!</p>
    </div>
  </body>
</html>";
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
