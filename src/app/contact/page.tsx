"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { toast } from "sonner";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitContactAction } from "@/actions/contact";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const result = await submitContactAction(new FormData(e.currentTarget));
    setLoading(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Message sent! We'll get back to you soon.");
      e.currentTarget.reset();
    }
  };

  return (
    <div className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Contact" }]} />

        <div className="text-center mb-12">
          <p className="text-gold uppercase tracking-[0.3em] text-sm mb-2">
            Get in Touch
          </p>
          <h1 className="text-4xl lg:text-5xl font-serif font-semibold">
            Contact Us
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div className="space-y-8">
            {[
              {
                icon: MapPin,
                title: "Visit Our Boutique",
                text: "123 Fifth Avenue, New York, NY 10003",
              },
              {
                icon: Phone,
                title: "Call Us",
                text: "+1 (800) 555-LUME",
              },
              {
                icon: Mail,
                title: "Email Us",
                text: "hello@lumiere.com",
              },
              {
                icon: Clock,
                title: "Opening Hours",
                text: "Mon–Sat: 10am–7pm | Sun: 12pm–5pm",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-8 border border-border rounded-lg space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject (optional)</Label>
              <Input id="subject" name="subject" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                minLength={10}
                className="flex w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-emerald-dark text-white h-11 uppercase tracking-wider"
            >
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
