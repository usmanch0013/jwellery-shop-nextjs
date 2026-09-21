UPDATE cms_settings
SET
  value = '{
    "eyebrow": "SHE Collection · Since 2017",
    "headlineLine1": "Elegant Artificial Jewellery",
    "headlineLine2": "For Every Occasion",
    "description": "Necklace sets, earrings, bangles & bridal pieces with contemporary design and premium finishing — trusted Pakistani style since 2017. Wear Your Art.",
    "backgroundImage": "/she-hero-poster.jpg",
    "backgroundVideo": "/she-hero.mp4",
    "primaryCtaLabel": "Shop Collection",
    "primaryCtaHref": "/shop",
    "secondaryCtaLabel": "New Arrivals",
    "secondaryCtaHref": "/shop?filter=new",
    "scrollHint": "Scroll",
    "sceneHint": ""
  }'::jsonb,
  updated_at = now()
WHERE key = 'homepage.hero';
