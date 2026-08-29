-- Website CMS: dynamic content management

CREATE TABLE IF NOT EXISTS cms_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_pages (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  eyebrow TEXT,
  content TEXT NOT NULL DEFAULT '',
  seo_title TEXT,
  seo_description TEXT,
  hero_image TEXT,
  blocks JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  content TEXT NOT NULL,
  image TEXT,
  rating INT NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  sort_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_nav_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location TEXT NOT NULL CHECK (location IN ('header', 'footer_useful', 'footer_legal')),
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS cms_testimonials_sort_idx ON cms_testimonials(sort_order);
CREATE INDEX IF NOT EXISTS cms_faqs_sort_idx ON cms_faqs(sort_order);
CREATE INDEX IF NOT EXISTS cms_nav_location_idx ON cms_nav_links(location, sort_order);

ALTER TABLE cms_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_nav_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read cms_settings" ON cms_settings FOR SELECT USING (true);
CREATE POLICY "Public read cms_pages" ON cms_pages FOR SELECT USING (true);
CREATE POLICY "Public read cms_testimonials" ON cms_testimonials FOR SELECT USING (is_published = true);
CREATE POLICY "Public read cms_faqs" ON cms_faqs FOR SELECT USING (is_published = true);
CREATE POLICY "Public read cms_nav_links" ON cms_nav_links FOR SELECT USING (is_visible = true);

-- Seed defaults (app also falls back if table empty)
INSERT INTO cms_settings (key, value) VALUES
('site', '{
  "brandName": "Lumière.pk",
  "tagline": "Pakistan''s award winning artificial jewellery brand",
  "footerDescription": "Pakistan''s award winning artificial jewellery brand. Premium quality pieces for every occasion since 2009.",
  "email": "hello@lumiere.pk",
  "phone": "+92 300 0000000",
  "address": "Lahore, Punjab, Pakistan",
  "hours": "Mon–Sat: 10AM – 8PM",
  "seoTitle": "Artificial Jewellery in Pakistan | Lumière Jewellery",
  "seoDescription": "Pakistan''s award winning artificial jewellery brand. Shop necklace sets, earrings, bangles, bridal sets and more.",
  "topBarText": "Worldwide Shipping",
  "marqueeText": "Pakistan''s 1st award winning Artificial Jewellery brand"
}'::jsonb),
('homepage.hero', '{
  "eyebrow": "Pakistan''s Award Winning Brand",
  "headlineLine1": "Jewels That Celebrate",
  "headlineLine2": "Togetherness.",
  "description": "Discover handcrafted artificial jewellery — necklace sets, bridal pieces, earrings & more. Crafted for every celebration.",
  "backgroundImage": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1920&h=1200&fit=crop&q=90",
  "primaryCtaLabel": "Shop Collection",
  "primaryCtaHref": "/shop",
  "secondaryCtaLabel": "New Arrivals",
  "secondaryCtaHref": "/shop?filter=new",
  "scrollHint": "Scroll",
  "sceneHint": "Auto rotates · drag to explore"
}'::jsonb),
('homepage.sections', '{
  "seoBlock": {
    "title": "Artificial Jewellery in Pakistan",
    "body": "We as the growing and customer''s favourite Artificial Jewellery Brand in Pakistan have a huge collection of precious jewels made from highest grade of materials and attention to detail."
  },
  "collectionsTitle": "Our Collections",
  "promoBanners": [
    { "label": "Under 1000", "href": "/shop?max=1000", "bgColor": "champagne" },
    { "label": "Under 2000", "href": "/shop?max=2000", "bgColor": "primary" }
  ],
  "showcaseTitles": {
    "necklace-sets": "Necklace Sets",
    "earrings": "Earrings",
    "most-loved": "Our Most Loved Products",
    "best-selling": "Best selling products",
    "bracelet": "Bracelet",
    "bridal-sets": "Bridal Jewellery Sets",
    "new-arrivals": "What''s New"
  },
  "testimonials": {
    "badge": "• TESTIMONIALS",
    "title": "Trusted Reviews From Jewellery Style Enthusiasts",
    "backgroundImage": "/testimonial-bg-cignet.jpg"
  },
  "faq": {
    "title": "Frequently Asked Question",
    "subtitle": "Find answers to common questions about our jewellery, shipping, and ordering process."
  }
}'::jsonb),
('homepage.video', '{
  "backgroundVideo": "/intro-video.mp4",
  "posterImage": "/intro-video-poster.png",
  "youtubeUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
  "features": [
    { "title": "Jewellery Exchanges", "icon": "exchange" },
    { "title": "The Purity Guarantee", "icon": "scale" },
    { "title": "Complete Transparent", "icon": "diamond" },
    { "title": "Lifetime Maintenance", "icon": "maintenance" }
  ]
}'::jsonb),
('trust_features', '[
  { "icon": "globe", "title": "SHIPPING WORLDWIDE", "description": "We are shipping all over the world." },
  { "icon": "shield", "title": "100% PREMIUM", "description": "All of our products are of high quality." },
  { "icon": "credit-card", "title": "SECURE PAYMENT", "description": "All of your payments are secure with us." }
]'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO cms_pages (slug, title, eyebrow, content, seo_title, seo_description, hero_image, blocks) VALUES
('about', 'Crafting Timeless Beauty Since 2009', 'Our Story',
 'Lumière was founded with a vision to create jewellery that transcends trends. Every piece is crafted for Pakistani celebrations with premium materials and attention to detail.',
 'About Us | Lumière Jewellery', 'Learn about Lumière — Pakistan''s award winning artificial jewellery brand.',
 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=1000&fit=crop',
 '[{"title":"Ethical Sourcing","description":"All materials are responsibly sourced for lasting quality."},{"title":"Master Craftsmanship","description":"Each piece is crafted with care and premium finishing."},{"title":"Lifetime Support","description":"We stand behind every piece with dedicated customer care."}]'::jsonb),
('terms', 'Terms of Service', NULL, 'By using Lumière Jewellery website, you agree to these terms.', 'Terms of Service | Lumière Jewellery', 'Terms of service for Lumière.pk', NULL, '[]'::jsonb),
('privacy', 'Privacy Policy', NULL, 'Lumière Jewellery respects your privacy.', 'Privacy Policy | Lumière Jewellery', 'Privacy policy for Lumière.pk', NULL, '[]'::jsonb),
('refund-policy', 'Refund Policy', NULL, 'Our refund and return policy for online orders.', 'Refund Policy | Lumière Jewellery', 'Refund policy for Lumière.pk', NULL, '[]'::jsonb),
('shipping-policy', 'Shipping Policy', NULL, 'Shipping rates and delivery information for Pakistan.', 'Shipping Policy | Lumière Jewellery', 'Shipping policy for Lumière.pk', NULL, '[]'::jsonb),
('contact', 'Contact Us', 'Get in Touch', 'We would love to hear from you.', 'Contact | Lumière Jewellery', 'Contact Lumière customer support', NULL, '[]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO cms_testimonials (name, role, content, image, rating, sort_order) VALUES
('Kavya Shah', 'Working Professional', 'Absolutely loved the quality and design! Premium quality at a great price.', '/testimonial-author-1.jpg', 5, 1),
('Laiba Khan', 'Fashion Influencer', 'The quality and finishing genuinely impressed me.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', 5, 2),
('Rabeeca Khan', 'Working Professional', 'Beautiful pieces for casual and event wear.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop', 5, 3)
ON CONFLICT DO NOTHING;

INSERT INTO cms_faqs (question, answer, sort_order) VALUES
('Do you sell artificial jewellery online in Pakistan?', 'Yes, with delivery available all across Pakistan.', 1),
('What categories of jewellery are available?', 'Necklaces, earrings, bangles, rings, bracelets, and bridal sets.', 2),
('Can I buy bridal jewellery here?', 'Yes, we have a dedicated bridal jewellery collection.', 3),
('Are the pieces durable?', 'Yes, with proper care artificial jewellery maintains its shine for years.', 4),
('Is it safe to order online?', 'Yes. We have been a trusted brand since 2009 with thousands of reviews.', 5)
ON CONFLICT DO NOTHING;

INSERT INTO cms_nav_links (location, label, href, sort_order) VALUES
('header', 'Home', '/', 1),
('header', 'Shop', '/shop', 2),
('header', 'Best selling products', '/shop?filter=bestseller', 3),
('header', 'New Arrivals', '/shop?filter=new', 4),
('header', 'Collections', '/shop', 5),
('header', 'Track Order', '/track-order', 6),
('header', 'Client Reviews', '/#reviews', 7),
('footer_useful', 'Track Your Order', '/track-order', 1),
('footer_useful', 'How To Order?', '/shipping-policy', 2),
('footer_useful', 'Shipping Rates', '/shipping-policy', 3),
('footer_useful', 'About Us', '/about', 4),
('footer_useful', 'Contact Us', '/contact', 5),
('footer_useful', 'FAQs', '/#faq', 6),
('footer_legal', 'Terms of Service', '/terms', 1),
('footer_legal', 'Refund Policy', '/refund-policy', 2),
('footer_legal', 'Privacy Policy', '/privacy', 3),
('footer_legal', 'Shipping Policy', '/shipping-policy', 4)
ON CONFLICT DO NOTHING;
