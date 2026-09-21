import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, Great_Vibes } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import StorefrontShell from "@/components/StorefrontShell";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { getCategories } from "@/lib/products/queries";
import { getCmsBundle } from "@/lib/cms/queries";
import { buildSiteMetadata } from "@/lib/seo/metadata";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-serif",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
});

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getCmsBundle();
  return buildSiteMetadata({
    title: cms.site.seoTitle,
    description: cms.site.seoDescription,
  });
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [categories, cms] = await Promise.all([getCategories(), getCmsBundle()]);

  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} ${greatVibes.variable} h-full w-full antialiased`}
    >
      <body className="min-h-full w-full min-w-0 flex flex-col overflow-x-clip bg-background text-foreground font-sans">
        <OrganizationJsonLd />
        <CartProvider>
          <WishlistProvider>
            <StorefrontShell categories={categories} cms={cms}>{children}</StorefrontShell>
            <Toaster position="bottom-right" />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
