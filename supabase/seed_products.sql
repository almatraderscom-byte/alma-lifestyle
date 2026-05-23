-- =============================================================================
-- Sample design groups + simple products (run after 001–006 + seed.sql)
-- =============================================================================

-- Design Group 1: Royal Navy — family set
DO $$
DECLARE
  v_brand UUID;
  v_cat UUID;
  v_men UUID;
BEGIN
  SELECT id INTO v_brand FROM brands WHERE slug = 'alma-lifestyle';
  SELECT id INTO v_cat FROM categories WHERE slug = 'panjabi' AND brand_id = v_brand;

  INSERT INTO products (
    brand_id, category_id, sku, slug, title, title_bn, description,
    price_usd, price_aed, price_bdt, published, published_at,
    product_type, design_group_name, display_order
  ) VALUES (
    v_brand, v_cat, 'RN-MEN-001', 'royal-navy-men', 'Royal Navy Men Panjabi', 'রয়্যাল নেভি পুরুষ',
    'Premium matching panjabi', 23.18, 85.00, 2550, true, now(),
    'men_panjabi', 'রয়্যাল নেভি', 1
  ) RETURNING id INTO v_men;

  UPDATE products SET design_group_id = v_men WHERE id = v_men;

  INSERT INTO products (
    brand_id, category_id, sku, slug, title, description,
    price_usd, price_aed, price_bdt, published, published_at,
    product_type, design_group_id, design_group_name, display_order
  ) VALUES
    (v_brand, v_cat, 'RN-BOY-001', 'royal-navy-boy', 'Royal Navy Boy Panjabi', 'Boy matching panjabi',
     10.91, 40.00, 1200, true, now(), 'boy_panjabi', v_men, 'রয়্যাল নেভি', 2),
    (v_brand, v_cat, 'RN-WOM-001', 'royal-navy-women', 'Royal Navy Women Three Piece', 'Women three piece',
     29.09, 106.67, 3200, true, now(), 'women_three_piece', v_men, 'রয়্যাল নেভি', 3),
    (v_brand, v_cat, 'RN-G15-001', 'royal-navy-girl-1-5', 'Royal Navy Girl 1-5', 'Girl two piece 1-5',
     7.27, 26.67, 800, true, now(), 'girl_two_piece', v_men, 'রয়্যাল নেভি', 4),
    (v_brand, v_cat, 'RN-G69-001', 'royal-navy-girl-6-9', 'Royal Navy Girl 6-9', 'Girl two piece 6-9',
     8.64, 31.67, 950, true, now(), 'girl_two_piece', v_men, 'রয়্যাল নেভি', 4),
    (v_brand, v_cat, 'RN-G1014-001', 'royal-navy-girl-10-14', 'Royal Navy Girl 10-14', 'Girl two piece 10-14',
     10.00, 36.67, 1100, true, now(), 'girl_two_piece', v_men, 'রয়্যাল নেভি', 4);

  UPDATE products SET age_group = '1-5' WHERE slug = 'royal-navy-girl-1-5';
  UPDATE products SET age_group = '6-9' WHERE slug = 'royal-navy-girl-6-9';
  UPDATE products SET age_group = '10-14' WHERE slug = 'royal-navy-girl-10-14';
END $$;
