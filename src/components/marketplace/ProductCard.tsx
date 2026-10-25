import { Link } from "@tanstack/react-router";
import { Heart, Star } from "lucide-react";
import type { Product } from "@/data/products";
import { formatINR } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const wishlisted = isWishlisted(product.id);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-soft transition-shadow duration-200 hover:shadow-lift">
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="relative block aspect-square overflow-hidden bg-muted"
        aria-label={product.name}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={1024}
          height={1024}
          style={product.imagePosition ? { objectPosition: product.imagePosition } : undefined}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-destructive px-2.5 py-1 text-[11px] font-semibold text-destructive-foreground shadow-soft">
            {product.badge}
          </span>
        )}
      </Link>

      <button
        onClick={() => toggleWishlist(product.id)}
        aria-pressed={wishlisted}
        aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        className="absolute right-3 top-3 grid size-8 place-items-center rounded-full border bg-card shadow-soft transition-transform hover:scale-110"
      >
        <Heart
          className={cn("size-4", wishlisted ? "fill-destructive text-destructive" : "text-muted-foreground")}
        />
      </button>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
        >
          {product.name}
        </Link>
        <Link
          to="/store/$id"
          params={{ id: product.storeId }}
          className="text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          {product.storeName}
        </Link>
        <div className="flex items-center gap-1">
          <Star className="size-3.5 fill-gold text-gold" />
          <span className="text-xs font-semibold text-foreground">{product.rating}</span>
          <span className="text-xs text-muted-foreground">({product.reviews.toLocaleString("en-IN")})</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-foreground">{formatINR(product.price)}</span>
          <del className="text-xs text-muted-foreground">{formatINR(product.originalPrice)}</del>
        </div>
        <button
          onClick={() => addToCart(product.id)}
          className="mt-auto w-full rounded-lg border border-primary py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
