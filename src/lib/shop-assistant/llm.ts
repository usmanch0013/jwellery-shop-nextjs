import type { CategoryInfo } from "@/types";
import type { AssistantHistoryItem, ProductSearchIntent } from "./types";
import { buildAssistantSystemPrompt } from "./prompt";
import { normalizeIntent } from "./normalize-intent";

export type LlmEngine = "openai" | "gemini" | "groq";

type LlmResult = { intent: ProductSearchIntent; engine: LlmEngine } | null;

function geminiApiKey(): string | undefined {
  return (
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    undefined
  );
}

function historyMessages(history: AssistantHistoryItem[]) {
  return history.slice(-6).map((h) => ({
    role: h.role,
    content: h.content,
  }));
}

async function callOpenAI(
  message: string,
  categories: CategoryInfo[],
  history: AssistantHistoryItem[]
): Promise<ProductSearchIntent | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const model = process.env.SHOP_ASSISTANT_MODEL?.trim() || "gpt-4o-mini";
  const system = buildAssistantSystemPrompt(categories);
  const messages = [
    { role: "system", content: system },
    ...historyMessages(history),
    { role: "user", content: message },
  ];

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
  return JSON.parse(raw) as ProductSearchIntent;
}

async function callGemini(
  message: string,
  categories: CategoryInfo[],
  history: AssistantHistoryItem[]
): Promise<ProductSearchIntent | null> {
  const apiKey = geminiApiKey();
  if (!apiKey) return null;

  const configured = process.env.GEMINI_MODEL?.trim();
  const modelCandidates = [
    configured,
    "gemini-2.5-flash",
    "gemini-3.8-flash",
  ].filter((m, i, arr) => m && arr.indexOf(m) === i) as string[];

  const system = buildAssistantSystemPrompt(categories);

  const contents: { role: string; parts: { text: string }[] }[] = [];

  for (const h of historyMessages(history)) {
    contents.push({
      role: h.role === "assistant" ? "model" : "user",
      parts: [{ text: h.content }],
    });
  }
  contents.push({ role: "user", parts: [{ text: message }] });

  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: system }] },
    contents,
    generationConfig: {
      temperature: 0.35,
      responseMimeType: "application/json",
    },
  });

  let res: Response | null = null;
  let lastError = "";

  for (const model of modelCandidates) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    if (res.ok) break;
    lastError = await res.text();
    if (res.status !== 404) break;
  }

  if (!res?.ok) {
    console.error(
      "shop-assistant Gemini error:",
      res?.status ?? "no-response",
      lastError
    );
    return null;
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as ProductSearchIntent;
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]) as ProductSearchIntent;
  }
}

async function callGroq(
  message: string,
  categories: CategoryInfo[],
  history: AssistantHistoryItem[]
): Promise<ProductSearchIntent | null> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) return null;

  const model =
    process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile";
  const system = buildAssistantSystemPrompt(categories);
  const messages = [
    { role: "system", content: system },
    ...historyMessages(history),
    { role: "user", content: message },
  ];

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages,
    }),
  });

  if (!res.ok) {
    console.error("shop-assistant Groq error:", res.status, await res.text());
    return null;
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) return null;
  return JSON.parse(raw) as ProductSearchIntent;
}

/** Free-friendly order: Gemini → Groq → OpenAI */
export async function parseIntentWithLLM(
  message: string,
  categories: CategoryInfo[],
  history: AssistantHistoryItem[] = []
): Promise<LlmResult> {
  const providers: { engine: LlmEngine; call: () => Promise<ProductSearchIntent | null> }[] =
    [
      { engine: "gemini", call: () => callGemini(message, categories, history) },
      { engine: "groq", call: () => callGroq(message, categories, history) },
      { engine: "openai", call: () => callOpenAI(message, categories, history) },
    ];

  for (const { engine, call } of providers) {
    try {
      const parsed = await call();
      if (!parsed) continue;
      const intent = normalizeIntent(parsed, categories);
      if (Object.keys(intent).length > 0) {
        return { intent, engine };
      }
    } catch (e) {
      console.error(`shop-assistant ${engine} exception:`, e);
    }
  }

  return null;
}

/** @deprecated use parseIntentWithLLM */
export async function parseIntentWithOpenAI(
  message: string,
  categories: CategoryInfo[],
  history: AssistantHistoryItem[]
): Promise<ProductSearchIntent | null> {
  const result = await parseIntentWithLLM(message, categories, history);
  return result?.intent ?? null;
}
