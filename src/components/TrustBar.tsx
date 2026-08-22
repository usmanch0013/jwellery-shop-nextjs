import { Globe, Shield, CreditCard } from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "SHIPPING WORLDWIDE",
    description: "We are shipping all over the world.",
  },
  {
    icon: Shield,
    title: "100% PREMIUM",
    description: "All of our products are of high quality.",
  },
  {
    icon: CreditCard,
    title: "SECURE PAYMENT",
    description: "All of your payments are secure with us.",
  },
];

export default function TrustBar() {
  return (
    <section className="border-y border-[#eee] bg-white">
      <div className="max-w-[1400px] mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-center text-center"
            >
              <feature.icon className="w-8 h-8 text-[#a2937c] mb-3" strokeWidth={1.5} />
              <h3 className="text-xs font-medium uppercase tracking-widest mb-1">
                {feature.title}
              </h3>
              <p className="text-xs text-[#666]">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
