"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Thank you for subscribing!");
      setEmail("");
    }
  };

  return (
    <section className="py-16 lg:py-20 bg-charcoal text-cream">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <p className="text-gold uppercase tracking-[0.3em] text-sm mb-3">
          Newsletter
        </p>
        <h2 className="text-3xl lg:text-4xl font-serif font-semibold mb-4">
          Join the Lumière Family
        </h2>
        <p className="text-cream/70 mb-8 max-w-md mx-auto">
          Be the first to know about new collections, exclusive offers, and
          styling tips from our experts.
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-charcoal-light border-cream/20 text-cream placeholder:text-cream/40 h-12"
          />
          <Button
            type="submit"
            className="bg-gold hover:bg-gold-dark text-white h-12 px-8 uppercase tracking-wider"
          >
            Subscribe
          </Button>
        </form>
      </div>
    </section>
  );
}
