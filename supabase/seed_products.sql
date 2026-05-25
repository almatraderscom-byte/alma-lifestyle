-- =============================================================================
-- Sample design groups + simple products (run after 001–006 + seed.sql)
-- Idempotent: ON CONFLICT DO NOTHING / DO UPDATE where safe
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Helpers: insert product if missing, return id
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION seed_upsert_product(
  p_sku TEXT,
  p_slug TEXT,
  p_title TEXT,
  p_title_bn TEXT,
  p_description TEXT,
  p_price_bdt NUMERIC,
  p_category_slug TEXT,
  p_product_type TEXT DEFAULT 'simple',
  p_design_group_id UUID DEFAULT NULL,
  p_design_group_name TEXT DEFAULT NULL,
  p_display_order INT DEFAULT 0,
  p_age_group TEXT DEFAULT NULL,
  p_fabric TEXT DEFAULT NULL,
  p_origin_country TEXT DEFAULT 'BD',
  p_seo_title TEXT DEFAULT NULL,
  p_seo_description TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_brand UUID;
  v_cat UUID;
  v_id UUID;
  v_usd NUMERIC;
  v_aed NUMERIC;
BEGIN
  SELECT id INTO v_brand FROM brands WHERE slug = 'alma-lifestyle';
  SELECT id INTO v_cat FROM categories WHERE slug = p_category_slug AND brand_id = v_brand;
  v_usd := ROUND(p_price_bdt / 110.0, 2);
  v_aed := ROUND(p_price_bdt / 30.0, 2);

  INSERT INTO products (
    brand_id, category_id, sku, slug, title, title_bn, description,
    price_usd, price_aed, price_bdt, published, published_at,
    product_type, design_group_id, design_group_name, display_order, age_group,
    fabric, origin_country, seo_title, seo_description
  ) VALUES (
    v_brand, v_cat, p_sku, p_slug, p_title, p_title_bn, p_description,
    v_usd, v_aed, p_price_bdt, true, now(),
    p_product_type, p_design_group_id, p_design_group_name, p_display_order, p_age_group,
    p_fabric, p_origin_country, p_seo_title, p_seo_description
  )
  ON CONFLICT (brand_id, sku) DO UPDATE SET
    title = EXCLUDED.title,
    title_bn = EXCLUDED.title_bn,
    description = EXCLUDED.description,
    price_bdt = EXCLUDED.price_bdt,
    price_usd = EXCLUDED.price_usd,
    price_aed = EXCLUDED.price_aed,
    published = EXCLUDED.published,
    product_type = EXCLUDED.product_type,
    design_group_id = COALESCE(EXCLUDED.design_group_id, products.design_group_id),
    design_group_name = COALESCE(EXCLUDED.design_group_name, products.design_group_name),
    display_order = EXCLUDED.display_order,
    age_group = EXCLUDED.age_group,
    fabric = EXCLUDED.fabric,
    origin_country = EXCLUDED.origin_country,
    seo_title = EXCLUDED.seo_title,
    seo_description = EXCLUDED.seo_description,
    updated_at = now()
  RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    SELECT id INTO v_id FROM products WHERE brand_id = v_brand AND sku = p_sku;
  END IF;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION seed_insert_variants(
  p_product_id UUID,
  p_sku_prefix TEXT,
  p_sizes TEXT[],
  p_stock INT
) RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  s TEXT;
BEGIN
  FOREACH s IN ARRAY p_sizes LOOP
    INSERT INTO product_variants (product_id, sku, size, color, stock_quantity)
    VALUES (p_product_id, p_sku_prefix || '-' || s, s, 'Default', p_stock)
    ON CONFLICT (product_id, sku) DO NOTHING;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION seed_add_to_collection(
  p_collection_slug TEXT,
  p_product_id UUID,
  p_sort_order INT DEFAULT 0
) RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_col UUID;
BEGIN
  SELECT c.id INTO v_col
  FROM collections c
  JOIN brands b ON b.id = c.brand_id
  WHERE b.slug = 'alma-lifestyle' AND c.slug = p_collection_slug;

  IF v_col IS NOT NULL THEN
    INSERT INTO collection_products (collection_id, product_id, sort_order)
    VALUES (v_col, p_product_id, p_sort_order)
    ON CONFLICT (collection_id, product_id) DO NOTHING;
  END IF;
END;
$$;

-- -----------------------------------------------------------------------------
-- Design Group 1: রয়্যাল নেভি (Royal Navy) — full family set
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  v_men UUID;
  v_boy UUID;
  v_women UUID;
  v_girl UUID;
  men_sizes TEXT[] := ARRAY['38','40','42','44','46','48','50','52','54'];
  boy_sizes TEXT[] := ARRAY['16','18','20','22','24','26','28','30','32','34','36'];
  women_sizes TEXT[] := ARRAY['S','M','L','XL','XXL'];
BEGIN
  v_men := seed_upsert_product(
    'ALM-PNJ-RN-M', 'royal-navy-men',
    'Royal Navy Men Panjabi', 'রয়্যাল নেভি পুরুষ পাঞ্জাবি',
    'গাঢ় নেভি ব্লু কালারের প্রিমিয়াম ম্যাচিং পাঞ্জাবি। পুরো পরিবারের জন্য একই ডিজাইনে সাজুন ঈদ বা বিশেষ দিনে। উচ্চমানের কটন সিল্ক কাপড়ে তৈরি।',
    2550, 'panjabi', 'men_panjabi', NULL, 'রয়্যাল নেভি', 1,
    NULL, 'Cotton Silk', 'BD',
    'রয়্যাল নেভি পাঞ্জাবি — পুরুষ | ALMA Lifestyle',
    'রয়্যাল নেভি ম্যাচিং পাঞ্জাবি সেট — পুরুষ, ছেলে, মহিলা ও মেয়েদের সাইজে। বাংলাদেশে ডেলিভারি।'
  );
  UPDATE products SET design_group_id = v_men WHERE id = v_men;

  v_boy := seed_upsert_product(
    'ALM-PNJ-RN-B', 'royal-navy-boy',
    'Royal Navy Boy Panjabi', 'রয়্যাল নেভি ছেলে পাঞ্জাবি',
    'বাবা-ছেলে ম্যাচিং লুকের জন্য একই নেভি ডিজাইন। আরামদায়ক ফিট ও মজবুত সেলাই।',
    1200, 'panjabi', 'boy_panjabi', v_men, 'রয়্যাল নেভি', 2,
    NULL, 'Cotton Silk', 'BD',
    'রয়্যাল নেভি ছেলে পাঞ্জাবি | ALMA',
    'রয়্যাল নেভি সিরিজের ছেলেদের পাঞ্জাবি — ম্যাচিং ফ্যামিলি সেট।'
  );

  v_women := seed_upsert_product(
    'ALM-PNJ-RN-W', 'royal-navy-women',
    'Royal Navy Women Three Piece', 'রয়্যাল নেভি মহিলা থ্রি পিস',
    'একই নেভি টোনে মহিলাদের থ্রি পিস — কুর্তি, প্যান্ট ও দুপাট্টা। উৎসবে পরিপূর্ণ লুক।',
    3200, 'panjabi', 'women_three_piece', v_men, 'রয়্যাল নেভি', 3,
    NULL, 'Cotton Silk', 'BD',
    'রয়্যাল নেভি মহিলা থ্রি পিস | ALMA',
    'ম্যাচিং রয়্যাল নেভি থ্রি পিস — পরিবারের সাথে মিলিয়ে পরুন।'
  );

  -- Remove legacy per-age girl products if re-running seed
  DELETE FROM product_variants WHERE product_id IN (
    SELECT id FROM products WHERE sku IN ('ALM-PNJ-RN-G15', 'ALM-PNJ-RN-G69', 'ALM-PNJ-RN-G1014')
  );
  DELETE FROM products WHERE sku IN ('ALM-PNJ-RN-G15', 'ALM-PNJ-RN-G69', 'ALM-PNJ-RN-G1014');

  v_girl := seed_upsert_product(
    'ALM-PNJ-RN-G', 'royal-navy-girl',
    'Royal Navy Girl Two Piece', 'রয়্যাল নেভি মেয়ে শিশু Two Piece',
    'রয়্যাল নেভি ম্যাচিং টু পিস — বয়স অনুযায়ী সাইজ (১-৫, ৬-৯, ১০-১৪ বছর), একই মূল্য।',
    900, 'panjabi', 'girl_two_piece', v_men, 'রয়্যাল নেভি', 4,
    NULL, 'Cotton Silk', 'BD',
    'রয়্যাল নেভি মেয়ে Two Piece | ALMA', 'ম্যাচিং গার্লস টু পিস — এক পণ্য, তিন সাইজ।'
  );

  INSERT INTO product_variants (product_id, sku, size, color, stock_quantity)
  VALUES
    (v_girl, 'ALM-PNJ-RN-G-G15', '১-৫ বছর', 'Default', 10),
    (v_girl, 'ALM-PNJ-RN-G-G69', '৬-৯ বছর', 'Default', 10),
    (v_girl, 'ALM-PNJ-RN-G-G1014', '১০-১৪ বছর', 'Default', 10)
  ON CONFLICT (product_id, sku) DO UPDATE SET
    size = EXCLUDED.size,
    stock_quantity = EXCLUDED.stock_quantity;

  PERFORM seed_insert_variants(v_men, 'ALM-PNJ-RN-M', men_sizes, 20);
  PERFORM seed_insert_variants(v_boy, 'ALM-PNJ-RN-B', boy_sizes, 15);
  PERFORM seed_insert_variants(v_women, 'ALM-PNJ-RN-W', women_sizes, 12);

  PERFORM seed_add_to_collection('new-arrivals', v_men, 1);
  PERFORM seed_add_to_collection('new-arrivals', v_boy, 2);
  PERFORM seed_add_to_collection('new-arrivals', v_women, 3);
  PERFORM seed_add_to_collection('best-sellers', v_men, 1);
END $$;

-- -----------------------------------------------------------------------------
-- Design Group 2: ক্লাসিক সাদা — Father & Son only
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  v_men UUID;
  v_boy UUID;
  men_sizes TEXT[] := ARRAY['38','40','42','44','46','48','50','52','54'];
  boy_sizes TEXT[] := ARRAY['16','18','20','22','24','26','28','30','32','34','36'];
BEGIN
  v_men := seed_upsert_product(
    'ALM-PNJ-CW-M', 'classic-white-panjabi-men',
    'Classic White Men Panjabi', 'ক্লাসিক সাদা পুরুষ পাঞ্জাবি',
    'ঈদ ও জুমার জন্য আদর্শ ক্লাসিক সাদা পাঞ্জাবি। বাবা-ছেলে ম্যাচিং সেটে পরিপূর্ণ পরিবারের লুক। কটন সিল্কে তৈরি হালকা ও আরামদায়ক।',
    1850, 'panjabi', 'men_panjabi', NULL, 'ক্লাসিক সাদা', 1,
    NULL, 'Cotton Silk', 'BD',
    'ক্লাসিক সাদা পাঞ্জাবি — পুরুষ | ALMA Lifestyle',
    'ক্লাসিক সাদা ম্যাচিং পাঞ্জাবি — পুরুষ ও ছেলের সাইজ। ৳১৮৫০ থেকে।'
  );
  UPDATE products SET design_group_id = v_men WHERE id = v_men;

  v_boy := seed_upsert_product(
    'ALM-PNJ-CW-B', 'classic-white-panjabi-boy',
    'Classic White Boy Panjabi', 'ক্লাসিক সাদা ছেলে পাঞ্জাবি',
    'বাবার সাথে মিলিয়ে পরার জন্য একই সাদা ডিজাইন। নরম কাপড়, শিশু-কিশোরদের আরামদায়ক ফিট।',
    950, 'panjabi', 'boy_panjabi', v_men, 'ক্লাসিক সাদা', 2,
    NULL, 'Cotton Silk', 'BD',
    'ক্লাসিক সাদা ছেলে পাঞ্জাবি | ALMA',
    'ক্লাসিক সাদা সিরিজ — ছেলেদের ম্যাচিং পাঞ্জাবি ৳৯৫০।'
  );

  PERFORM seed_insert_variants(v_men, 'ALM-PNJ-CW-M', men_sizes, 20);
  PERFORM seed_insert_variants(v_boy, 'ALM-PNJ-CW-B', boy_sizes, 15);

  PERFORM seed_add_to_collection('new-arrivals', v_men, 4);
  PERFORM seed_add_to_collection('new-arrivals', v_boy, 5);
END $$;

-- -----------------------------------------------------------------------------
-- Design Group 3: সিল্ক প্রিমিয়াম — Men only (no matching)
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  v_men UUID;
  men_sizes TEXT[] := ARRAY['38','40','42','44','46','48','50','52','54'];
BEGIN
  v_men := seed_upsert_product(
    'ALM-PNJ-SP-M', 'silk-premium-panjabi',
    'Silk Premium Panjabi', 'সিল্ক প্রিমিয়াম পাঞ্জাবি',
    '১০০% খাঁটি সিল্কে তৈরি লাক্সারি পাঞ্জাবি। বিশেষ অনুষ্ঠান ও উপহারের জন্য আদর্শ। উজ্জ্বল ফিনিশ ও প্রিমিয়াম সেলাই।',
    3850, 'panjabi', 'men_panjabi', NULL, 'সিল্ক প্রিমিয়াম', 1,
    NULL, 'Pure Silk', 'BD',
    'সিল্ক প্রিমিয়াম পাঞ্জাবি | ALMA Lifestyle',
    'খাঁটি সিল্ক প্রিমিয়াম পাঞ্জাবি — ৳৩৮৫০। বাংলাদেশে ডেলিভারি।'
  );
  UPDATE products SET design_group_id = v_men WHERE id = v_men;

  PERFORM seed_insert_variants(v_men, 'ALM-PNJ-SP-M', men_sizes, 10);

  PERFORM seed_add_to_collection('new-arrivals', v_men, 6);
  PERFORM seed_add_to_collection('best-sellers', v_men, 2);
END $$;

-- -----------------------------------------------------------------------------
-- Simple products (no design group)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION seed_insert_simple_stock(
  p_product_id UUID,
  p_sku TEXT,
  p_stock INT
) RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO product_variants (product_id, sku, size, color, stock_quantity)
  VALUES (p_product_id, p_sku, 'One Size', 'Default', p_stock)
  ON CONFLICT (product_id, sku) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;
END;
$$;

DO $$
DECLARE
  v UUID;
BEGIN
  v := seed_upsert_product(
    'ALM-ELC-001', 'wireless-earbuds-pro',
    'Wireless Earbuds Pro', 'ওয়্যারলেস ইয়ারবাড প্রো',
    'সক্রিয় নয়েজ ক্যান্সেলেশন ও দীর্ঘ ব্যাটারি লাইফ। IPX৫ ওয়াটার রেজিস্ট্যান্ট — দৈনন্দিন ও ওয়ার্কআউটে আদর্শ।',
    3500, 'electronics', 'simple', NULL, NULL, 0,
    NULL, NULL, 'BD',
    'ওয়্যারলেস ইয়ারবাড প্রো | ALMA',
    'প্রিমিয়াম ওয়্যারলেস ইয়ারবাড — ৳৩৫০০। ফ্রি ডেলিভারি ঢাকায়।'
  );
  PERFORM seed_insert_simple_stock(v, 'ALM-ELC-001', 50);
  PERFORM seed_add_to_collection('new-arrivals', v, 7);
  PERFORM seed_add_to_collection('best-sellers', v, 3);

  v := seed_upsert_product(
    'ALM-ELC-002', 'smart-watch-elite',
    'Smart Watch Elite', 'স্মার্ট ওয়াচ এলিট',
    'AMOLED ডিসপ্লে, হার্ট রেট ও স্লিপ ট্র্যাকিং। ব্লুটুথ কল ও নোটিফিকেশন সাপোর্ট। স্টাইলিশ মেটাল বডি।',
    4200, 'electronics', 'simple', NULL, NULL, 0,
    NULL, NULL, 'BD',
    'স্মার্ট ওয়াচ এলিট | ALMA Lifestyle',
    'স্মার্ট ওয়াচ এলিট — ফিটনেস ও লাইফস্টাইল এক ডিভাইসে।'
  );
  PERFORM seed_insert_simple_stock(v, 'ALM-ELC-002', 30);
  PERFORM seed_add_to_collection('new-arrivals', v, 8);

  v := seed_upsert_product(
    'ALM-ACC-001', 'leather-wallet',
    'Leather Wallet', 'লেদার ওয়ালেট',
    'গenuine লেদারে হ্যান্ডক্রাফটেড ওয়ালেট। কার্ড স্লট ও নোট কম্পার্টমেন্ট। দীর্ঘস্থায়ী ও ক্লাসিক ডিজাইন।',
    950, 'accessories', 'simple', NULL, NULL, 0,
    NULL, 'Genuine Leather', 'BD',
    'লেদার ওয়ালেট | ALMA',
    'প্রিমিয়াম লেদার ওয়ালেট — উপহার ও দৈনন্দিন ব্যবহারের জন্য।'
  );
  PERFORM seed_insert_simple_stock(v, 'ALM-ACC-001', 40);
  PERFORM seed_add_to_collection('new-arrivals', v, 9);
  PERFORM seed_add_to_collection('best-sellers', v, 4);

  v := seed_upsert_product(
    'ALM-HMD-001', 'handmade-jute-bag',
    'Handmade Jute Bag', 'হ্যান্ডমেড জুট ব্যাগ',
    'বাংলাদেশি কারিগরদের তৈরি ইকো-ফ্রেন্ডলি জুট ব্যাগ। শপিং ও গিফটের জন্য টেকসই পছন্দ। প্রাকৃতিক টেক্সচার ও মজবুত হ্যান্ডেল।',
    750, 'home-decor', 'simple', NULL, NULL, 0,
    NULL, 'Jute', 'BD',
    'হ্যান্ডমেড জুট ব্যাগ | ALMA',
    'হাতে তৈরি জুট ব্যাগ — টেকসই লাইফস্টাইল পণ্য।'
  );
  PERFORM seed_insert_simple_stock(v, 'ALM-HMD-001', 25);
  PERFORM seed_add_to_collection('new-arrivals', v, 10);
END $$;
