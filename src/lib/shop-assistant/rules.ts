import type { CategoryInfo } from "@/types";
import { greetingReply, isGreetingOrThanks } from "./greetings";
import {
  extractMaxPriceFromText,
  extractMinPriceFromText,
} from "./parse-price-intent";
import type { ProductSearchIntent } from "./types";

export function parseIntentFromRules(
  message: string,
  categories: CategoryInfo[]
): ProductSearchIntent {
  const text = message.toLowerCase().trim();
  const intent: ProductSearchIntent = {};

  if (isGreetingOrThanks(message)) {
    intent.reply = greetingReply(message);
    return intent;
  }

  if (
    /best\s*sell|bestsell|top\s*sell|popular|trending|customer\s*fav/i.test(text)
  ) {
    intent.filter = "bestseller";
    intent.reply =
      "Here are our customer favourites — add any piece straight to your cart.";
    return intent;
  }

  if (/new\s*arrival|just\s*in|latest|new\s*style|fresh/i.test(text)) {
    intent.filter = "new";
    intent.reply = "Fresh styles just added — take a look.";
    return intent;
  }

  if (/on\s*sale|discount|deal|offer|sale/i.test(text)) {
    intent.filter = "sale";
    intent.reply = "These pieces are on sale right now.";
    return intent;
  }

  if (/featured|editor|pick/i.test(text)) {
    intent.filter = "featured";
    intent.reply = "Featured picks from SHE Collection.";
    return intent;
  }

  for (const cat of categories) {
    const name = cat.name.toLowerCase();
    const slug = cat.slug.replace(/-/g, " ");
    if (
      text.includes(cat.slug) ||
      text.includes(name) ||
      (slug.length > 4 && text.includes(slug))
    ) {
      intent.category = cat.slug;
      intent.reply = `Showing ${cat.name} from our catalogue.`;
      const max = extractMaxPriceFromText(text);
      if (max) intent.maxPrice = max;
      return intent;
    }
  }

  const maxPrice = extractMaxPriceFromText(text);
  const minPrice = extractMinPriceFromText(text);
  if (maxPrice != null || minPrice != null) {
    if (maxPrice != null) intent.maxPrice = maxPrice;
    if (minPrice != null) intent.minPrice = minPrice;
    intent.sort = "price_asc";
    if (maxPrice != null && minPrice == null) {
      intent.reply = `Pieces under Rs. ${maxPrice.toLocaleString("en-PK")} — price filter applied below.`;
    } else if (minPrice != null && maxPrice == null) {
      intent.reply = `Pieces from Rs. ${minPrice.toLocaleString("en-PK")} upward.`;
    } else if (minPrice != null && maxPrice != null) {
      intent.reply = `Between Rs. ${minPrice.toLocaleString("en-PK")} and Rs. ${maxPrice.toLocaleString("en-PK")}.`;
    }
    return intent;
  }

  if (/cheap|sasta|affordable|low\s*price/i.test(text)) {
    intent.sort = "price_asc";
    intent.reply = "Our most affordable options:";
    return intent;
  }

  if (/shipping|deliver|cod|cash on delivery/i.test(text)) {
    intent.reply =
      "We ship nationwide across Pakistan and internationally where available. COD is offered in most areas — see Shipping Policy on our site or ask on WhatsApp for your city.";
    return intent;
  }

  if (/return|refund|exchange/i.test(text)) {
    intent.reply =
      "Returns and refunds follow our Refund Policy on sheco.pk. Email hello@sheco.pk or WhatsApp us with your order number for help.";
    return intent;
  }

  if (text.length > 2) {
    intent.search = message.trim();
    intent.reply = `Results for “${message.trim()}”:`;
  } else {
    intent.reply = greetingReply(message);
  }

  return intent;
}
