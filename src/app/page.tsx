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
    featured,
    blogPosts,
    cms,
  ] = await Promise.all([
    getCategories(),
    getProducts({ category: "bridal-sets", limit: 12 }),
    getProducts({ category: "necklace-sets", limit: 12 }),
    getProducts({ category: "bracelet", limit: 12 }),
    getProducts({ filter: "new", limit: 12, sort: "newest" }),
    getProducts({ category: "earrings", limit: 12 }),
    getProducts({ filter: "bestseller", limit: 12, sort: "popular" }),
    getProducts({ filter: "featured", limit: 12, sort: "newest" }),
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
      newArrivals={newArrivals.products}
      featuredProducts={featured.products}
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
