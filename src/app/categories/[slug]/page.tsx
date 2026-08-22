import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductGrid from "@/components/ProductGrid";
import { categories, getProductsByCategory } from "@/data/products";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return categories.map((cat) => ({ slug: cat.slug }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);

  if (!category) notFound();

  const categoryProducts = getProductsByCategory(slug);

  return (
    <div className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Shop", href: "/shop" },
            { label: category.name },
          ]}
        />
        <div className="text-center mb-4">
          <p className="text-gold uppercase tracking-[0.3em] text-sm mb-2">
            Collection
          </p>
          <h1 className="text-4xl lg:text-5xl font-serif font-semibold mb-4">
            {category.name}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {category.description}
          </p>
        </div>
      </div>

      <ProductGrid products={categoryProducts} />
    </div>
  );
}
