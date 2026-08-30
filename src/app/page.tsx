import HomePageContent from "@/components/HomePageContent";
import { getLatestBlogPosts } from "@/lib/blog/queries";
import { getCmsBundle } from "@/lib/cms/queries";
import { getCategories, getProducts } from "@/lib/products/queries";

export default async function HomePage() {
  const [
    categories,
    bridal,
    necklace,
    bracelet,
    newArrivals,
    earrings,
    bestSelling,
    blogPosts,
    cms,
  ] = await Promise.all([
    getCategories(),
    getProducts({ category: "bridal-sets", limit: 8 }),
    getProducts({ category: "necklace-sets", limit: 8 }),
    getProducts({ category: "bracelet", limit: 8 }),
    getProducts({ filter: "new", limit: 8, sort: "newest" }),
    getProducts({ category: "earrings", limit: 8 }),
    getProducts({ filter: "bestseller", limit: 8, sort: "popular" }),
    getLatestBlogPosts(3),
    getCmsBundle(),
  ]);

  return (
    <HomePageContent
      categories={categories}
      necklaceProducts={necklace.products}
      earringProducts={earrings.products}
      braceletProducts={bracelet.products}
      bridalProducts={bridal.products}
      bestSelling={bestSelling.products}
      bestSellingCount={bestSelling.total}
      newArrivals={newArrivals.products}
      newArrivalsCount={newArrivals.total}
      blogPosts={blogPosts}
      hero={cms.hero}
      homepage={cms.homepage}
      site={cms.site}
      testimonials={cms.testimonials}
      faqs={cms.faqs}
      trustFeatures={cms.trustFeatures}
      video={cms.video}
    />
  );
}
