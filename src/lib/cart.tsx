import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";

type CartState = {
  /** productId -> quantity */
  items: Record<string, number>;
  wishlist: string[];
  coupon: string | null;
  hydrated: boolean;
};

type CartAction =
  | { type: "ADD"; id: string; qty?: number }
  | { type: "REMOVE"; id: string }
  | { type: "SET_QTY"; id: string; qty: number }
  | { type: "CLEAR" }
  | { type: "TOGGLE_WISHLIST"; id: string }
  | { type: "SET_COUPON"; coupon: string | null }
  | { type: "HYDRATE"; items: Record<string, number>; wishlist: string[]; coupon: string | null };

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const current = state.items[action.id] ?? 0;
      const amount = action.qty !== undefined && action.qty > 0 ? action.qty : 1;
      return { ...state, items: { ...state.items, [action.id]: current + amount } };
    }
    case "REMOVE": {
      const items = { ...state.items };
      delete items[action.id];
      return { ...state, items };
    }
    case "SET_QTY": {
      const items = { ...state.items };
      if (action.qty <= 0) delete items[action.id];
      else items[action.id] = action.qty;
      return { ...state, items };
    }
    case "CLEAR": {
      return { ...state, items: {}, coupon: null };
    }
    case "TOGGLE_WISHLIST": {
      const has = state.wishlist.includes(action.id);
      return {
        ...state,
        wishlist: has
          ? state.wishlist.filter((w) => w !== action.id)
          : [...state.wishlist, action.id],
      };
    }
    case "SET_COUPON": {
      return { ...state, coupon: action.coupon };
    }
    case "HYDRATE":
      return {
        items: action.items,
        wishlist: action.wishlist,
        coupon: action.coupon,
        hydrated: true,
      };
    default:
      return state;
  }
}

const STORAGE_KEY = "vendora-cart-v1";

type CartContextValue = {
  cartCount: number;
  cartItems: Record<string, number>;
  wishlist: string[];
  coupon: string | null;
  hydrated: boolean;
  addToCart: (id: string, qty?: number) => void;
  removeFromCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  setCoupon: (code: string | null) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    items: {},
    wishlist: [],
    coupon: null,
    hydrated: false,
  });

  // Load persisted state after mount (SSR-safe).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<CartState>;
        dispatch({
          type: "HYDRATE",
          items: parsed.items ?? {},
          wishlist: parsed.wishlist ?? [],
          coupon: parsed.coupon ?? null,
        });
        return;
      }
    } catch {
      // Ignore corrupted storage.
    }
    dispatch({ type: "HYDRATE", items: {}, wishlist: [], coupon: null });
  }, []);

  // Persist after hydration.
  useEffect(() => {
    if (!state.hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          items: state.items,
          wishlist: state.wishlist,
          coupon: state.coupon,
        }),
      );
    } catch {
      // Storage unavailable.
    }
  }, [state]);

  const value = useMemo<CartContextValue>(() => {
    const cartCount = Object.values(state.items).reduce((a, b) => a + b, 0);
    return {
      cartCount,
      cartItems: state.items,
      wishlist: state.wishlist,
      coupon: state.coupon,
      hydrated: state.hydrated,
      addToCart: (id, qty) => dispatch({ type: "ADD", id, qty }),
      removeFromCart: (id) => dispatch({ type: "REMOVE", id }),
      setQty: (id, qty) => dispatch({ type: "SET_QTY", id, qty }),
      clearCart: () => dispatch({ type: "CLEAR" }),
      toggleWishlist: (id) => dispatch({ type: "TOGGLE_WISHLIST", id }),
      isWishlisted: (id) => state.wishlist.includes(id),
      setCoupon: (coupon) => dispatch({ type: "SET_COUPON", coupon }),
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
