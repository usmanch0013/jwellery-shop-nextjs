import { BRAND } from "@/lib/brand";

export function welcomeAssistantMessage(): string {
  return `Hi! I’m ${BRAND.name} AI — ask for best sellers, new arrivals, or jewellery by style and budget.`;
}

export const ASSISTANT_QUICK_SUGGESTIONS = [
  "Show best sellers",
  "New arrivals",
  "Earrings under 2000",
  "Party sets",
];
