using Go_OutAppBackend.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Go_OutAppBackend.Services
{
    public static class InvoicePdfGenerator
    {
        public static byte[] Generate(Ticket ticket, string invoiceNumber, string ticketCode)
        {
            var total = ticket.UnitPrice * ticket.Quantity;
            var issueDate = ticket.PurchaseDate.ToString("dd.MM.yyyy HH:mm");
            var eventDate = ticket.Event.Date.ToString("dd.MM.yyyy HH:mm");

            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(40);
                    page.DefaultTextStyle(x => x.FontSize(11).FontColor("#0f172a"));

                    page.Content().Border(1).BorderColor("#e2e8f0").Padding(28).Column(col =>
                    {
                        col.Spacing(12);

                        col.Item().Text("FACTURA GO-OUT APP").FontSize(10).FontColor("#64748b");
                        col.Item().Text(invoiceNumber).FontSize(26).Bold();

                        InfoRow(col.Item(), "Client", ticket.User.FullName);
                        InfoRow(col.Item(), "Email", ticket.User.Email);
                        InfoRow(col.Item(), "Data emitere", issueDate);

                        col.Item().PaddingVertical(4).LineHorizontal(1).LineColor("#e2e8f0");

                        col.Item().Text(ticket.Event.Title).FontSize(18).Bold();

                        InfoRow(col.Item(), "Locatie", $"{ticket.Event.City}, {ticket.Event.VenueName}");
                        InfoRow(col.Item(), "Data eveniment", eventDate);
                        InfoRow(col.Item(), "Tip bilet", ticket.TicketTypeName);
                        InfoRow(col.Item(), "Cantitate", ticket.Quantity.ToString());
                        InfoRow(col.Item(), "Pret unitar", $"{ticket.UnitPrice:0.##} lei");

                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Text("Total").FontSize(18).Bold();
                            row.RelativeItem().AlignRight().Text($"{total:0.##} lei").FontSize(18).Bold();
                        });

                        col.Item().PaddingVertical(4).LineHorizontal(1).LineColor("#e2e8f0");

                        InfoRow(col.Item(), "Cod bilet", ticketCode);
                    });
                });
            }).GeneratePdf();
        }

        private static void InfoRow(IContainer container, string label, string value)
        {
            container.Row(row =>
            {
                row.RelativeItem().Text(label).FontColor("#334155");
                row.RelativeItem().AlignRight().Text(value).Bold();
            });
        }
    }
}
