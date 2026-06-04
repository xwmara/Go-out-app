using Go_OutAppBackend.Data;
using Go_OutAppBackend.DTOs;
using Go_OutAppBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Net;
using System.Net.Mail;
using System.Security.Claims;
using System.Text.Json;

namespace Go_OutAppBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

        public EventsController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpGet("published")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<EventDto>>> GetPublishedEvents()
        {
            var events = await _context.Events
                .AsNoTracking()
                .Where(e => e.Status == "published")
                .OrderBy(e => e.Date)
                .ToListAsync();

            return Ok(events.Select(MapEvent));
        }

        [HttpGet("organizer/me")]
        [Authorize(Roles = "organizer,admin")]
        public async Task<ActionResult<IEnumerable<EventDto>>> GetOrganizerEvents()
        {
            var organizerId = GetCurrentUserId();
            if (organizerId is null)
            {
                return Unauthorized();
            }

            var events = await _context.Events
                .AsNoTracking()
                .Where(e => e.OrganizerId == organizerId.Value)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();

            return Ok(events.Select(MapEvent));
        }

        [HttpGet("{id:int}")]
        [AllowAnonymous]
        public async Task<ActionResult<EventDto>> GetEventById(int id)
        {
            var eventEntity = await _context.Events
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == id);

            if (eventEntity is null)
            {
                return NotFound(new { message = "Event not found." });
            }

            if (eventEntity.Status != "published")
            {
                var organizerId = GetCurrentUserId();
                var isAdmin = User.IsInRole("admin");
                if (!isAdmin && organizerId != eventEntity.OrganizerId)
                {
                    return NotFound(new { message = "Event not found." });
                }
            }

            return Ok(MapEvent(eventEntity));
        }

        [HttpGet("{id:int}/image")]
        [AllowAnonymous]
        public async Task<IActionResult> GetEventImage(int id)
        {
            var eventEntity = await _context.Events
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == id);

            if (eventEntity is null || string.IsNullOrWhiteSpace(eventEntity.ImageUrl))
            {
                return NotFound();
            }

            var raw = eventEntity.ImageUrl;

            // Stored as a base64 data URL ("data:<mime>;base64,<data>") -> decode and stream as a real image.
            if (raw.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
            {
                var commaIndex = raw.IndexOf(',');
                if (commaIndex < 0)
                {
                    return NotFound();
                }

                var meta = raw.Substring(5, commaIndex - 5);
                var contentType = meta.Split(';')[0];
                if (string.IsNullOrWhiteSpace(contentType))
                {
                    contentType = "image/jpeg";
                }

                byte[] bytes;
                try
                {
                    bytes = Convert.FromBase64String(raw[(commaIndex + 1)..]);
                }
                catch
                {
                    return NotFound();
                }

                Response.Headers.CacheControl = "public, max-age=3600";
                return File(bytes, contentType);
            }

            // Otherwise it's already a normal URL.
            return Redirect(raw);
        }

        [HttpGet("{id:int}/overview")]
        [Authorize(Roles = "organizer,admin")]
        public async Task<ActionResult<OrganizerEventOverviewDto>> GetOrganizerOverview(int id)
        {
            var eventEntity = await _context.Events
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == id);

            if (eventEntity is null)
            {
                return NotFound(new { message = "Event not found." });
            }

            if (!CanManageEvent(eventEntity))
            {
                return Forbid();
            }

            var tickets = await _context.Tickets
                .AsNoTracking()
                .Include(t => t.User)
                .Where(t => t.EventId == id)
                .OrderByDescending(t => t.PurchaseDate)
                .ToListAsync();

            var culture = CultureInfo.GetCultureInfo("ro-RO");
            var salesTimeline = tickets
                .GroupBy(ticket => new DateTime(ticket.PurchaseDate.Year, ticket.PurchaseDate.Month, ticket.PurchaseDate.Day, ticket.PurchaseDate.Hour, 0, 0, DateTimeKind.Utc))
                .OrderBy(group => group.Key)
                .Select(group => new OrganizerEventSalesPointDto
                {
                    BucketStart = group.Key.ToString("O"),
                    Label = group.Key.ToLocalTime().ToString("dd MMM HH:mm", culture),
                    TicketsSold = group.Sum(ticket => ticket.Quantity),
                    Revenue = group.Sum(ticket => ticket.UnitPrice * ticket.Quantity)
                })
                .ToList();

            var overview = new OrganizerEventOverviewDto
            {
                Event = MapEvent(eventEntity),
                TicketsSold = tickets.Sum(ticket => ticket.Quantity),
                Revenue = tickets.Sum(ticket => ticket.UnitPrice * ticket.Quantity),
                OrdersCount = tickets.Count,
                AvailableTickets = eventEntity.AvailableSeats,
                SalesTimeline = salesTimeline,
                RecentOrders = tickets
                    .Take(12)
                    .Select(ticket => new OrganizerEventOrderDto
                    {
                        TicketId = ticket.Id.ToString(),
                        CustomerName = ticket.User.FullName,
                        CustomerEmail = ticket.User.Email,
                        TicketTypeName = ticket.TicketTypeName,
                        Quantity = ticket.Quantity,
                        TotalPrice = ticket.UnitPrice * ticket.Quantity,
                        PurchasedAt = ticket.PurchaseDate.ToString("O")
                    })
                    .ToList()
            };

            return Ok(overview);
        }

        [HttpPost]
        [Authorize(Roles = "organizer,admin")]
        public async Task<ActionResult<EventDto>> CreateEvent(CreateEventDto dto)
        {
            var organizerId = GetCurrentUserId();
            if (organizerId is null)
            {
                return Unauthorized();
            }

            var eventEntity = BuildEventEntity(dto, organizerId.Value, null);
            _context.Events.Add(eventEntity);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEventById), new { id = eventEntity.Id }, MapEvent(eventEntity));
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "organizer,admin")]
        public async Task<ActionResult<EventDto>> UpdateEvent(int id, CreateEventDto dto)
        {
            var eventEntity = await _context.Events.FirstOrDefaultAsync(e => e.Id == id);
            if (eventEntity is null)
            {
                return NotFound(new { message = "Event not found." });
            }

            if (!CanManageEvent(eventEntity))
            {
                return Forbid();
            }

            UpdateEventEntity(eventEntity, dto);
            await _context.SaveChangesAsync();

            return Ok(MapEvent(eventEntity));
        }

        [HttpPatch("{id:int}/status")]
        [Authorize(Roles = "organizer,admin")]
        public async Task<ActionResult<EventDto>> UpdateStatus(int id, UpdateEventStatusDto dto)
        {
            var eventEntity = await _context.Events.FirstOrDefaultAsync(e => e.Id == id);
            if (eventEntity is null)
            {
                return NotFound(new { message = "Event not found." });
            }

            if (!CanManageEvent(eventEntity))
            {
                return Forbid();
            }

            if (dto.Status != "draft" && dto.Status != "published")
            {
                return BadRequest(new { message = "Invalid status." });
            }

            // Once an event has been published, it can no longer be moved back to draft.
            if (dto.Status == "draft" && eventEntity.PublishedAt != null)
            {
                return BadRequest(new { message = "Evenimentul a fost deja publicat si nu mai poate reveni la draft. Il poti edita sau sterge." });
            }

            eventEntity.Status = dto.Status;
            if (dto.Status == "published" && eventEntity.PublishedAt == null)
            {
                eventEntity.PublishedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return Ok(MapEvent(eventEntity));
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "organizer,admin")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            var eventEntity = await _context.Events.FirstOrDefaultAsync(e => e.Id == id);
            if (eventEntity is null)
            {
                return NotFound(new { message = "Event not found." });
            }

            if (!CanManageEvent(eventEntity))
            {
                return Forbid();
            }

            var relatedTickets = await _context.Tickets.Where(ticket => ticket.EventId == id).ToListAsync();
            if (relatedTickets.Count > 0)
            {
                _context.Tickets.RemoveRange(relatedTickets);
            }

            _context.Events.Remove(eventEntity);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("{id:int}/invitations")]
        [Authorize(Roles = "organizer,admin")]
        public async Task<IActionResult> SendInvitation(int id, SendInvitationDto dto)
        {
            var eventEntity = await _context.Events
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == id);

            if (eventEntity is null)
            {
                return NotFound(new { message = "Event not found." });
            }

            if (!CanManageEvent(eventEntity))
            {
                return Forbid();
            }

            var recipientEmail = dto.Email.Trim();
            if (string.IsNullOrWhiteSpace(recipientEmail))
            {
                return BadRequest(new { message = "Email-ul destinatarului este obligatoriu." });
            }

            try
            {
                _ = new MailAddress(recipientEmail);
            }
            catch
            {
                return BadRequest(new { message = "Email-ul destinatarului nu este valid." });
            }

            if (dto.Quantity <= 0)
            {
                return BadRequest(new { message = "Cantitatea trebuie sa fie cel putin 1." });
            }

            if (dto.InvitationType == "nominal" && (string.IsNullOrWhiteSpace(dto.FirstName) || string.IsNullOrWhiteSpace(dto.LastName)))
            {
                return BadRequest(new { message = "Completeaza numele si prenumele pentru invitatia nominala." });
            }

            var smtpHost = _configuration["Smtp:Host"];
            var smtpPort = _configuration.GetValue<int?>("Smtp:Port") ?? 587;
            var smtpUsername = _configuration["Smtp:Username"];
            var smtpPassword = _configuration["Smtp:Password"];
            var smtpFromName = _configuration["Smtp:FromName"] ?? "Go-Out";

            if (string.IsNullOrWhiteSpace(smtpHost) || string.IsNullOrWhiteSpace(smtpUsername) || string.IsNullOrWhiteSpace(smtpPassword) || smtpUsername == "adresa-ta@gmail.com" || smtpPassword == "app-password-ul-de-la-google")
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Configuratia SMTP nu este setata. Pune adresa Gmail reala si App Password-ul in appsettings.Development.json, apoi reporneste backend-ul." });
            }

            var invitationLabel = dto.InvitationType switch
            {
                "open" => "invitatie nenominala",
                "guestlist" => "guestlist",
                _ => "invitatie nominala"
            };

            var guestName = dto.InvitationType == "nominal"
                ? $"{dto.FirstName.Trim()} {dto.LastName.Trim()}".Trim()
                : "Invitat";

            var ticketTypeName = string.IsNullOrWhiteSpace(dto.TicketTypeName) ? "General Access" : dto.TicketTypeName.Trim();
            var subject = $"Invitatie la {eventEntity.Title}";
            var body = BuildInvitationEmailBody(eventEntity, invitationLabel, guestName, ticketTypeName, dto.Quantity);

            using var message = new MailMessage
            {
                From = new MailAddress(smtpUsername, smtpFromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            message.To.Add(recipientEmail);

            using var smtpClient = new SmtpClient(smtpHost, smtpPort)
            {
                Credentials = new NetworkCredential(smtpUsername, smtpPassword),
                EnableSsl = true
            };

            try
            {
                await smtpClient.SendMailAsync(message);
            }
            catch (SmtpException)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Email-ul nu a putut fi trimis. Verifica adresa Gmail, App Password-ul si ca 2-Step Verification este activat." });
            }
            catch (InvalidOperationException)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Configuratia SMTP este invalida. Verifica Host, Port, Username si Password." });
            }

            return Ok(new { message = "Invitatia a fost trimisa pe email." });
        }

        [HttpPost("{id:int}/notifications")]
        [Authorize(Roles = "organizer,admin")]
        public async Task<IActionResult> SendNotification(int id, SendNotificationDto dto)
        {
            var eventEntity = await _context.Events
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == id);

            if (eventEntity is null)
            {
                return NotFound(new { message = "Event not found." });
            }

            if (!CanManageEvent(eventEntity))
            {
                return Forbid();
            }

            var subject = dto.Subject.Trim();
            var description = dto.Description.Trim();

            if (string.IsNullOrWhiteSpace(subject) || string.IsNullOrWhiteSpace(description))
            {
                return BadRequest(new { message = "Completeaza subiectul si descrierea notificarii." });
            }

            var smtpHost = _configuration["Smtp:Host"];
            var smtpPort = _configuration.GetValue<int?>("Smtp:Port") ?? 587;
            var smtpUsername = _configuration["Smtp:Username"];
            var smtpPassword = _configuration["Smtp:Password"];
            var smtpFromName = _configuration["Smtp:FromName"] ?? "Go-Out";

            if (string.IsNullOrWhiteSpace(smtpHost) || string.IsNullOrWhiteSpace(smtpUsername) || string.IsNullOrWhiteSpace(smtpPassword) || smtpUsername == "adresa-ta@gmail.com" || smtpPassword == "app-password-ul-de-la-google")
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Configuratia SMTP nu este setata. Pune adresa Gmail reala si App Password-ul in appsettings.Development.json, apoi reporneste backend-ul." });
            }

            var recipients = await _context.Tickets
                .AsNoTracking()
                .Include(ticket => ticket.User)
                .Where(ticket => ticket.EventId == id)
                .Select(ticket => ticket.User.Email)
                .Distinct()
                .ToListAsync();

            if (recipients.Count == 0)
            {
                return BadRequest(new { message = "Nu exista clienti cu bilete cumparate pentru acest eveniment." });
            }

            var body = BuildNotificationEmailBody(eventEntity, subject, description);

            using var smtpClient = new SmtpClient(smtpHost, smtpPort)
            {
                Credentials = new NetworkCredential(smtpUsername, smtpPassword),
                EnableSsl = true
            };

            try
            {
                foreach (var recipient in recipients)
                {
                    using var message = new MailMessage
                    {
                        From = new MailAddress(smtpUsername, smtpFromName),
                        Subject = subject,
                        Body = body,
                        IsBodyHtml = true
                    };
                    message.To.Add(recipient);
                    await smtpClient.SendMailAsync(message);
                }
            }
            catch (SmtpException)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Notificarea nu a putut fi trimisa. Verifica adresa Gmail, App Password-ul si ca 2-Step Verification este activat." });
            }
            catch (InvalidOperationException)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Configuratia SMTP este invalida. Verifica Host, Port, Username si Password." });
            }

            return Ok(new { message = $"Notificarea a fost trimisa catre {recipients.Count} clienti." });
        }
        private Event BuildEventEntity(CreateEventDto dto, int organizerId, Event? existing)
        {
            var eventEntity = existing ?? new Event
            {
                OrganizerId = organizerId,
                Status = existing?.Status ?? "draft",
                CreatedAt = existing?.CreatedAt ?? DateTime.UtcNow
            };

            UpdateEventEntity(eventEntity, dto);
            return eventEntity;
        }

        private void UpdateEventEntity(Event eventEntity, CreateEventDto dto)
        {
            var ticketTypes = dto.TicketTypes ?? new List<EventTicketTypeDto>();
            var firstTicketPrice = ticketTypes.FirstOrDefault()?.Price ?? 0;

            eventEntity.Title = dto.Title.Trim();
            eventEntity.Category = dto.Category.Trim();
            eventEntity.City = dto.City.Trim();
            eventEntity.VenueName = dto.VenueName.Trim();
            eventEntity.VenueAddress = dto.VenueAddress.Trim();
            eventEntity.Description = dto.Description.Trim();

            // Only replace the stored poster when a new image is actually provided.
            // A freshly uploaded image arrives as a base64 data URL; the edit form may instead
            // send back the lightweight proxy URL, in which case we keep the existing image.
            var incomingImage = dto.ImageUrl?.Trim() ?? string.Empty;
            if (incomingImage.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
            {
                eventEntity.ImageUrl = incomingImage;
            }
            else if (string.IsNullOrEmpty(eventEntity.ImageUrl) && !string.IsNullOrEmpty(incomingImage))
            {
                eventEntity.ImageUrl = incomingImage;
            }
            eventEntity.Date = DateTime.TryParse(dto.Date, out var parsedDate) ? parsedDate : DateTime.UtcNow;
            eventEntity.PerformersJson = JsonSerializer.Serialize(dto.Performers ?? new List<string>(), JsonOptions);
            eventEntity.TicketTypesJson = JsonSerializer.Serialize(ticketTypes, JsonOptions);
            eventEntity.Price = firstTicketPrice;
            eventEntity.AvailableSeats = dto.AvailableTickets ?? eventEntity.AvailableSeats;
            if (eventEntity.AvailableSeats <= 0)
            {
                eventEntity.AvailableSeats = 100;
            }
        }

        private EventDto MapEvent(Event eventEntity)
        {
            var performers = DeserializeList<string>(eventEntity.PerformersJson);
            var ticketTypes = DeserializeList<EventTicketTypeDto>(eventEntity.TicketTypesJson);

            return new EventDto
            {
                Id = eventEntity.Id.ToString(),
                Title = eventEntity.Title,
                Category = eventEntity.Category,
                City = eventEntity.City,
                VenueName = eventEntity.VenueName,
                VenueAddress = eventEntity.VenueAddress,
                Date = eventEntity.Date.ToString("yyyy-MM-dd"),
                Description = eventEntity.Description,
                Status = eventEntity.Status,
                WasPublished = eventEntity.PublishedAt != null,
                PublishedAt = eventEntity.PublishedAt?.ToString("O"),
                OrganizerId = eventEntity.OrganizerId.ToString(),
                CreatedAt = eventEntity.CreatedAt.ToString("O"),
                TicketPrice = eventEntity.Price,
                AvailableTickets = eventEntity.AvailableSeats,
                ImageUrl = BuildImageUrl(eventEntity),
                Performers = performers,
                TicketTypes = ticketTypes.Count > 0 ? ticketTypes : null
            };
        }

        // Keep heavy base64 posters out of list/detail JSON: expose a lightweight, cacheable
        // image URL that the browser can lazy-load instead. Plain URLs are returned as-is.
        private string? BuildImageUrl(Event eventEntity)
        {
            if (string.IsNullOrWhiteSpace(eventEntity.ImageUrl))
            {
                return null;
            }

            if (eventEntity.ImageUrl.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
            {
                return $"{Request.Scheme}://{Request.Host}/api/Events/{eventEntity.Id}/image";
            }

            return eventEntity.ImageUrl;
        }

        private static List<T> DeserializeList<T>(string? json)
        {
            if (string.IsNullOrWhiteSpace(json))
            {
                return new List<T>();
            }

            try
            {
                return JsonSerializer.Deserialize<List<T>>(json, JsonOptions) ?? new List<T>();
            }
            catch
            {
                return new List<T>();
            }
        }

        private int? GetCurrentUserId()
        {
            var claimValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(claimValue, out var userId) ? userId : null;
        }

        private bool CanManageEvent(Event eventEntity)
        {
            if (User.IsInRole("admin"))
            {
                return true;
            }

            var organizerId = GetCurrentUserId();
            return organizerId == eventEntity.OrganizerId;
        }

        private static string BuildInvitationEmailBody(Event eventEntity, string invitationLabel, string guestName, string ticketTypeName, int quantity)
        {
            var eventDate = eventEntity.Date.ToString("dd MMMM yyyy", CultureInfo.GetCultureInfo("ro-RO"));
            var safeTitle = WebUtility.HtmlEncode(eventEntity.Title);
            var safeGuestName = WebUtility.HtmlEncode(guestName);
            var safeTicketType = WebUtility.HtmlEncode(ticketTypeName);
            var safeVenue = WebUtility.HtmlEncode(eventEntity.VenueName);
            var safeAddress = WebUtility.HtmlEncode(eventEntity.VenueAddress);
            var safeCity = WebUtility.HtmlEncode(eventEntity.City);
            var safeInvitationLabel = WebUtility.HtmlEncode(invitationLabel);

            return $@"
<!doctype html>
<html>
  <body style=""margin:0;padding:24px;background:#f5f5f7;font-family:Arial,sans-serif;color:#111827;"">
    <div style=""max-width:620px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px;border:1px solid #e5e7eb;"">
      <p style=""margin:0 0 10px;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#6724e8;font-weight:700;"">Go-Out invitation</p>
      <h1 style=""margin:0 0 18px;font-size:28px;line-height:1.2;color:#111827;"">{safeTitle}</h1>
      <p style=""margin:0 0 18px;font-size:16px;line-height:1.6;"">Buna, {safeGuestName}!</p>
      <p style=""margin:0 0 20px;font-size:16px;line-height:1.6;"">Ai primit o {safeInvitationLabel} pentru evenimentul <strong>{safeTitle}</strong>.</p>
      <div style=""background:#f9fafb;border-radius:12px;padding:16px;margin:0 0 20px;"">
        <p style=""margin:0 0 8px;""><strong>Data:</strong> {eventDate}</p>
        <p style=""margin:0 0 8px;""><strong>Locatie:</strong> {safeVenue}, {safeAddress}, {safeCity}</p>
        <p style=""margin:0 0 8px;""><strong>Tip bilet:</strong> {safeTicketType}</p>
        <p style=""margin:0;""><strong>Cantitate:</strong> {quantity}</p>
      </div>
      <p style=""margin:0;font-size:14px;line-height:1.6;color:#4b5563;"">Te asteptam la eveniment.</p>
    </div>
  </body>
</html>";
        }
        private static string BuildNotificationEmailBody(Event eventEntity, string subject, string description)
        {
            var eventDate = eventEntity.Date.ToString("dd MMMM yyyy", CultureInfo.GetCultureInfo("ro-RO"));
            var safeTitle = WebUtility.HtmlEncode(eventEntity.Title);
            var safeSubject = WebUtility.HtmlEncode(subject);
            var safeDescription = WebUtility.HtmlEncode(description);
            var safeVenue = WebUtility.HtmlEncode(eventEntity.VenueName);
            var safeAddress = WebUtility.HtmlEncode(eventEntity.VenueAddress);
            var safeCity = WebUtility.HtmlEncode(eventEntity.City);

            return $@"
<!doctype html>
<html>
  <body style=""margin:0;padding:24px;background:#f5f5f7;font-family:Arial,sans-serif;color:#111827;"">
    <div style=""max-width:620px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px;border:1px solid #e5e7eb;"">
      <p style=""margin:0 0 10px;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#6724e8;font-weight:700;"">Go-Out notification</p>
      <h1 style=""margin:0 0 16px;font-size:26px;line-height:1.2;color:#111827;"">{safeSubject}</h1>
      <p style=""margin:0 0 18px;font-size:16px;line-height:1.6;"">{safeDescription}</p>
      <div style=""background:#f9fafb;border-radius:12px;padding:16px;margin:0 0 20px;"">
        <p style=""margin:0 0 8px;""><strong>Eveniment:</strong> {safeTitle}</p>
        <p style=""margin:0 0 8px;""><strong>Data:</strong> {eventDate}</p>
        <p style=""margin:0;""><strong>Locatie:</strong> {safeVenue}, {safeAddress}, {safeCity}</p>
      </div>
      <p style=""margin:0;font-size:14px;line-height:1.6;color:#4b5563;"">Mesaj trimis de organizator prin Go-Out.</p>
    </div>
  </body>
</html>";
        }
    }
}
