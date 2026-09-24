/** Central brand constants — SHE Collection (sheco.pk) */

export { BRAND_COLORS } from "@/lib/brand/colors";

export const BRAND = {
  name: "SHE Collection",
  shortName: "SHE",
  domain: "sheco.pk",
  siteUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://sheco.pk",
  email: "hello@sheco.pk",
  phone: "+92 300 0000000",
  address: "Lahore, Punjab, Pakistan",
  foundedYear: 2017,
  tagline: "Wear Your Art.",
  promise: "Elegant Design. Trusted Quality. Contemporary Art.",
} as const;

export function pageTitle(suffix: string): string {
  return `${suffix} | ${BRAND.name}`;
}

export function absoluteUrl(path = "/"): string {
  const base = BRAND.siteUrl.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
