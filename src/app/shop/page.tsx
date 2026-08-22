import { Suspense } from "react";
import ShopContent from "./ShopContent";

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
}
