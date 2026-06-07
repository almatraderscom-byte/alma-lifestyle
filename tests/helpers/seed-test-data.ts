import type { Page } from '@playwright/test';

export const PLAYWRIGHT_TEST_ORDER_TAG = 'PLAYWRIGHT_TEST_ORDER';
export const TEST_PRODUCT_SLUG = 'premium-jaynamaz-j2';
export const TEST_PRODUCT_ID = 'premium-jaynamaz-j2';
export const MURDA_PRODUCT_SLUG = 'smart-murda-moshari';
export const MURDA_PRODUCT_ID = 'smart-murda-moshari';

export const CART_STORAGE_KEY = 'alma-lifestyle-cart';
export const LAST_ORDER_STORAGE_KEY = 'alma-lifestyle-last-order';

export interface TestCartItem {
  productId: string;
  variantId: string;
  title: string;
  priceSnapshot: number;
  quantity: number;
  color: string;
  size: string;
  image: string;
  slug: string;
}

export interface TestCheckoutAddress {
  name: string;
  phone: string;
  email: string;
  district: string;
  thana: string;
  address: string;
  note: string;
}

export const TEST_CHECKOUT_ADDRESS: TestCheckoutAddress = {
  name: `${PLAYWRIGHT_TEST_ORDER_TAG} Customer`,
  phone: '01712345678',
  email: 'playwright-test@almatraders.com',
  district: 'ঢাকা সিটি',
  thana: 'গুলশান',
  address: 'House 12, Test Road',
  note: PLAYWRIGHT_TEST_ORDER_TAG,
};

export function buildTestCartItem(overrides?: Partial<TestCartItem>): TestCartItem {
  const productId = overrides?.productId ?? TEST_PRODUCT_ID;
  const color = overrides?.color ?? 'Black';
  const size = overrides?.size ?? 'XL';

  return {
    productId,
    variantId: `${productId}::${color}::${size}`,
    title: overrides?.title ?? 'Premium Jaynamaz J2',
    priceSnapshot: overrides?.priceSnapshot ?? 1290,
    quantity: overrides?.quantity ?? 1,
    color,
    size,
    image: '/products/premium-jaynamaz-j2.jpg',
    slug: overrides?.slug ?? TEST_PRODUCT_SLUG,
    ...overrides,
  };
}

export async function seedCart(page: Page, items: TestCartItem[] = [buildTestCartItem()]): Promise<void> {
  await page.addInitScript(
    ({ storageKey, cartItems }) => {
      localStorage.setItem(storageKey, JSON.stringify(cartItems));
    },
    { storageKey: CART_STORAGE_KEY, cartItems: items }
  );
}

export async function seedMurdaCart(page: Page): Promise<void> {
  await seedCart(page, [
    buildTestCartItem({
      productId: MURDA_PRODUCT_ID,
      slug: MURDA_PRODUCT_SLUG,
      title: 'Smart Murda Moshari',
      priceSnapshot: 1790,
      color: '—',
      size: '—',
      image: '/products/murda-moshari/hero-black.jpg',
    }),
  ]);
}

export async function clearCartStorage(page: Page): Promise<void> {
  await page.evaluate(
    ({ cartKey, orderKey, dedupePrefix }) => {
      localStorage.removeItem(cartKey);
      sessionStorage.removeItem(orderKey);
      Object.keys(sessionStorage)
        .filter((key) => key.startsWith(dedupePrefix))
        .forEach((key) => sessionStorage.removeItem(key));
    },
    {
      cartKey: CART_STORAGE_KEY,
      orderKey: LAST_ORDER_STORAGE_KEY,
      dedupePrefix: 'alma-pixel-purchase-',
    }
  );
}

export async function seedPlacedOrder(
  page: Page,
  orderNumber = `ALM-${PLAYWRIGHT_TEST_ORDER_TAG}-001`
): Promise<void> {
  const item = buildTestCartItem();
  const order = {
    orderNumber,
    orderNumberDisplay: orderNumber,
    items: [item],
    subtotal: item.priceSnapshot,
    deliveryCharge: 80,
    total: item.priceSnapshot + 80,
    paymentMethod: 'Cash on Delivery',
    customerName: TEST_CHECKOUT_ADDRESS.name,
    customerPhone: TEST_CHECKOUT_ADDRESS.phone,
    cityLabel: TEST_CHECKOUT_ADDRESS.district,
    placedAt: new Date().toISOString(),
  };

  await page.addInitScript(
    ({ orderKey, payload }) => {
      sessionStorage.setItem(orderKey, JSON.stringify(payload));
    },
    { orderKey: LAST_ORDER_STORAGE_KEY, payload: order }
  );
}

export async function cleanupTestStorage(page: Page): Promise<void> {
  await clearCartStorage(page);
}

export async function mockCheckoutOrderApi(page: Page): Promise<void> {
  await page.route('**/api/v1/orders', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'success',
        data: {
          id: 'playwright-order-id',
          orderNumber: `ALM-${PLAYWRIGHT_TEST_ORDER_TAG}-001`,
        },
      }),
    });
  });
}

export async function fillCheckoutForm(page: Page): Promise<void> {
  const address = TEST_CHECKOUT_ADDRESS;
  await page.locator('#checkout-form input[autocomplete="name"]').fill(address.name);
  await page.locator('#checkout-form input[autocomplete="tel"]').fill(address.phone);
  await page.locator('#checkout-form input[autocomplete="email"]').fill(address.email);
  await page.locator('#checkout-form select').selectOption({ value: address.district });
  await page.getByPlaceholder('যেমন: ধানমন্ডি, গুলশান').fill(address.thana);
  await page.getByPlaceholder('বাসা নম্বর, রোড, এলাকা...').fill(address.address);
}
