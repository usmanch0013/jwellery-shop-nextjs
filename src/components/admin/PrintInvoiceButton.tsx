"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export default function PrintInvoiceButton() {
  useEffect(() => {
    document.title = "Invoice";
    const style = document.createElement("style");
    style.textContent = `
      @media print {
        aside, header, nav { display: none !important; }
        body { background: white !important; }
        .print\\:hidden { display: none !important; }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <div className="mb-6 flex justify-end gap-3 print:hidden">
      <Button type="button" onClick={() => window.print()} className="gap-2">
        <Printer className="h-4 w-4" />
        Print / Save PDF
      </Button>
    </div>
  );
}
