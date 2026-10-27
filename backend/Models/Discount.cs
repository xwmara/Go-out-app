namespace Go_OutAppBackend.Models
{
    public class Discount
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;

        public string DiscountType { get; set; } = "percent";

        public decimal Value { get; set; }

        public DateTime? ExpiresAt { get; set; }
        public int? MaxUses { get; set; }
        public int UsedCount { get; set; }

        public int? EventId { get; set; }
        public Event? Event { get; set; }

        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string? GetValidationError(int eventId, DateTime now)
        {
            if (!IsActive)
            {
                return "Codul de reducere este inactiv.";
            }

            if (ExpiresAt.HasValue && ExpiresAt.Value < now)
            {
                return "Codul de reducere a expirat.";
            }

            if (MaxUses.HasValue && UsedCount >= MaxUses.Value)
            {
                return "Codul de reducere a atins limita de utilizari.";
            }

            if (EventId.HasValue && EventId.Value != eventId)
            {
                return "Codul de reducere nu este valid pentru acest eveniment.";
            }

            return null;
        }

        public decimal ComputeDiscount(decimal subtotal)
        {
            if (subtotal <= 0)
            {
                return 0m;
            }

            var amount = DiscountType == "fixed"
                ? Value
                : subtotal * (Value / 100m);

            if (amount < 0m)
            {
                amount = 0m;
            }

            if (amount > subtotal)
            {
                amount = subtotal;
            }

            return Math.Round(amount, 2, MidpointRounding.AwayFromZero);
        }
    }
}
