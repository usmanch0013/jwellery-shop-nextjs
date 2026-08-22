import { Product } from "@/types";

export const categories = [
  { slug: "rings" as const, name: "Rings", description: "Timeless bands & statement rings" },
  { slug: "necklaces" as const, name: "Necklaces", description: "Elegant chains & pendants" },
  { slug: "earrings" as const, name: "Earrings", description: "Studs, hoops & drops" },
  { slug: "bracelets" as const, name: "Bracelets", description: "Delicate cuffs & bangles" },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Eternal Gold Band",
    description:
      "A classic 18K gold wedding band with a polished finish. Crafted for everyday elegance and lasting beauty.",
    price: 1299,
    category: "rings",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop",
    material: "18K Gold",
    isBestseller: true,
  },
  {
    id: "2",
    name: "Diamond Solitaire Ring",
    description:
      "Stunning 1-carat diamond solitaire set in platinum. A symbol of eternal love and commitment.",
    price: 4999,
    originalPrice: 5499,
    category: "rings",
    image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&h=600&fit=crop",
    material: "Platinum & Diamond",
    isNew: true,
  },
  {
    id: "3",
    name: "Rose Gold Stack Ring",
    description:
      "Delicate rose gold stackable ring with micro-pavé diamonds. Perfect for layering.",
    price: 449,
    category: "rings",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop",
    material: "14K Rose Gold",
  },
  {
    id: "4",
    name: "Pearl Strand Necklace",
    description:
      "Lustrous freshwater pearl necklace with 18K gold clasp. A timeless addition to any collection.",
    price: 899,
    category: "necklaces",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop",
    material: "Freshwater Pearls & 18K Gold",
    isBestseller: true,
  },
  {
    id: "5",
    name: "Sapphire Pendant",
    description:
      "Deep blue sapphire pendant on an 18K gold chain. Handcrafted with exceptional attention to detail.",
    price: 2199,
    category: "necklaces",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop",
    material: "18K Gold & Sapphire",
    isNew: true,
  },
  {
    id: "6",
    name: "Layered Gold Chain",
    description:
      "Three-layer 14K gold chain necklace. Effortlessly chic for day or evening wear.",
    price: 649,
    category: "necklaces",
    image: "https://images.unsplash.com/photo-1590548780032-5a3a5c5c5c5c?w=600&h=600&fit=crop",
    material: "14K Gold",
  },
  {
    id: "7",
    name: "Diamond Stud Earrings",
    description:
      "Classic 0.5ct diamond stud earrings in 14K white gold. A wardrobe essential.",
    price: 1599,
    category: "earrings",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop",
    material: "14K White Gold & Diamond",
    isBestseller: true,
  },
  {
    id: "8",
    name: "Gold Hoop Earrings",
    description:
      "Medium-sized 18K gold hoop earrings. Lightweight and comfortable for all-day wear.",
    price: 399,
    category: "earrings",
    image: "https://images.unsplash.com/photo-1630019853432-7b4aa2a6b0a0?w=600&h=600&fit=crop",
    material: "18K Gold",
  },
  {
    id: "9",
    name: "Emerald Drop Earrings",
    description:
      "Elegant emerald drop earrings with diamond accents. Perfect for special occasions.",
    price: 2899,
    originalPrice: 3299,
    category: "earrings",
    image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=600&fit=crop",
    material: "18K Gold, Emerald & Diamond",
    isNew: true,
  },
  {
    id: "10",
    name: "Tennis Bracelet",
    description:
      "Stunning diamond tennis bracelet with 3 carats total weight. A true showstopper.",
    price: 3499,
    category: "bracelets",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop",
    material: "14K White Gold & Diamond",
    isBestseller: true,
  },
  {
    id: "11",
    name: "Gold Bangle Set",
    description:
      "Set of three thin 18K gold bangles. Wear together or separately for versatile styling.",
    price: 799,
    category: "bracelets",
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&h=600&fit=crop",
    material: "18K Gold",
  },
  {
    id: "12",
    name: "Charm Bracelet",
    description:
      "Sterling silver charm bracelet with customizable charms. Tell your unique story.",
    price: 299,
    category: "bracelets",
    image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=600&fit=crop",
    material: "Sterling Silver",
    isNew: true,
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(price);
}
