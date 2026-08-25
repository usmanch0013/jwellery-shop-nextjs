"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { CategoryInfo } from "@/types";

export default function StorefrontShell({
  children,
  categories,
}: {
  children: React.ReactNode;
  categories: CategoryInfo[];
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header categories={categories} />
      <main className="flex-1 w-full">{children}</main>
      <Footer categories={categories} />
    </>
  );
}
