'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'alma-lifestyle-cart';

export interface CartItem {
  productId: string;
  variantId: string;
  title: string;
  price: number;
  quantity: number;
  color: string;
  size: string;
  image: string;
  slug: string;
  /** Links cart lines added as one family set purchase */
  familySetId?: string;
  familySetLabel?: string;
}

export type AddToCartInput = Omit<CartItem, 'variantId' | 'quantity'> & {
  quantity?: number;
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

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, items: action.items, hydrated: true };
    case 'ADD_ITEM': {
      const quantity = Math.min(10, Math.max(1, action.item.quantity ?? 1));
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
  itemCount: number;
  subtotal: number;
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
    return parsed.filter(
      (i) =>
        i &&
        typeof i.variantId === 'string' &&
        typeof i.price === 'number' &&
        typeof i.quantity === 'number'
    );
  } catch {
    return [];
  }
}

function saveToStorage(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore quota errors */
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    hydrated: false,
  });

  useEffect(() => {
    dispatch({ type: 'HYDRATE', items: loadFromStorage() });
  }, []);

  useEffect(() => {
    if (state.hydrated) {
      saveToStorage(state.items);
    }
  }, [state.items, state.hydrated]);

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
    () => state.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [state.items]
  );

  const value = useMemo(
    () => ({
      items: state.items,
      hydrated: state.hydrated,
      itemCount,
      subtotal,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [
      state.items,
      state.hydrated,
      itemCount,
      subtotal,
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
