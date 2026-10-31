import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, Heart, Minus, Plus, ShieldCheck, Star, Truck, RotateCcw, Box, ArrowRight } from "lucide-react";
import { useState } from "react";
import { getProduct, products } from "@/data/products";
import { categories } from "@/data/categories";
import { discountPercent, formatINR } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  component: ProductDetailPage,
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.product?.name ?? "Product"} — Vendora Marketplace` },
      {
        name: "description",
        content: loaderData?.product?.description ?? "Discover quality products on Vendora.",
      },
      { property: "og:title", content: `${loaderData?.product?.name ?? "Product"} — Vendora` },
      { property: "og:description", content: loaderData?.product?.description ?? "Discover quality products on Vendora." },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function ProductDetailPage() {
  const { product } = Route.useLoaderData();
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.image);
  const [imgError, setImgError] = useState(false);

  const wishlisted = isWishlisted(product.id);
  const categoryInfo = categories.find((c) => c.id === product.category);
  const discount = discountPercent(product.price, product.originalPrice);
  const savings = Math.max(0, product.originalPrice - product.price);
  const isOutOfStock = product.inStock === false;
  const isLowStock = Boolean(product.stockCount && product.stockCount <= 10 && product.stockCount > 0);

  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.category === product.category || p.storeId === product.storeId))
    .slice(0, 5);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    for (let i = 0; i < qty; i++) {
      addToCart(product.id);
    }
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true);
      setImgSrc(
        `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" fill="%23f5f3ff"/><text x="50%" y="45%" font-family="system-ui,sans-serif" font-size="32" font-weight="bold" fill="%237c3aed" text-anchor="middle" dominant-baseline="middle">Vendora Marketplace</text><text x="50%" y="58%" font-family="system-ui,sans-serif" font-size="18" fill="%236b7280" text-anchor="middle" dominant-baseline="middle">${encodeURIComponent(product.category.toUpperCase())}</text></svg>`,
      );
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/" className="transition-colors hover:text-primary">
          Home
        </Link>
        <span>/</span>
        <Link to="/shop" className="transition-colors hover:text-primary">
          Shop
        </Link>
        {categoryInfo && (
          <>
            <span>/</span>
            <Link
              to="/shop"
              search={{ category: categoryInfo.id }}
              className="transition-colors hover:text-primary"
            >
              {categoryInfo.label}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="font-medium text-foreground truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Left: Product Image */}
        <div className="relative overflow-hidden rounded-3xl border bg-card shadow-soft">
          <img
            src={imgSrc}
            alt={product.name}
            width={1024}
            height={1024}
            onError={handleImageError}
            style={product.imagePosition ? { objectPosition: product.imagePosition } : undefined}
            className={cn("aspect-square w-full object-cover", isOutOfStock && "grayscale opacity-80")}
          />
          {product.badge && (
            <span className="absolute left-4 top-4 rounded-full bg-destructive px-3.5 py-1.5 text-xs font-bold text-destructive-foreground shadow-soft">
              {product.badge}
            </span>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-xs">
              <span className="rounded-full bg-foreground px-5 py-2 text-sm font-bold text-background shadow-lift">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Right: Product Meta & Purchase */}
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link
              to="/store/$id"
              params={{ id: product.storeId }}
              className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80"
            >
              <Box className="size-3.5 text-primary" />
              <span>Sold by {product.storeName}</span>
            </Link>
            {product.brand && (
              <span className="text-xs font-medium text-muted-foreground">
                Brand: <strong className="text-foreground">{product.brand}</strong>
              </span>
            )}
          </div>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {product.name}
          </h1>

          {/* Rating & Reviews */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-md bg-gold/15 px-2 py-0.5 text-xs font-bold text-foreground">
              <Star className="size-3.5 fill-gold text-gold" />
              <span>{product.rating}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {product.reviews.toLocaleString("en-IN")} customer reviews
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-xs font-medium text-primary">Verified Merchant</span>
          </div>

          {/* Pricing & Discount */}
          <div className="mt-5 flex flex-wrap items-baseline gap-3 rounded-2xl border bg-card p-4 shadow-soft">
            <span className="text-3xl font-extrabold text-foreground">
              {formatINR(product.price)}
            </span>
            {savings > 0 && (
              <>
                <del className="text-base text-muted-foreground">
                  {formatINR(product.originalPrice)}
                </del>
                <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-bold text-destructive">
                  {discount}% OFF
                </span>
                <span className="text-xs font-semibold text-success">
                  You save {formatINR(savings)}
                </span>
              </>
            )}
            <p className="w-full text-[11px] text-muted-foreground">
              Inclusive of all taxes. Free shipping on orders above ₹499.
            </p>
          </div>

          {/* Description */}
          <div className="mt-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Product Overview
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          </div>

          {/* Stock availability indicator */}
          <div className="mt-5 flex items-center gap-2">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive">
                <span className="size-2 rounded-full bg-destructive" />
                Currently Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <span className="size-2 animate-pulse rounded-full bg-amber-500" />
                Only {product.stockCount} items left in stock — order soon
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                <span className="size-2 rounded-full bg-success" />
                In Stock ({product.stockCount ?? "50+"} units available)
              </span>
            )}
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-full border bg-card px-3 py-1.5 shadow-soft">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                disabled={isOutOfStock}
                className="grid size-7 place-items-center rounded-full text-foreground hover:bg-accent disabled:opacity-50"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="w-6 text-center text-sm font-semibold">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                aria-label="Increase quantity"
                disabled={isOutOfStock}
                className="grid size-7 place-items-center rounded-full text-foreground hover:bg-accent disabled:opacity-50"
              >
                <Plus className="size-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={cn(
                "flex-1 inline-flex items-center justify-center gap-2 rounded-full py-3 px-8 text-sm font-semibold transition-all duration-200 shadow-soft",
                isOutOfStock
                  ? "cursor-not-allowed bg-muted text-muted-foreground"
                  : justAdded
                    ? "bg-success text-success-foreground"
                    : "bg-primary text-primary-foreground hover:bg-primary-dark",
              )}
            >
              {justAdded ? (
                <>
                  <Check className="size-4 animate-in zoom-in-50" />
                  <span>Added {qty > 1 ? `${qty} items` : ""} to Cart!</span>
                </>
              ) : (
                <span>Add {qty > 1 ? `(${qty}) ` : ""}to Cart</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              aria-pressed={wishlisted}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className={cn(
                "grid size-12 place-items-center rounded-full border bg-card text-foreground shadow-soft transition-colors hover:bg-accent",
                wishlisted && "border-destructive/30 bg-destructive/10 text-destructive",
              )}
            >
              <Heart className={cn("size-5", wishlisted && "fill-destructive text-destructive")} />
            </button>
          </div>

          {/* Trust Guarantees */}
          <ul className="mt-8 space-y-2.5 border-t py-6">
            {[
              { icon: ShieldCheck, text: "100% safe & encrypted payments via Vendora Secure" },
              { icon: Truck, text: "Free standard doorstep delivery across India" },
              { icon: RotateCcw, text: "7-day hassle-free return and replacement policy" },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <item.icon className="size-4 text-success shrink-0" />
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 border-t pt-10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                More in {categoryInfo?.label ?? "this Category"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Shoppers also explored these handcrafted and curated selections.
              </p>
            </div>
            <Link
              to="/shop"
              search={{ category: product.category }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark"
            >
              View All
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
