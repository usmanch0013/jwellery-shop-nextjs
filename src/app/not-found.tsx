import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-20 text-center px-4">
      <h1 className="font-serif text-4xl mb-4">404</h1>
      <p className="text-muted-foreground mb-6">Page not found.</p>
      <Link href="/" className="text-primary underline">
        Back to home
      </Link>
    </div>
  );
}
