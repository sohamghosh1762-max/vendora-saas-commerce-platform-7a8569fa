import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";

type CartState = {
  /** productId -> quantity */
  items: Record<string, number>;
  wishlist: string[];
  hydrated: boolean;
};

type CartAction =
  | { type: "ADD"; id: string }
  | { type: "REMOVE"; id: string }
  | { type: "SET_QTY"; id: string; qty: number }
  | { type: "TOGGLE_WISHLIST"; id: string }
  | { type: "HYDRATE"; items: Record<string, number>; wishlist: string[] };

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const qty = state.items[action.id] ?? 0;
      return { ...state, items: { ...state.items, [action.id]: qty + 1 } };
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
    case "TOGGLE_WISHLIST": {
      const has = state.wishlist.includes(action.id);
      return {
        ...state,
        wishlist: has
          ? state.wishlist.filter((w) => w !== action.id)
          : [...state.wishlist, action.id],
      };
    }
    case "HYDRATE":
      return { items: action.items, wishlist: action.wishlist, hydrated: true };
    default:
      return state;
  }
}

const STORAGE_KEY = "vendora-cart-v1";

type CartContextValue = {
  cartCount: number;
  cartItems: Record<string, number>;
  wishlist: string[];
  hydrated: boolean;
  addToCart: (id: string) => void;
  removeFromCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    items: {},
    wishlist: [],
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
        });
        return;
      }
    } catch {
      // Ignore corrupted storage.
    }
    dispatch({ type: "HYDRATE", items: {}, wishlist: [] });
  }, []);

  // Persist after hydration.
  useEffect(() => {
    if (!state.hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ items: state.items, wishlist: state.wishlist }),
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
      hydrated: state.hydrated,
      addToCart: (id) => dispatch({ type: "ADD", id }),
      removeFromCart: (id) => dispatch({ type: "REMOVE", id }),
      setQty: (id, qty) => dispatch({ type: "SET_QTY", id, qty }),
      toggleWishlist: (id) => dispatch({ type: "TOGGLE_WISHLIST", id }),
      isWishlisted: (id) => state.wishlist.includes(id),
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
