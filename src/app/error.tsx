"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="py-20 text-center px-4">
      <h1 className="font-serif text-3xl mb-4">Something went wrong</h1>
      <p className="text-muted-foreground mb-6">
        We encountered an unexpected error. Please try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
