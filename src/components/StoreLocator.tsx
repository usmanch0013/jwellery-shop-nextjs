import { stores } from "@/data/site";
import { MapPin } from "lucide-react";

export default function StoreLocator() {
  return (
    <section className="py-14 lg:py-20 bg-white">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div
              key={store.name}
              className="border border-[#eee] p-6 hover:border-[#ccc] transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[#f6f4f2] flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5 text-[#a2937c]" />
              </div>
              <h3 className="font-medium mb-2">{store.name}</h3>
              <p className="text-sm text-[#666] mb-3">{store.address}</p>
              <p className="text-xs text-[#999] mb-4">
                <strong>Timings:</strong> {store.timings}
              </p>
              <a
                href="#"
                className="text-xs uppercase tracking-wider text-[#a2937c] hover:underline"
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
