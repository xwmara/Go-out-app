using Go_OutAppBackend.Data;
using Go_OutAppBackend.DTOs;
using Go_OutAppBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Go_OutAppBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DiscountsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DiscountsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("validate")]
        public async Task<ActionResult<ValidateDiscountResultDto>> Validate(ValidateDiscountDto dto)
        {
            if (!int.TryParse(dto.EventId, out var eventId))
            {
                return BadRequest(new { message = "Invalid event id." });
            }

            var code = dto.Code?.Trim().ToUpperInvariant() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(code))
            {
                return Ok(new ValidateDiscountResultDto { Valid = false, Message = "Introdu un cod de reducere." });
            }

            var discount = await _context.Discounts
                .FirstOrDefaultAsync(d => d.Code == code && (d.EventId == null || d.EventId == eventId));

            if (discount is null)
            {
                return Ok(new ValidateDiscountResultDto { Valid = false, Message = "Codul de reducere nu exista." });
            }

            var error = discount.GetValidationError(eventId, DateTime.UtcNow);
            if (error != null)
            {
                return Ok(new ValidateDiscountResultDto { Valid = false, Message = error });
            }

            var amount = discount.ComputeDiscount(dto.Subtotal);

            return Ok(new ValidateDiscountResultDto
            {
                Valid = true,
                Message = "Codul de reducere a fost aplicat.",
                Code = discount.Code,
                DiscountType = discount.DiscountType,
                Value = discount.Value,
                DiscountAmount = amount
            });
        }

        [HttpGet("event/{eventId:int}")]
        [Authorize(Roles = "organizer,admin")]
        public async Task<ActionResult<IEnumerable<DiscountDto>>> GetForEvent(int eventId)
        {
            var eventEntity = await _context.Events.AsNoTracking().FirstOrDefaultAsync(e => e.Id == eventId);
            if (eventEntity is null)
            {
                return NotFound(new { message = "Event not found." });
            }

            if (!CanManageEvent(eventEntity))
            {
                return Forbid();
            }

            var discounts = await _context.Discounts
                .AsNoTracking()
                .Where(d => d.EventId == eventId)
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();

            return Ok(discounts.Select(MapDiscount));
        }

        [HttpPost]
        [Authorize(Roles = "organizer,admin")]
        public async Task<ActionResult<DiscountDto>> Create(CreateDiscountDto dto)
        {
            var code = dto.Code?.Trim().ToUpperInvariant() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(code))
            {
                return BadRequest(new { message = "Codul de reducere este obligatoriu." });
            }

            var discountType = dto.DiscountType == "fixed" ? "fixed" : "percent";
            if (dto.Value <= 0)
            {
                return BadRequest(new { message = "Valoarea reducerii trebuie sa fie mai mare decat 0." });
            }

            if (discountType == "percent" && dto.Value > 100)
            {
                return BadRequest(new { message = "Procentul reducerii nu poate depasi 100." });
            }

            int? eventId = null;
            if (!string.IsNullOrWhiteSpace(dto.EventId))
            {
                if (!int.TryParse(dto.EventId, out var parsedEventId))
                {
                    return BadRequest(new { message = "Invalid event id." });
                }

                var eventEntity = await _context.Events.FirstOrDefaultAsync(e => e.Id == parsedEventId);
                if (eventEntity is null)
                {
                    return NotFound(new { message = "Event not found." });
                }

                if (!CanManageEvent(eventEntity))
                {
                    return Forbid();
                }

                eventId = parsedEventId;
            }

            DateTime? expiresAt = null;
            if (!string.IsNullOrWhiteSpace(dto.ExpiresAt) && DateTime.TryParse(dto.ExpiresAt, out var parsedExpiry))
            {
                expiresAt = parsedExpiry.ToUniversalTime();
            }

            if (dto.MaxUses.HasValue && dto.MaxUses.Value < 0)
            {
                return BadRequest(new { message = "Limita de utilizari nu poate fi negativa." });
            }

            var discount = new Discount
            {
                Code = code,
                DiscountType = discountType,
                Value = dto.Value,
                ExpiresAt = expiresAt,
                MaxUses = dto.MaxUses,
                UsedCount = 0,
                EventId = eventId,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _context.Discounts.Add(discount);
            await _context.SaveChangesAsync();

            return Ok(MapDiscount(discount));
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "organizer,admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var discount = await _context.Discounts.FirstOrDefaultAsync(d => d.Id == id);
            if (discount is null)
            {
                return NotFound(new { message = "Discount not found." });
            }

            if (discount.EventId.HasValue)
            {
                var eventEntity = await _context.Events.FirstOrDefaultAsync(e => e.Id == discount.EventId.Value);
                if (eventEntity != null && !CanManageEvent(eventEntity))
                {
                    return Forbid();
                }
            }
            else if (!User.IsInRole("admin"))
            {
                return Forbid();
            }

            _context.Discounts.Remove(discount);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private static DiscountDto MapDiscount(Discount discount) => new()
        {
            Id = discount.Id.ToString(),
            Code = discount.Code,
            DiscountType = discount.DiscountType,
            Value = discount.Value,
            ExpiresAt = discount.ExpiresAt?.ToString("O"),
            MaxUses = discount.MaxUses,
            UsedCount = discount.UsedCount,
            EventId = discount.EventId?.ToString(),
            IsActive = discount.IsActive
        };

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
