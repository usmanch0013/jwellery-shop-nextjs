import { BRAND } from "@/lib/brand";

const GREETING =
  /^(hi|hello|hey|hii|hlo|salam|assalam|aoa|asalam|good\s*(morning|evening|afternoon)|howdy|yo)[\s!.,?]*$/i;

const THANKS =
  /^(thanks|thank\s*you|shukriya|shukria|thx|ty)[\s!.,?]*$/i;

const HELP =
  /^(help|\?|what\s*can\s*you\s*do)[\s!.,?]*$/i;

export function isGreetingOrThanks(message: string): boolean {
  const t = message.trim();
  if (!t) return false;
  return GREETING.test(t) || THANKS.test(t) || HELP.test(t);
}

export function greetingReply(message: string): string {
  const t = message.trim().toLowerCase();
  if (THANKS.test(t)) {
    return `You’re welcome! If you need anything else from ${BRAND.name}, just ask. ${BRAND.tagline}`;
  }
  if (HELP.test(t)) {
    return `I can find best sellers, new arrivals, bridal & party sets, earrings, and pieces in your budget (PKR). Try a chip below or type what you need.`;
  }
  if (/salam|assalam|aoa|asalam/i.test(t)) {
    return `Wa Alaikum Assalam! Welcome to ${BRAND.name} — ${BRAND.tagline} What jewellery are you shopping for today?`;
  }
  return `Hi! Welcome to ${BRAND.name}. I’m your personal shopper — ask for best sellers, new earrings, bridal sets, or something under your budget.`;
}
