import type { Metadata } from "next";
import { BRAND, absoluteUrl } from "@/lib/brand";

export function buildSiteMetadata(overrides?: {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
}): Metadata {
  const title =
    overrides?.title ??
    `Artificial Jewellery in Pakistan | ${BRAND.name}`;
  const description =
    overrides?.description ??
    `Shop contemporary artificial jewellery at ${BRAND.domain}. Necklace sets, earrings, bangles & bridal styles — elegant design and trusted quality since ${BRAND.foundedYear}.`;
  const url = absoluteUrl(overrides?.path ?? "/");

  return {
    metadataBase: new URL(BRAND.siteUrl),
    title: {
      default: title,
      template: `%s | ${BRAND.name}`,
    },
    description,
    applicationName: BRAND.name,
    authors: [{ name: BRAND.name, url: BRAND.siteUrl }],
    creator: BRAND.name,
    publisher: BRAND.name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: "en_PK",
      url,
      siteName: BRAND.name,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: overrides?.noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true },
        },
    icons: {
      icon: [{ url: "/logo-mark.svg", type: "image/svg+xml" }],
      apple: [{ url: "/logo-mark.svg", type: "image/svg+xml" }],
    },
  };
}
