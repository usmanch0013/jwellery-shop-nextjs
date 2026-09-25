import { BRAND } from "@/lib/brand";

export function welcomeAssistantMessage(): string {
  return `Assalam o Alaikum! I’m ${BRAND.shortName} AI — your stylist for ${BRAND.name}. Ask for best sellers, bridal or party sets, earrings, or a budget like “under 2500 PKR”. ${BRAND.tagline}`;
}

export const ASSISTANT_QUICK_SUGGESTIONS = [
  "Best sellers",
  "New arrivals",
  "Party sets under 3000",
  "Bridal jewellery",
  "Gold tone earrings",
  "COD shipping Lahore?",
];

/** Shop filter bar — short placeholders (same assistant API) */
export const SHOP_FILTER_AI_PLACEHOLDERS = [
  "2000 se kam price wale products",
  "Bridal set under 5000 PKR",
  "Best selling jhumkas",
  "New gold-tone bangles",
];
