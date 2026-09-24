import { getCategories, getProducts } from "@/lib/products/queries";
import type { Product } from "@/types";
import { parseIntentFromRules } from "./rules";
import { parseIntentWithLLM } from "./llm";
import { ASSISTANT_QUICK_SUGGESTIONS } from "./copy";
import type {
  AssistantHistoryItem,
  AssistantProductPayload,
  ShopAssistantResponse,
} from "./types";

function toPayload(p: Product): AssistantProductPayload {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice,
    image: p.image,
    category: p.category,
    material: p.material,
    description: p.description,
    stock: p.stock,
    soldOut: p.soldOut,
    variations: p.variations,
  };
}

export async function runShopAssistant(
  message: string,
  history: AssistantHistoryItem[] = []
): Promise<ShopAssistantResponse> {
  const categories = await getCategories();
  const trimmed = message.trim();

  const llm = await parseIntentWithLLM(trimmed, categories, history);
  let intent = llm?.intent;
  let engine: ShopAssistantResponse["engine"] = llm?.engine ?? "rules";

  if (!intent) {
    intent = parseIntentFromRules(trimmed, categories);
    engine = "rules";
  }

  const isFaqOnly =
    !intent.search &&
    !intent.filter &&
    !intent.category &&
    intent.maxPrice == null &&
    intent.minPrice == null &&
    intent.reply &&
    /shipping|refund|return|policy|cod/i.test(intent.reply);

  if (isFaqOnly) {
    return {
      message: intent.reply!,
      products: [],
      suggestions: ASSISTANT_QUICK_SUGGESTIONS,
      engine,
      intent,
    };
  }

  const { products } = await getProducts({
    page: 1,
    limit: 5,
    search: intent.search,
    filter: intent.filter,
    category: intent.category,
    maxPrice: intent.maxPrice,
    minPrice: intent.minPrice,
    sort: intent.sort ?? "newest",
  });

  let reply = intent.reply;
  if (!reply) {
    reply = products.length
      ? "Here’s what I found for you:"
      : "I couldn’t find a match — try best sellers, a category name, or a budget like “under 2500”.";
  } else if (!products.length && (intent.search || intent.category || intent.filter)) {
    reply = `${reply.replace(/:$/, "")} — no items matched right now. Browse the full shop or try another category.`;
  }

  return {
    message: reply,
    products: products.map(toPayload),
    suggestions: ASSISTANT_QUICK_SUGGESTIONS,
    engine,
    intent,
  };
}
