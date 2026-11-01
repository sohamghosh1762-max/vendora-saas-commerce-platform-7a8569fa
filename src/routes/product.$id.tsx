import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Heart, Minus, Plus, ShieldCheck, Star, Truck, RotateCcw } from "lucide-react";
import { useState } from "react";
import { getProduct } from "@/data/products";
import { formatINR } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  component: ProductDetailPage,
  head: () => ({
    meta: [{ title: "Product — Vendora" }, { name: "robots", content: "noindex" }],
  }),
});

function ProductDetailPage() {
  const { product } = Route.useLoaderData();
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const [qty, setQty] = useState(1);
  const wishlisted = isWishlisted(product.id);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <nav className="text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/shop" className="hover:text-primary">
          Shop
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl border bg-muted">
          <img
            src={product.image}
            alt={product.name}
            width={1024}
            height={1024}
            style={product.imagePosition ? { objectPosition: product.imagePosition } : undefined}
            className="aspect-square w-full object-cover"
          />
          {product.badge && (
            <span className="absolute left-4 top-4 rounded-full bg-destructive px-3 py-1 text-xs font-semibold text-destructive-foreground">
              {product.badge}
            </span>
          )}
        </div>

        <div>
          <Link
            to="/store/$id"
            params={{ id: product.storeId }}
            className="text-sm font-semibold text-primary hover:text-primary-dark"
          >
            {product.storeName}
          </Link>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">
            {product.name}
          </h1>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "size-4",
                    i < Math.round(product.rating) ? "fill-gold text-gold" : "text-border",
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-semibold">{product.rating}</span>
            <span className="text-sm text-muted-foreground">
              ({product.reviews.toLocaleString("en-IN")} reviews)
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-foreground">
              {formatINR(product.price)}
            </span>
            <del className="text-base text-muted-foreground">
              {formatINR(product.originalPrice)}
            </del>
          </div>

          <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-full border px-3 py-2">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="grid size-7 place-items-center rounded-full text-foreground hover:bg-accent"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="w-6 text-center text-sm font-semibold">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                aria-label="Increase quantity"
                className="grid size-7 place-items-center rounded-full text-foreground hover:bg-accent"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
            <button
              onClick={() => addToCart(product.id)}
              className="flex-1 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark sm:flex-none sm:px-10"
            >
              Add to Cart
            </button>
            <button
              onClick={() => toggleWishlist(product.id)}
              aria-pressed={wishlisted}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className="grid size-12 place-items-center rounded-full border text-foreground transition-colors hover:bg-accent"
            >
              <Heart className={cn("size-5", wishlisted && "fill-destructive text-destructive")} />
            </button>
          </div>

          <ul className="mt-8 space-y-2.5 border-t pt-6">
            {[
              { icon: ShieldCheck, text: "100% safe & encrypted payments" },
              { icon: Truck, text: "Free shipping across India" },
              { icon: RotateCcw, text: "7-day easy returns" },
            ].map((item) => (
              <li
                key={item.text}
                className="flex items-center gap-2.5 text-sm text-muted-foreground"
              >
                <item.icon className="size-4 text-success" />
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
