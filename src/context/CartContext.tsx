'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import {
  cartLinePriceChanged,
  fetchLiveCartPrices,
  getCartLineUnitPrice,
  isCartLineUnavailable,
  type LivePriceMap,
} from '@/lib/cart-live-prices';

const STORAGE_KEY = 'alma-lifestyle-cart';
const LIVE_PRICE_POLL_MS = 30_000;

export interface CartItem {
  productId: string;
  variantId: string;
  title: string;
  /** Price (BDT) when item was added — used to detect admin price changes */
  priceSnapshot: number;
  quantity: number;
  color: string;
  size: string;
  image: string;
  slug: string;
  familySetId?: string;
  familySetLabel?: string;
  /** @deprecated use priceSnapshot — migrated on load */
  price?: number;
}

export type AddToCartInput = Omit<CartItem, 'variantId' | 'quantity' | 'priceSnapshot'> & {
  quantity?: number;
  priceSnapshot?: number;
  /** @deprecated use priceSnapshot */
  price?: number;
};

interface CartState {
  items: CartItem[];
  hydrated: boolean;
}

type CartAction =
  | { type: 'HYDRATE'; items: CartItem[] }
  | { type: 'ADD_ITEM'; item: AddToCartInput }
  | { type: 'REMOVE_ITEM'; variantId: string }
  | { type: 'UPDATE_QUANTITY'; variantId: string; quantity: number }
  | { type: 'CLEAR_CART' };

function buildVariantId(productId: string, color: string, size: string): string {
  return `${productId}::${color}::${size}`;
}

function normalizeCartItem(raw: CartItem): CartItem {
  const priceSnapshot = raw.priceSnapshot ?? raw.price ?? 0;
  return { ...raw, priceSnapshot };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return {
        ...state,
        items: action.items.map(normalizeCartItem),
        hydrated: true,
      };
    case 'ADD_ITEM': {
      const quantity = Math.min(10, Math.max(1, action.item.quantity ?? 1));
      const priceSnapshot =
        action.item.priceSnapshot ?? action.item.price ?? 0;
      const variantId = buildVariantId(
        action.item.productId,
        action.item.color,
        action.item.size
      );
      const existing = state.items.find((i) => i.variantId === variantId);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.variantId === variantId
              ? { ...i, quantity: Math.min(10, i.quantity + quantity) }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          {
            ...action.item,
            variantId,
            quantity,
            priceSnapshot,
          },
        ],
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((i) => i.variantId !== action.variantId),
      };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map((i) =>
          i.variantId === action.variantId
            ? { ...i, quantity: Math.min(10, Math.max(1, action.quantity)) }
            : i
        ),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  hydrated: boolean;
  livePrices: LivePriceMap;
  livePricesLoading: boolean;
  itemCount: number;
  subtotal: number;
  getLineUnitPrice: (item: CartItem) => number;
  isLineUnavailable: (item: CartItem) => boolean;
  isLinePriceChanged: (item: CartItem) => boolean;
  hasUnavailableItems: boolean;
  hasPriceChanges: boolean;
  refreshLivePrices: () => Promise<void>;
  addItem: (item: AddToCartInput) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function loadFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (i) =>
          i &&
          typeof i.variantId === 'string' &&
          typeof i.productId === 'string' &&
          typeof i.quantity === 'number'
      )
      .map(normalizeCartItem);
  } catch {
    return [];
  }
}

function saveToStorage(items: CartItem[]) {
  try {
    const lean = items.map(({ price, ...rest }) => rest);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lean));
  } catch {
    /* ignore quota errors */
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    hydrated: false,
  });
  const [livePrices, setLivePrices] = useState<LivePriceMap>({});
  const [livePricesLoading, setLivePricesLoading] = useState(false);

  // useState import missing - need to add useState to imports

  useEffect(() => {
    dispatch({ type: 'HYDRATE', items: loadFromStorage() });
  }, []);

  useEffect(() => {
    if (state.hydrated) {
      saveToStorage(state.items);
    }
  }, [state.items, state.hydrated]);

  const refreshLivePrices = useCallback(async () => {
    const ids = state.items.map((i) => i.productId);
    if (!ids.length) {
      setLivePrices({});
      return;
    }
    setLivePricesLoading(true);
    try {
      const prices = await fetchLiveCartPrices(ids);
      setLivePrices(prices);
    } finally {
      setLivePricesLoading(false);
    }
  }, [state.items]);

  useEffect(() => {
    if (!state.hydrated || state.items.length === 0) return;
    void refreshLivePrices();
    const interval = setInterval(() => void refreshLivePrices(), LIVE_PRICE_POLL_MS);
    return () => clearInterval(interval);
  }, [state.hydrated, state.items, refreshLivePrices]);

  const getLineUnitPrice = useCallback(
    (item: CartItem) => getCartLineUnitPrice(item, livePrices),
    [livePrices]
  );

  const isLineUnavailable = useCallback(
    (item: CartItem) => isCartLineUnavailable(item, livePrices),
    [livePrices]
  );

  const isLinePriceChanged = useCallback(
    (item: CartItem) => cartLinePriceChanged(item, livePrices),
    [livePrices]
  );

  const addItem = useCallback((item: AddToCartInput) => {
    dispatch({ type: 'ADD_ITEM', item });
  }, []);

  const removeItem = useCallback((variantId: string) => {
    dispatch({ type: 'REMOVE_ITEM', variantId });
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', variantId, quantity });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const itemCount = useMemo(
    () => state.items.reduce((sum, i) => sum + i.quantity, 0),
    [state.items]
  );

  const subtotal = useMemo(
    () =>
      state.items.reduce(
        (sum, i) => sum + getCartLineUnitPrice(i, livePrices) * i.quantity,
        0
      ),
    [state.items, livePrices]
  );

  const hasUnavailableItems = useMemo(
    () => state.items.some((i) => isCartLineUnavailable(i, livePrices)),
    [state.items, livePrices]
  );

  const hasPriceChanges = useMemo(
    () => state.items.some((i) => cartLinePriceChanged(i, livePrices)),
    [state.items, livePrices]
  );

  const value = useMemo(
    () => ({
      items: state.items,
      hydrated: state.hydrated,
      livePrices,
      livePricesLoading,
      itemCount,
      subtotal,
      getLineUnitPrice,
      isLineUnavailable,
      isLinePriceChanged,
      hasUnavailableItems,
      hasPriceChanges,
      refreshLivePrices,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [
      state.items,
      state.hydrated,
      livePrices,
      livePricesLoading,
      itemCount,
      subtotal,
      getLineUnitPrice,
      isLineUnavailable,
      isLinePriceChanged,
      hasUnavailableItems,
      hasPriceChanges,
      refreshLivePrices,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
