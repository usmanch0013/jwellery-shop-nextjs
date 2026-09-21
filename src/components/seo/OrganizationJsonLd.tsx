import { BRAND, absoluteUrl } from "@/lib/brand";

export default function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${absoluteUrl("/")}#organization`,
        name: BRAND.name,
        url: BRAND.siteUrl,
        logo: absoluteUrl("/logo-mark.svg"),
        email: BRAND.email,
        telephone: BRAND.phone,
        foundingDate: String(BRAND.foundedYear),
        description:
          "Pakistani artificial jewellery brand offering contemporary necklace sets, earrings, bangles, and occasion wear.",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Lahore",
          addressRegion: "Punjab",
          addressCountry: "PK",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${absoluteUrl("/")}#website`,
        url: BRAND.siteUrl,
        name: BRAND.name,
        publisher: { "@id": `${absoluteUrl("/")}#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${absoluteUrl("/search")}?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
