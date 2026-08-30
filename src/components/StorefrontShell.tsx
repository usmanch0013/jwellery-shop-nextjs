"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { CategoryInfo } from "@/types";
import type { CmsBundle } from "@/lib/cms/types";

export default function StorefrontShell({
  children,
  categories,
  cms,
}: {
  children: React.ReactNode;
  categories: CategoryInfo[];
  cms: CmsBundle;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isAccount = pathname.startsWith("/account");

  if (isAdmin || isAccount) {
    return <>{children}</>;
  }

  return (
    <>
      <Header
        categories={categories}
        headerNav={cms.headerNav}
        topBarText={cms.site.topBarText}
      />
      <main className="w-full flex-1 bg-white">{children}</main>
      <Footer
        categories={categories}
        site={cms.site}
        usefulLinks={cms.footerUsefulLinks}
        legalLinks={cms.footerLegalLinks}
      />
    </>
  );
}
