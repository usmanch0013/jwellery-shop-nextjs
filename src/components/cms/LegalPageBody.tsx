function parseLegalSections(content: string) {
  const chunks = content.split(/\n(?=## )/);

  return chunks
    .map((chunk) => {
      if (chunk.startsWith("## ")) {
        const newline = chunk.indexOf("\n");
        return {
          title: chunk.slice(3, newline > 0 ? newline : undefined).trim(),
          body: newline > 0 ? chunk.slice(newline + 1).trim() : "",
        };
      }
      return { title: null as string | null, body: chunk.trim() };
    })
    .filter((section) => section.title || section.body);
}

export default function LegalPageBody({ content }: { content: string }) {
  const sections = parseLegalSections(content);

  return (
    <article className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
      {sections.map((section, index) => (
        <section
          key={`${section.title ?? "intro"}-${index}`}
          className={
            index > 0 ? "mt-10 border-t border-border/60 pt-10" : "mt-2"
          }
        >
          {section.title ? (
            <h2 className="mb-4 font-serif text-xl text-foreground sm:text-2xl">
              {section.title}
            </h2>
          ) : null}
          <div className="space-y-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-[15px] sm:leading-7">
            {section.body}
          </div>
        </section>
      ))}
    </article>
  );
}

export function isLegalPageSlug(slug: string) {
  return (
    slug === "terms" ||
    slug === "privacy" ||
    slug === "refund-policy" ||
    slug === "shipping-policy" ||
    slug === "cookie-policy"
  );
}
