namespace Go_OutAppBackend.Models
{
    public class Discount
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;

        // "percent" or "fixed"
        public string DiscountType { get; set; } = "percent";

        // percentage (0-100) when DiscountType == "percent", otherwise a fixed amount
        public decimal Value { get; set; }

        public DateTime? ExpiresAt { get; set; }
        public int? MaxUses { get; set; }
        public int UsedCount { get; set; }

        // null = valid for any event of the owner
        public int? EventId { get; set; }
        public Event? Event { get; set; }

        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Returns a Romanian validation message when the code cannot be used for the
        /// given event, or null when the code is valid.
        /// </summary>
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

        /// <summary>
        /// Computes the discount amount applied to a subtotal, clamped to [0, subtotal].
        /// </summary>
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
