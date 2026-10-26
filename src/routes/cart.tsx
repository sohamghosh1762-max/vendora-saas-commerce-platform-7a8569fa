import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { getProduct, type Product } from "@/data/products";
import { useCart } from "@/lib/cart";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({
    meta: [
      { title: "Your Cart — Vendora" },
      { name: "description", content: "Review the items in your Vendora cart." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function CartPage() {
  const { cartItems, setQty, removeFromCart, hydrated } = useCart();

  const entries = Object.entries(cartItems)
    .map(([id, qty]) => ({ id, qty, product: getProduct(id) }))
    .filter((e): e is { id: string; qty: number; product: Product } => Boolean(e.product));

  const subtotal = entries.reduce((sum, e) => sum + e.product.price * e.qty, 0);

  if (hydrated && entries.length === 0) {
    return (
      <section className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-primary-soft text-primary">
          <ShoppingBag className="size-8" />
        </span>
        <h1 className="mt-4 text-xl font-bold text-foreground">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Discover something wonderful from our independent stores.
        </p>
        <Link
          to="/shop"
          className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
        >
          Start Shopping
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Your Cart</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <ul className="space-y-4">
          {entries.map(({ id, qty, product }) => (
            <li key={id} className="flex items-center gap-4 rounded-2xl border bg-card p-4">
              <img
                src={product.image}
                alt={product.name}
                width={64}
                height={64}
                className="size-16 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <Link
                  to="/product/$id"
                  params={{ id }}
                  className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
                >
                  {product.name}
                </Link>
                <p className="text-xs text-muted-foreground">{product.storeName}</p>
                <p className="mt-1 text-sm font-bold text-foreground">{formatINR(product.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQty(id, qty - 1)}
                  aria-label={`Decrease quantity of ${product.name}`}
                  className="grid size-8 place-items-center rounded-full border text-foreground transition-colors hover:bg-accent"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                <button
                  onClick={() => setQty(id, qty + 1)}
                  aria-label={`Increase quantity of ${product.name}`}
                  className="grid size-8 place-items-center rounded-full border text-foreground transition-colors hover:bg-accent"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
              <button
                onClick={() => removeFromCart(id)}
                aria-label={`Remove ${product.name} from cart`}
                className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-2xl border bg-card p-6 shadow-soft">
          <h2 className="text-base font-bold text-foreground">Order Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-semibold">{formatINR(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="font-semibold text-success">Free</dd>
            </div>
            <div className="flex justify-between border-t pt-2 text-base">
              <dt className="font-bold">Total</dt>
              <dd className="font-extrabold">{formatINR(subtotal)}</dd>
            </div>
          </dl>
          <button
            disabled
            title="Demo — checkout isn't connected yet"
            className="mt-5 w-full cursor-not-allowed rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground opacity-70"
          >
            Checkout
          </button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Demo experience — checkout isn't connected yet.
          </p>
        </aside>
      </div>
    </section>
  );
}
