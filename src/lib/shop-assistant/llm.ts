import type { CategoryInfo } from "@/types";
import { BRAND } from "@/lib/brand";
import type { AssistantHistoryItem, ProductSearchIntent } from "./types";

const INTENT_SCHEMA = `{
  "reply": "short friendly message to the customer",
  "search": null or string keyword,
  "filter": null or one of "new","bestseller","sale","featured",
  "category": null or category slug from the list,
  "maxPrice": null or number in PKR,
  "sort": null or one of "newest","price_asc","price_desc","popular"
}`;

function categoryList(categories: CategoryInfo[]) {
  return categories
    .filter((c) => c.productCount > 0)
    .map((c) => `${c.slug} (${c.name})`)
    .join(", ");
}

export async function parseIntentWithOpenAI(
  message: string,
  categories: CategoryInfo[],
  history: AssistantHistoryItem[]
): Promise<ProductSearchIntent | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const model = process.env.SHOP_ASSISTANT_MODEL?.trim() || "gpt-4o-mini";

  const system = `You are the shopping assistant for ${BRAND.name} (${BRAND.domain}), a Pakistan-based artificial jewellery brand.
Help customers find products. You must respond with ONLY valid JSON matching this shape:
${INTENT_SCHEMA}

Category slugs available: ${categoryList(categories) || "none"}

Rules:
- Prefer filter "bestseller" when they ask for best sellers or popular items.
- Prefer filter "new" for new arrivals.
- Use category slug when they name a type (earrings, bridal, party set, etc.).
- For shipping, returns, or payment questions, set all product fields to null and only write a helpful reply (no fake products).
- Keep reply under 2 sentences. English or Roman Urdu is fine.
- Do not invent product names or prices.`;

  const messages: { role: string; content: string }[] = [
    { role: "system", content: system },
    ...history.slice(-6).map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: message },
  ];

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages,
      }),
    });

    if (!res.ok) {
      console.error("shop-assistant OpenAI error:", res.status, await res.text());
      return null;
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) return null;

    const parsed = JSON.parse(raw) as ProductSearchIntent;
    return parsed;
  } catch (e) {
    console.error("shop-assistant OpenAI exception:", e);
    return null;
  }
}
