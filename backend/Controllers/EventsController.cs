using Go_OutAppBackend.Data;
using Go_OutAppBackend.DTOs;
using Go_OutAppBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace Go_OutAppBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

        public EventsController(ApplicationDbContext context)
        {
            _context = context;
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

            eventEntity.Status = dto.Status;
            await _context.SaveChangesAsync();

            return Ok(MapEvent(eventEntity));
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
            eventEntity.ImageUrl = dto.ImageUrl?.Trim() ?? string.Empty;
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
                OrganizerId = eventEntity.OrganizerId.ToString(),
                CreatedAt = eventEntity.CreatedAt.ToString("O"),
                TicketPrice = eventEntity.Price,
                AvailableTickets = eventEntity.AvailableSeats,
                ImageUrl = string.IsNullOrWhiteSpace(eventEntity.ImageUrl) ? null : eventEntity.ImageUrl,
                Performers = performers,
                TicketTypes = ticketTypes.Count > 0 ? ticketTypes : null
            };
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
    }
}
