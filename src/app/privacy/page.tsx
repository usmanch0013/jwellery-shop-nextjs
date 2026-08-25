import Link from "next/link";

export const metadata = { title: "Privacy Policy | Lumière Jewellery" };

export default function PrivacyPage() {
  return (
    <div className="py-16 px-4 max-w-3xl mx-auto prose prose-sm">
      <h1 className="font-serif text-3xl mb-6">Privacy Policy</h1>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Lumière Jewellery respects your privacy. We collect personal information
        such as name, email, phone, and shipping address solely to process orders
        and improve your shopping experience.
      </p>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Payment information is processed securely through our payment partners.
        We do not store full card details on our servers.
      </p>
      <p className="text-muted-foreground leading-relaxed">
        For questions, contact us via our{" "}
        <Link href="/contact" className="text-primary underline">
          contact page
        </Link>
        .
      </p>
    </div>
  );
}
