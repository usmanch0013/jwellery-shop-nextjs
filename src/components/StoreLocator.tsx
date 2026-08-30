import { stores } from "@/data/site";
import { MapPin } from "lucide-react";

export default function StoreLocator() {
  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div
              key={store.name}
              className="border border-border p-6 hover:border-sage transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5 text-champagne" />
              </div>
              <h3 className="font-medium mb-2">{store.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{store.address}</p>
              <p className="text-xs text-muted-foreground mb-4">
                <strong>Timings:</strong> {store.timings}
              </p>
              <a
                href="#"
                className="text-xs uppercase tracking-wider text-champagne hover:underline"
              >
                Get Direction →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
