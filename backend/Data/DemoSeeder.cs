using System.Text.Json;
using Go_OutAppBackend.DTOs;
using Go_OutAppBackend.Models;
using Go_OutAppBackend.Services;

namespace Go_OutAppBackend.Data
{
    public static class DemoSeeder
    {
        private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

        public static void Seed(ApplicationDbContext context)
        {
            if (context.Users.Any(u => u.Email == "organizator@goout.ro"))
            {
                return;
            }

            var demoEmails = new[]
            {
                "organizator@goout.ro",
                "maraliviapopa@gmail.com",
                "admin@goout.ro",
                "ana.pop@example.ro",
                "mihai.ionescu@example.ro"
            };

            var leftovers = context.Users.Where(u => demoEmails.Contains(u.Email)).ToList();
            if (leftovers.Count > 0)
            {
                context.Users.RemoveRange(leftovers);
                context.SaveChanges();
            }

            var passwordHash = PasswordHasher.Hash("Demo1234!");

            var organizer = new User { FullName = "Organizator Demo", Email = "organizator@goout.ro", PasswordHash = passwordHash, Role = "organizer" };
            var client = new User { FullName = "Client Demo", Email = "maraliviapopa@gmail.com", PasswordHash = passwordHash, Role = "client" };
            var admin = new User { FullName = "Admin Demo", Email = "admin@goout.ro", PasswordHash = passwordHash, Role = "admin" };
            var anaPop = new User { FullName = "Ana Pop", Email = "ana.pop@example.ro", PasswordHash = passwordHash, Role = "client" };
            var mihaiIonescu = new User { FullName = "Mihai Ionescu", Email = "mihai.ionescu@example.ro", PasswordHash = passwordHash, Role = "client" };

            context.Users.AddRange(organizer, client, admin, anaPop, mihaiIonescu);
            context.SaveChanges();

            var now = DateTime.UtcNow;

            var e1Types = new List<EventTicketTypeDto>
            {
                new() { Id = Guid.NewGuid().ToString(), Name = "Acces General", Price = 120m, AvailableQuantity = 150, Description = "Acces in zona generala.", SoldOut = false },
                new() { Id = Guid.NewGuid().ToString(), Name = "VIP", Price = 250m, AvailableQuantity = 40, Description = "Zona VIP cu bar dedicat si vizibilitate maxima.", SoldOut = false },
            };

            var e2Types = new List<EventTicketTypeDto>
            {
                new() { Id = Guid.NewGuid().ToString(), Name = "Abonament 2 zile", Price = 180m, AvailableQuantity = 80, Description = "Acces la ambele zile de festival.", SoldOut = false },
                new() { Id = Guid.NewGuid().ToString(), Name = "VIP Weekend", Price = 390m, AvailableQuantity = 0, Description = "Epuizat.", SoldOut = true },
            };

            var e3Types = new List<EventTicketTypeDto>
            {
                new() { Id = Guid.NewGuid().ToString(), Name = "Acces General", Price = 90m, AvailableQuantity = 100, Description = "Loc pe scaun, sala principala.", SoldOut = false },
                new() { Id = Guid.NewGuid().ToString(), Name = "Loja", Price = 160m, AvailableQuantity = 20, Description = "Loc in loja, experienta premium.", SoldOut = false },
            };

            var e4Types = new List<EventTicketTypeDto>
            {
                new() { Id = Guid.NewGuid().ToString(), Name = "Acces General", Price = 75m, AvailableQuantity = 120, Description = "Bilet standard.", SoldOut = false },
            };

            var e1 = new Event
            {
                Title = "Electric Nights - Live in Bucuresti",
                Category = "Concert",
                City = "Bucuresti",
                VenueName = "Arenele Romane",
                VenueAddress = "Str. Cutitul de Argint 3",
                Description = "O seara de muzica live cu artisti de top, lumini spectaculoase si o atmosfera incendiara in inima Capitalei.",
                Status = "published",
                CreatedAt = now.AddDays(-20),
                PublishedAt = now.AddDays(-18),
                ImageUrl = "",
                PerformersJson = JsonSerializer.Serialize(new List<string> { "The Neon Collective", "Ana Mocanu", "DJ Pulse" }, JsonOptions),
                TicketTypesJson = JsonSerializer.Serialize(e1Types, JsonOptions),
                Date = now.AddDays(21),
                Price = e1Types[0].Price,
                AvailableSeats = 190,
                OrganizerId = organizer.Id,
            };

            var e2 = new Event
            {
                Title = "Cluj Summer Fest",
                Category = "Festival",
                City = "Cluj-Napoca",
                VenueName = "Parcul Central",
                VenueAddress = "Aleea Stadionului 2",
                Description = "Doua zile de festival cu zeci de artisti, food court si zone de relaxare.",
                Status = "published",
                CreatedAt = now.AddDays(-15),
                PublishedAt = now.AddDays(-14),
                ImageUrl = "",
                PerformersJson = JsonSerializer.Serialize(new List<string> { "Subcarpati", "Irina Rimes", "Byron" }, JsonOptions),
                TicketTypesJson = JsonSerializer.Serialize(e2Types, JsonOptions),
                Date = now.AddDays(35),
                Price = e2Types[0].Price,
                AvailableSeats = 80,
                OrganizerId = organizer.Id,
            };

            var e3 = new Event
            {
                Title = "O Scrisoare Pierduta",
                Category = "Teatru",
                City = "Timisoara",
                VenueName = "Teatrul National",
                VenueAddress = "Str. Marasesti 2",
                Description = "Comedia clasica a lui I.L. Caragiale, intr-o montare moderna, plina de umor.",
                Status = "published",
                CreatedAt = now.AddDays(-10),
                PublishedAt = now.AddDays(-9),
                ImageUrl = "",
                PerformersJson = JsonSerializer.Serialize(new List<string> { "Marius Manole", "Ana Ularu" }, JsonOptions),
                TicketTypesJson = JsonSerializer.Serialize(e3Types, JsonOptions),
                Date = now.AddDays(14),
                Price = e3Types[0].Price,
                AvailableSeats = 120,
                OrganizerId = organizer.Id,
            };

            var e4 = new Event
            {
                Title = "Stand-up Comedy Night",
                Category = "Stand-up",
                City = "Iasi",
                VenueName = "Club Underground",
                VenueAddress = "Str. Lapusneanu 14",
                Description = "O seara de stand-up cu cei mai buni comedianti ai momentului. (ciorna - inca nepublicat)",
                Status = "draft",
                CreatedAt = now.AddDays(-2),
                PublishedAt = null,
                ImageUrl = "",
                PerformersJson = JsonSerializer.Serialize(new List<string> { "Micutzu", "Bordea" }, JsonOptions),
                TicketTypesJson = JsonSerializer.Serialize(e4Types, JsonOptions),
                Date = now.AddDays(40),
                Price = e4Types[0].Price,
                AvailableSeats = 120,
                OrganizerId = organizer.Id,
            };

            context.Events.AddRange(e1, e2, e3, e4);
            context.SaveChanges();

            var vara2026 = new Discount
            {
                Code = "VARA2026",
                DiscountType = "percent",
                Value = 20m,
                ExpiresAt = now.AddMonths(6),
                MaxUses = 100,
                UsedCount = 0,
                EventId = e1.Id,
                IsActive = true,
                CreatedAt = now.AddDays(-5),
            };

            var expirat = new Discount
            {
                Code = "EXPIRAT",
                DiscountType = "percent",
                Value = 15m,
                ExpiresAt = now.AddMonths(-2),
                MaxUses = 100,
                UsedCount = 0,
                EventId = e1.Id,
                IsActive = true,
                CreatedAt = now.AddMonths(-3),
            };

            context.Discounts.AddRange(vara2026, expirat);

            var tickets = new List<Ticket>
            {
                new() { EventId = e1.Id, UserId = client.Id, TicketTypeName = "Acces General", Quantity = 2, UnitPrice = 120m, PurchaseDate = now.AddDays(-2) },
                new() { EventId = e1.Id, UserId = anaPop.Id, TicketTypeName = "VIP", Quantity = 1, UnitPrice = 250m, PurchaseDate = now.AddDays(-1) },
                new() { EventId = e1.Id, UserId = mihaiIonescu.Id, TicketTypeName = "Acces General", Quantity = 1, UnitPrice = 120m, PurchaseDate = now.AddHours(-5) },
                new() { EventId = e1.Id, UserId = client.Id, TicketTypeName = "VIP", Quantity = 1, UnitPrice = 250m, PurchaseDate = now.AddHours(-10) },
                new() { EventId = e2.Id, UserId = anaPop.Id, TicketTypeName = "Abonament 2 zile", Quantity = 2, UnitPrice = 180m, PurchaseDate = now.AddDays(-3) },
                new() { EventId = e2.Id, UserId = mihaiIonescu.Id, TicketTypeName = "Abonament 2 zile", Quantity = 1, UnitPrice = 180m, PurchaseDate = now.AddHours(-6) },
            };

            context.Tickets.AddRange(tickets);
            context.SaveChanges();
        }
    }
}
