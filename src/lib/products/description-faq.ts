export type ProductDescriptionFaq = {
  question: string;
  answer: string;
};

const FAQ_HEADING =
  /(?:<[^>]+>\s*)*Frequently\s+Asked\s+Questions(?:\s*<\/[^>]+>)*/i;

function stripTags(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function parseFaqLines(text: string): ProductDescriptionFaq[] {
  const lines = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const items: ProductDescriptionFaq[] = [];
  let pendingQuestion: string | null = null;

  for (const line of lines) {
    const qMatch = line.match(/^Q\d*\s*:\s*(.+)$/i);
    const aMatch = line.match(/^A\s*:\s*(.+)$/i);

    if (qMatch) {
      pendingQuestion = qMatch[1].trim();
      continue;
    }

    if (aMatch && pendingQuestion) {
      items.push({ question: pendingQuestion, answer: aMatch[1].trim() });
      pendingQuestion = null;
      continue;
    }

    if (pendingQuestion && !/^Q\d*\s*:/i.test(line)) {
      pendingQuestion = `${pendingQuestion} ${line}`.trim();
    }
  }

  return items;
}

/** Split imported product HTML into main description + FAQ items. */
export function splitDescriptionAndFaq(rawHtml: string): {
  descriptionHtml: string;
  faqs: ProductDescriptionFaq[];
} {
  if (!rawHtml?.trim()) {
    return { descriptionHtml: "", faqs: [] };
  }

  const headingMatch = rawHtml.match(FAQ_HEADING);
  if (!headingMatch || headingMatch.index === undefined) {
    return { descriptionHtml: rawHtml, faqs: [] };
  }

  const descriptionHtml = rawHtml.slice(0, headingMatch.index).trim();
  const faqHtml = rawHtml.slice(headingMatch.index + headingMatch[0].length);
  const faqs = parseFaqLines(stripTags(faqHtml));

  return { descriptionHtml, faqs };
}
