import { Link } from "@tanstack/react-router";
import { Check, Heart, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/data/products";
import { discountPercent, formatINR } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const wishlisted = isWishlisted(product.id);
  const [justAdded, setJustAdded] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.image);
  const [imgError, setImgError] = useState(false);

  const discount = discountPercent(product.price, product.originalPrice);
  const savings = Math.max(0, product.originalPrice - product.price);
  const badgeLabel = product.badge || (discount > 0 ? `${discount}% OFF` : undefined);
  const isOutOfStock = product.inStock === false;
  const isLowStock = Boolean(product.stockCount && product.stockCount <= 10 && product.stockCount > 0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product.id);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true);
      // Clean, elegant fallback SVG with product initial
      setImgSrc(
        `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23f5f3ff"/><rect x="20" y="20" width="360" height="360" rx="16" fill="none" stroke="%23ddd6fe" stroke-width="2"/><text x="50%" y="45%" font-family="system-ui,sans-serif" font-size="28" font-weight="bold" fill="%237c3aed" text-anchor="middle" dominant-baseline="middle">Vendora</text><text x="50%" y="60%" font-family="system-ui,sans-serif" font-size="14" fill="%236b7280" text-anchor="middle" dominant-baseline="middle">${encodeURIComponent(product.category.toUpperCase())}</text></svg>`,
      );
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="relative block aspect-square overflow-hidden bg-muted"
        aria-label={product.name}
      >
        <img
          src={imgSrc}
          alt={product.name}
          loading="lazy"
          width={1024}
          height={1024}
          onError={handleImageError}
          style={product.imagePosition ? { objectPosition: product.imagePosition } : undefined}
          className={cn(
            "h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105",
            isOutOfStock && "grayscale opacity-75",
          )}
        />
        {badgeLabel && (
          <span className="absolute left-3 top-3 rounded-full bg-destructive px-2.5 py-1 text-[11px] font-bold tracking-wide text-destructive-foreground shadow-soft">
            {badgeLabel}
          </span>
        )}
        {isOutOfStock && (
          <span className="absolute bottom-3 left-3 rounded-md bg-foreground/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-background">
            Sold Out
          </span>
        )}
      </Link>

      <button
        type="button"
        onClick={handleToggleWishlist}
        aria-pressed={wishlisted}
        aria-label={
          wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`
        }
        className={cn(
          "absolute right-3 top-3 grid size-8 place-items-center rounded-full border bg-card/95 backdrop-blur-xs shadow-soft transition-transform duration-200 hover:scale-110",
          wishlisted && "border-destructive/40 bg-destructive/10 text-destructive",
        )}
      >
        <Heart
          className={cn(
            "size-4 transition-transform duration-200",
            wishlisted ? "scale-110 fill-destructive text-destructive" : "text-muted-foreground",
          )}
        />
      </button>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-center justify-between gap-2">
          <Link
            to="/store/$id"
            params={{ id: product.storeId }}
            className="truncate text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            {product.storeName}
          </Link>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80">
            {product.category}
          </span>
        </div>

        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="line-clamp-1 text-sm font-semibold text-foreground transition-colors hover:text-primary"
          title={product.name}
        >
          {product.name}
        </Link>

        <div className="flex items-center gap-1">
          <Star className="size-3.5 fill-gold text-gold" />
          <span className="text-xs font-semibold text-foreground">{product.rating}</span>
          <span className="text-xs text-muted-foreground">
            ({product.reviews.toLocaleString("en-IN")})
          </span>
        </div>

        <div className="mt-1 flex flex-wrap items-baseline gap-2">
          <span className="text-base font-bold text-foreground">{formatINR(product.price)}</span>
          {savings > 0 && (
            <>
              <del className="text-xs text-muted-foreground">{formatINR(product.originalPrice)}</del>
              <span className="text-[11px] font-semibold text-success">
                Save {formatINR(savings)}
              </span>
            </>
          )}
        </div>

        {isLowStock && (
          <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
            Only {product.stockCount} left in stock
          </p>
        )}

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={cn(
            "mt-auto flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-all duration-200",
            isOutOfStock
              ? "cursor-not-allowed border border-muted bg-muted text-muted-foreground"
              : justAdded
                ? "bg-success text-success-foreground shadow-soft"
                : "border border-primary text-primary hover:bg-primary hover:text-primary-foreground",
          )}
        >
          {isOutOfStock ? (
            <span>Out of Stock</span>
          ) : justAdded ? (
            <>
              <Check className="size-4 animate-in zoom-in-50" />
              <span>Added to Cart</span>
            </>
          ) : (
            <>
              <ShoppingCart className="size-4" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
