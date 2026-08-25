import HomePageContent from "@/components/HomePageContent";
import {
  getCategories,
  getFeaturedProducts,
  getProducts,
} from "@/lib/products/queries";

export default async function HomePage() {
  const [
    categories,
    necklace,
    earrings,
    bracelet,
    bridal,
    bestSelling,
    newArrivals,
    mostLoved,
  ] = await Promise.all([
    getCategories(),
    getProducts({ category: "necklace-sets", limit: 8 }),
    getProducts({ category: "earrings", limit: 8 }),
    getProducts({ category: "bracelet", limit: 8 }),
    getProducts({ category: "bridal-sets", limit: 8 }),
    getFeaturedProducts({ bestseller: true, limit: 8 }),
    getFeaturedProducts({ isNew: true, limit: 8 }),
    getProducts({ sort: "popular", limit: 4 }),
  ]);

  return (
    <HomePageContent
      categories={categories}
      necklaceProducts={necklace.products}
      earringProducts={earrings.products}
      braceletProducts={bracelet.products}
      bridalProducts={bridal.products}
      bestSelling={bestSelling}
      newArrivals={newArrivals}
      mostLoved={mostLoved.products}
    />
  );
}
