"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { faqs } from "@/data/site";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-14 lg:py-20 bg-[#f9f9f9]">
      <div className="max-w-[800px] mx-auto px-4">
        <h2 className="text-2xl font-medium text-center mb-2">
          Frequently Asked Question
        </h2>
        <p className="text-sm text-[#666] text-center mb-10">
          Answers to most common questions about products, orders, shipments, and
          payments.
        </p>

        <div className="space-y-0 border-t border-[#eee]">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-[#eee]">
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="w-full flex items-center justify-between py-5 text-left"
              >
                <span className="text-sm font-medium pr-4">
                  Q: {faq.q}
                </span>
                {openIndex === index ? (
                  <Minus className="w-4 h-4 flex-shrink-0 text-[#999]" />
                ) : (
                  <Plus className="w-4 h-4 flex-shrink-0 text-[#999]" />
                )}
              </button>
              {openIndex === index && (
                <p className="text-sm text-[#666] pb-5 leading-relaxed">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
