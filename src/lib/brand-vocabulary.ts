/**
 * ALMA Lifestyle Brand Vocabulary
 *
 * ❌ NEVER USE these terms (false claims):
 * - "handmade", "handcrafted", "hand-woven", "by hand"
 * - "we make", "we craft", "our artisans", "our weavers"
 * - "হাতে বানানো", "হাতে তৈরি", "তাঁতিদের তৈরি", "কারিগরের"
 *
 * ✅ USE these terms instead:
 * - "premium quality", "carefully selected", "curated"
 * - "we curate", "trusted partners", "quality makers"
 * - "যত্নে বাছাই করা", "প্রিমিয়াম মানের", "বিশ্বস্ত সরবরাহকারী"
 *
 * Note: "hand-picked" is OK (means selected, not made by hand)
 * Note: "নির্বাচিত" / "বাছাই" are OK (means curated)
 */

export const BRAND_VOCABULARY = {
  quality: {
    en: 'Premium quality',
    bn: 'প্রিমিয়াম মান',
  },
  curated: {
    en: 'Carefully curated',
    bn: 'যত্নে বাছাই করা',
  },
  selected: {
    en: 'Hand-picked', // OK: selected, not made by hand
    bn: 'বাছাই করা',
  },
  trusted: {
    en: 'Trusted partners',
    bn: 'বিশ্বস্ত সরবরাহকারী',
  },
  elegant: {
    en: 'Elegant & trendy',
    bn: 'এলিগেন্ট ও ট্রেন্ডি',
  },
  affordable: {
    en: 'Affordable luxury',
    bn: 'সাশ্রয়ী বিলাসিতা',
  },
} as const;
