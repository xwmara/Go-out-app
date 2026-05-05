using Go_OutAppBackend.Data;
using Go_OutAppBackend.DTOs;
using Go_OutAppBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Go_OutAppBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

            if (existingUser != null)
            {
                return BadRequest(new { message = "Email already exists." });
            }

            var user = new User
            {
                FullName = dto.FullName.Trim(),
                Email = normalizedEmail,
                PasswordHash = HashPassword(dto.Password),
                Role = dto.Role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "User registered successfully."
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
            var hashedPassword = HashPassword(dto.Password);

            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.Email == normalizedEmail && u.PasswordHash == hashedPassword);

            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                message = "Login successful.",
                token,
                user = MapUser(user)
            });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<AuthUserDto>> GetCurrentUser()
        {
            var user = await GetCurrentUserEntity();
            if (user == null)
            {
                return Unauthorized();
            }

            return Ok(MapUser(user));
        }

        [Authorize]
        [HttpPut("me")]
        public async Task<ActionResult<AuthUserDto>> UpdateProfile(UpdateProfileDto dto)
        {
            var user = await GetCurrentUserEntity();
            if (user == null)
            {
                return Unauthorized();
            }

            var fullName = dto.FullName.Trim();
            var email = dto.Email.Trim().ToLowerInvariant();

            if (string.IsNullOrWhiteSpace(fullName))
            {
                return BadRequest(new { message = "Numele este obligatoriu." });
            }

            if (string.IsNullOrWhiteSpace(email))
            {
                return BadRequest(new { message = "Email-ul este obligatoriu." });
            }

            var emailTaken = await _context.Users.AnyAsync(u => u.Email == email && u.Id != user.Id);
            if (emailTaken)
            {
                return BadRequest(new { message = "Email already exists." });
            }

            user.FullName = fullName;
            user.Email = email;

            await _context.SaveChangesAsync();
            return Ok(MapUser(user));
        }

        private async Task<User?> GetCurrentUserEntity()
        {
            var claimValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(claimValue, out var userId))
            {
                return null;
            }

            return await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        }

        private static AuthUserDto MapUser(User user)
        {
            return new AuthUserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role
            };
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }
    }
}
