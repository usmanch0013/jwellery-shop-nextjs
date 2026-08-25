import { Category, CategoryInfo, Product } from "@/types";

export const categories: CategoryInfo[] = [
  {
    slug: "necklace-sets",
    name: "Necklace Sets",
    description: "Stunning necklace sets for every occasion",
    productCount: 3,
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=800&fit=crop",
  },
  {
    slug: "earrings",
    name: "Earrings",
    description: "Studs, hoops, jhumkas & drops",
    productCount: 3,
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=800&fit=crop",
  },
  {
    slug: "bangles",
    name: "Bangles",
    description: "Statement bangles & kadas",
    productCount: 1,
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&h=800&fit=crop",
  },
  {
    slug: "finger-ring",
    name: "Finger Ring",
    description: "Rings for every style",
    productCount: 1,
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=800&fit=crop",
  },
  {
    slug: "bracelet",
    name: "Bracelet",
    description: "Charm, cuff & chain bracelets",
    productCount: 4,
    image:
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=800&fit=crop",
  },
  {
    slug: "bridal-sets",
    name: "Bridal Sets",
    description: "Complete bridal jewellery sets",
    productCount: 3,
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=800&fit=crop",
  },
  {
    slug: "chains",
    name: "Chains",
    description: "Elegant chains & long malas",
    productCount: 0,
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=800&fit=crop",
  },
  {
    slug: "anklets",
    name: "Anklets",
    description: "Delicate payal designs",
    productCount: 0,
    image:
      "https://images.unsplash.com/photo-1602751584552-8ba73aad10cd?w=600&h=800&fit=crop",
  },
  {
    slug: "bindiya-jhumar",
    name: "Bindiya & Jhumar",
    description: "Traditional bridal headpieces",
    productCount: 0,
    image:
      "https://images.unsplash.com/photo-1583937443569-f14a5bcdfbb6?w=600&h=800&fit=crop",
  },
  {
    slug: "matha-pati",
    name: "Matha Pati",
    description: "Forehead jewellery",
    productCount: 0,
    image:
      "https://images.unsplash.com/photo-1596944924616-7b384dd8ed56?w=600&h=800&fit=crop",
  },
  {
    slug: "nose-ring",
    name: "Nose Ring",
    description: "Nath & nose pin collection",
    productCount: 0,
    image:
      "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&h=800&fit=crop",
  },
  {
    slug: "accessories",
    name: "Accessories",
    description: "Jewellery accessories",
    productCount: 0,
    image:
      "https://images.unsplash.com/photo-1630019853432-7b4aa2a6b0a0?w=600&h=800&fit=crop",
  },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Swirling Leaf AD Necklace Set",
    description:
      "Elegant American Diamond necklace set with matching earrings. Perfect for weddings and festive occasions.",
    price: 12800,
    originalPrice: 16000,
    category: "necklace-sets",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop",
    material: "American Diamond",
    reviews: 46,
    isBestseller: true,
  },
  {
    id: "2",
    name: "Scalloped Fan Baguette Necklace Set",
    description:
      "Stunning baguette cut necklace set with scalloped fan design. A statement piece for special events.",
    price: 18800,
    originalPrice: 24000,
    category: "necklace-sets",
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop",
    material: "Baguette AD",
    reviews: 46,
    isBestseller: true,
  },
  {
    id: "3",
    name: "Baguette American Diamond Necklace Set",
    description:
      "Premium baguette AD necklace set with intricate detailing and premium finish.",
    price: 18800,
    category: "necklace-sets",
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop",
    material: "American Diamond",
    reviews: 8,
    isNew: true,
  },
  {
    id: "4",
    name: "Dainty Bell Teardrop Earrings",
    description:
      "Delicate teardrop earrings with bell motif. Lightweight and perfect for daily wear.",
    price: 1000,
    originalPrice: 1400,
    category: "earrings",
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&h=600&fit=crop",
    material: "Gold Plated",
    reviews: 48,
    isBestseller: true,
  },
  {
    id: "5",
    name: "Micro Zirconia Monogram Hoop Earrings",
    description:
      "Trendy hoop earrings with micro zirconia stones. Versatile for casual and formal looks.",
    price: 1000,
    category: "earrings",
    image:
      "https://images.unsplash.com/photo-1630019853432-7b4aa2a6b0a0?w=600&h=600&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=600&fit=crop",
    material: "Zirconia",
    reviews: 28,
  },
  {
    id: "6",
    name: "Mesh Chain Watch Face Earrings",
    description:
      "Unique watch face inspired earrings with mesh chain detail.",
    price: 700,
    category: "earrings",
    image:
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=600&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1630019853432-7b4aa2a6b0a0?w=600&h=600&fit=crop",
    material: "Gold Plated",
    reviews: 14,
    isNew: true,
  },
  {
    id: "7",
    name: "Scalloped Pearl Filigree Statement Bangles",
    description:
      "Statement bangles with pearl filigree work. Perfect for weddings and mehndi.",
    price: 4500,
    originalPrice: 5500,
    category: "bangles",
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&h=600&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=600&fit=crop",
    material: "Pearl & Gold",
    reviews: 24,
    isBestseller: true,
  },
  {
    id: "8",
    name: "Double Chain Tree Medallion Bracelet",
    description:
      "Elegant double chain bracelet with tree medallion charm.",
    price: 1100,
    category: "bracelet",
    image:
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=600&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop",
    material: "Gold Plated",
    reviews: 8,
    isNew: true,
  },
  {
    id: "9",
    name: "Double Floral Border Crystal Bracelet",
    description:
      "Crystal embellished bracelet with floral border design.",
    price: 1600,
    category: "bracelet",
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=600&fit=crop",
    material: "Crystal",
    reviews: 4,
  },
  {
    id: "10",
    name: "Luxe Roman Numeral Watch Bracelet",
    description:
      "Trendy watch-style bracelet with roman numeral dial design.",
    price: 1500,
    originalPrice: 1900,
    category: "bracelet",
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&h=600&fit=crop",
    material: "Gold Plated",
    reviews: 32,
    isBestseller: true,
  },
  {
    id: "11",
    name: "Crimson Gemstone Hasli Necklace Set",
    description:
      "Traditional hasli necklace set with crimson gemstones. Bridal favourite.",
    price: 5600,
    originalPrice: 7000,
    category: "bridal-sets",
    image:
      "https://images.unsplash.com/photo-1583937443569-f14a5bcdfbb6?w=600&h=600&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1596944924616-7b384dd8ed56?w=600&h=600&fit=crop",
    material: "Gemstone",
    reviews: 4,
  },
  {
    id: "12",
    name: "Shahi Gemstone Hasli Necklace Set",
    description:
      "Royal inspired hasli set with premium gemstone work.",
    price: 5300,
    category: "bridal-sets",
    image:
      "https://images.unsplash.com/photo-1596944924616-7b384dd8ed56?w=600&h=600&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1583937443569-f14a5bcdfbb6?w=600&h=600&fit=crop",
    material: "Gemstone",
    reviews: 2,
    soldOut: true,
  },
  {
    id: "13",
    name: "Victoria Teardrop Gems Bridal Set",
    description:
      "Luxurious complete bridal set with teardrop gemstones.",
    price: 33600,
    originalPrice: 42000,
    category: "bridal-sets",
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1583937443569-f14a5bcdfbb6?w=600&h=600&fit=crop",
    material: "Premium AD",
    reviews: 30,
    isBestseller: true,
  },
  {
    id: "14",
    name: "Chic Metallic Sphere Slave Bracelet",
    description:
      "Trendy slave bracelet with metallic sphere charms.",
    price: 1300,
    category: "bracelet",
    image:
      "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&h=600&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=600&fit=crop",
    material: "Metallic",
    reviews: 40,
    isNew: true,
  },
  {
    id: "15",
    name: "Crown Ring-8290",
    description: "Elegant crown design finger ring with crystal stones.",
    price: 850,
    originalPrice: 1100,
    category: "finger-ring",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&h=600&fit=crop",
    material: "Gold Plated",
    reviews: 18,
  },
];

export { formatPrice } from "@/lib/products/format";

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getCategoryInfo(slug: string): CategoryInfo | undefined {
  return categories.find((c) => c.slug === slug);
}

export const priceFilters = [
  { slug: "under-1000", name: "Under 1000", max: 1000 },
  { slug: "under-2000", name: "Under 2000", max: 2000 },
];

export function getProductsByMaxPrice(max: number): Product[] {
  return products.filter((p) => p.price <= max);
}
