import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import CategoryPageClient from "./CategoryPageClient";
import { getCategoryInfo, getProductsByCategory } from "@/data/products";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { categories } = await import("@/data/products");
  return categories.map((cat) => ({ slug: cat.slug }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryInfo(slug);

  if (!category) notFound();

  const categoryProducts = getProductsByCategory(slug);

  return (
    <div className="py-10 bg-[#faf7f2]">
      <div className="max-w-[1400px] mx-auto px-4">
        <Breadcrumbs
          items={[{ label: "Shop", href: "/shop" }, { label: category.name }]}
        />
        <h1 className="font-serif text-2xl lg:text-3xl text-center mb-2 capitalize">
          {category.name}
        </h1>
        <p className="text-sm text-[#999] text-center mb-2">
          {category.productCount} products
        </p>
      </div>

      <CategoryPageClient products={categoryProducts} />
    </div>
  );
}
