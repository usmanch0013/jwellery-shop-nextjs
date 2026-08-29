"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { faqs as defaultFaqs } from "@/data/site";
import type { CmsFaq } from "@/lib/cms/types";

export default function FAQ({
  faqs = defaultFaqs.map((f, i) => ({
    id: String(i),
    question: f.q,
    answer: f.a,
    sort_order: i,
    is_published: true,
  })),
  title = "Frequently Asked Question",
  subtitle = "Answers to most common questions about products, orders, shipments, and payments.",
}: {
  faqs?: CmsFaq[];
  title?: string;
  subtitle?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-14 lg:py-20 bg-muted/60">
      <div className="max-w-[800px] mx-auto px-4">
        <h2 className="text-2xl font-medium text-center mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground text-center mb-10">{subtitle}</p>

        <div className="space-y-0 border-t border-border">
          {faqs.map((faq, index) => (
            <div key={faq.id} className="border-b border-border">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between py-5 text-left"
              >
                <span className="text-sm font-medium pr-4">Q: {faq.question}</span>
                {openIndex === index ? (
                  <Minus className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                ) : (
                  <Plus className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                )}
              </button>
              {openIndex === index && (
                <p className="pb-5 text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
