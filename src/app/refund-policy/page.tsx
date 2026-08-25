export const metadata = { title: "Refund Policy | Lumière Jewellery" };

export default function RefundPolicyPage() {
  return (
    <div className="py-16 px-4 max-w-3xl mx-auto">
      <h1 className="font-serif text-3xl mb-6">Refund & Return Policy</h1>
      <ul className="space-y-3 text-muted-foreground text-sm leading-relaxed list-disc pl-5">
        <li>Items may be exchanged within 7 days of delivery if unused and in original packaging.</li>
        <li>Refunds are processed within 5–7 business days after inspection.</li>
        <li>Sale items and customized pieces are non-refundable.</li>
        <li>Contact customer support with your order number to initiate a return.</li>
      </ul>
    </div>
  );
}
