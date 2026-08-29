import { Globe, Shield, CreditCard } from "lucide-react";
import { DEFAULT_TRUST_FEATURES } from "@/lib/cms/defaults";
import type { CmsTrustFeature } from "@/lib/cms/types";

const iconMap = {
  globe: Globe,
  shield: Shield,
  "credit-card": CreditCard,
} as const;

export default function TrustBar({
  features = DEFAULT_TRUST_FEATURES,
}: {
  features?: CmsTrustFeature[];
}) {
  return (
    <section className="border-y border-sage/30 bg-background">
      <div className="max-w-[1400px] mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = iconMap[feature.icon as keyof typeof iconMap] ?? Shield;
            return (
              <div
                key={feature.title}
                className="flex flex-col items-center text-center"
              >
                <Icon className="w-8 h-8 text-champagne mb-3" strokeWidth={1.5} />
                <h3 className="text-xs font-medium uppercase tracking-widest mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
