-- SHE Collection brand defaults (sheco.pk) — safe to re-run
UPDATE cms_settings
SET
  value = jsonb_build_object(
    'brandName', 'SHE Collection',
    'tagline', 'Wear Your Art.',
    'footerDescription', 'Contemporary artificial jewellery from Pakistan since 2017. Elegant Design. Trusted Quality. Contemporary Art. Shop at sheco.pk.',
    'email', 'hello@sheco.pk',
    'phone', '+92 300 0000000',
    'address', 'Lahore, Punjab, Pakistan',
    'hours', 'Mon–Sat: 10AM – 8PM',
    'seoTitle', 'Artificial Jewellery in Pakistan | SHE Collection',
    'seoDescription', 'Shop sleek artificial jewellery at sheco.pk — necklace sets, earrings, bangles & occasion wear. Wear Your Art.',
    'topBarText', 'Nationwide & International Shipping',
    'marqueeText', 'SHE Collection — Elegant Design · Trusted Quality · Contemporary Art'
  ),
  updated_at = now()
WHERE key = 'site';
