export type BlogPostCard = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string | null;
  published_at: string | null;
  author_name: string | null;
  categories: { slug: string; name: string }[];
};
