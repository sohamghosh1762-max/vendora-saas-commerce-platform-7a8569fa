import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import {
  Check,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  Star,
  Truck,
  RotateCcw,
  Box,
  ArrowRight,
  Zap,
  Sparkles,
  Share2,
} from "lucide-react";
import { useState, useMemo } from "react";
import { getProduct, products } from "@/data/products";
import { categories } from "@/data/categories";
import { discountPercent, formatINR } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { getProductGallery, getProductSpecs, getProductVariants } from "@/lib/product-details";
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
      {
        property: "og:description",
        content: loaderData?.product?.description ?? "Discover quality products on Vendora.",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function ProductDetailPage() {
  const { product } = Route.useLoaderData();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isWishlisted } = useCart();

  const galleryImages = useMemo(() => getProductGallery(product), [product]);
  const specs = useMemo(() => getProductSpecs(product), [product]);
  const variantGroups = useMemo(() => getProductVariants(product), [product]);

  // Gallery active index state
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  // Variant selections: group name -> selected option string
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const group of variantGroups) {
      if (group.options.length > 0) {
        initial[group.name] = group.options[0];
      }
    }
    return initial;
  });

  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const wishlisted = isWishlisted(product.id);
  const categoryInfo = categories.find((c) => c.id === product.category);
  const discount = discountPercent(product.price, product.originalPrice);
  const savings = Math.max(0, product.originalPrice - product.price);
  const isOutOfStock = product.inStock === false;
  const maxStock = product.stockCount ?? 99;
  const isLowStock = Boolean(
    product.stockCount && product.stockCount <= 10 && product.stockCount > 0,
  );

  const relatedProducts = useMemo(() => {
    return products
      .filter(
        (p) =>
          p.id !== product.id && (p.category === product.category || p.storeId === product.storeId),
      )
      .slice(0, 5);
  }, [product]);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product.id, qty);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product.id, qty);
    navigate({ to: "/cart" });
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const currentImage = galleryImages[activeImgIndex] || product.image;
  const isCurrentImgError = imgErrors[activeImgIndex];

  const handleImageError = (index: number) => {
    setImgErrors((prev) => ({ ...prev, [index]: true }));
  };

  const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><rect width="800" height="800" fill="%23f5f3ff"/><rect x="40" y="40" width="720" height="720" rx="24" fill="none" stroke="%23ddd6fe" stroke-width="2"/><text x="50%" y="46%" font-family="system-ui,sans-serif" font-size="32" font-weight="bold" fill="%237c3aed" text-anchor="middle" dominant-baseline="middle">Vendora Marketplace</text><text x="50%" y="56%" font-family="system-ui,sans-serif" font-size="20" fill="%236b7280" text-anchor="middle" dominant-baseline="middle">${encodeURIComponent((product.brand || product.category).toUpperCase())}</text></svg>`;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
      {/* Breadcrumb Navigation */}
      <nav
        className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
        aria-label="Breadcrumb"
      >
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
        {/* Left Column: Gallery & Images */}
        <div className="flex flex-col gap-4">
          {/* Main Large Product Image */}
          <div className="group relative overflow-hidden rounded-3xl border bg-card shadow-soft">
            <img
              src={isCurrentImgError ? fallbackSvg : currentImage}
              alt={`${product.name} - View ${activeImgIndex + 1}`}
              width={1024}
              height={1024}
              onError={() => handleImageError(activeImgIndex)}
              style={product.imagePosition ? { objectPosition: product.imagePosition } : undefined}
              className={cn(
                "aspect-square w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105",
                isOutOfStock && "grayscale opacity-80",
              )}
            />

            {/* Badges */}
            <div className="absolute left-4 top-4 flex flex-col gap-2">
              {product.badge && (
                <span className="rounded-full bg-destructive px-3.5 py-1.5 text-xs font-bold text-destructive-foreground shadow-soft">
                  {product.badge}
                </span>
              )}
              {discount > 0 && !product.badge && (
                <span className="rounded-full bg-destructive px-3.5 py-1.5 text-xs font-bold text-destructive-foreground shadow-soft">
                  {discount}% OFF
                </span>
              )}
            </div>

            {/* Out of Stock Overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-xs">
                <span className="rounded-full bg-foreground px-5 py-2 text-sm font-bold text-background shadow-lift">
                  Out of Stock
                </span>
              </div>
            )}

            {/* Share action button overlay */}
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share product"
              className="absolute right-4 top-4 grid size-10 place-items-center rounded-full border bg-card/90 backdrop-blur-xs text-foreground shadow-soft transition-transform hover:scale-105 active:scale-95"
              title={copiedShare ? "Link copied!" : "Share product link"}
            >
              {copiedShare ? (
                <Check className="size-4 text-success" />
              ) : (
                <Share2 className="size-4" />
              )}
            </button>
          </div>

          {/* Thumbnail Gallery Strip */}
          {galleryImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1">
              {galleryImages.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  onClick={() => setActiveImgIndex(idx)}
                  aria-label={`View image ${idx + 1}`}
                  className={cn(
                    "relative size-20 shrink-0 overflow-hidden rounded-xl border bg-muted transition-all duration-200",
                    activeImgIndex === idx
                      ? "ring-2 ring-primary ring-offset-2 border-primary shadow-soft"
                      : "opacity-75 hover:opacity-100 border-border",
                  )}
                >
                  <img
                    src={imgErrors[idx] ? fallbackSvg : img}
                    alt={`Thumbnail ${idx + 1}`}
                    width={80}
                    height={80}
                    onError={() => handleImageError(idx)}
                    className="size-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Meta, Variants, Specs & Actions */}
        <div className="flex flex-col">
          {/* Brand & Store pill */}
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

          {/* Product Title */}
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
              {product.reviews.toLocaleString("en-IN")} verified customer ratings
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
              <Sparkles className="size-3" />
              Verified Merchant
            </span>
          </div>

          {/* Pricing Box */}
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
              Inclusive of all taxes. Free standard doorstep shipping on orders above ₹499.
            </p>
          </div>

          {/* Stock availability indicator */}
          <div className="mt-4 flex items-center gap-2">
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

          {/* Available Variants (e.g. Size, Color, Storage) */}
          {variantGroups.length > 0 && (
            <div className="mt-5 space-y-4 border-t pt-4">
              {variantGroups.map((group) => (
                <div key={group.name} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                    <span>
                      Select {group.name}:{" "}
                      <strong className="text-foreground">
                        {selectedVariants[group.name] || group.options[0]}
                      </strong>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.options.map((opt) => {
                      const isSelected = selectedVariants[group.name] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() =>
                            setSelectedVariants((prev) => ({
                              ...prev,
                              [group.name]: opt,
                            }))
                          }
                          aria-pressed={isSelected}
                          className={cn(
                            "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-150",
                            isSelected
                              ? "bg-primary text-primary-foreground shadow-soft ring-2 ring-primary ring-offset-1 font-semibold"
                              : "border bg-card text-foreground hover:bg-accent",
                          )}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity Selector & Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t pt-5">
            {/* Quantity Stepper bounded by stock */}
            <div className="flex items-center gap-3 rounded-full border bg-card px-3 py-1.5 shadow-soft">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                disabled={isOutOfStock || qty <= 1}
                className="grid size-7 place-items-center rounded-full text-foreground hover:bg-accent disabled:opacity-40"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="w-6 text-center text-sm font-semibold">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(maxStock, q + 1))}
                aria-label="Increase quantity"
                disabled={isOutOfStock || qty >= maxStock}
                className="grid size-7 place-items-center rounded-full text-foreground hover:bg-accent disabled:opacity-40"
                title={qty >= maxStock ? `Max available stock (${maxStock}) reached` : undefined}
              >
                <Plus className="size-3.5" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={cn(
                "flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 rounded-full py-3 px-6 text-sm font-semibold transition-all duration-200 shadow-soft",
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
                  <span>Added {qty > 1 ? `${qty} items` : ""}!</span>
                </>
              ) : (
                <span>Add {qty > 1 ? `(${qty}) ` : ""}to Cart</span>
              )}
            </button>

            {/* Buy Now Button */}
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-full py-3 px-6 text-sm font-semibold transition-all duration-200 shadow-soft",
                isOutOfStock
                  ? "cursor-not-allowed bg-muted text-muted-foreground"
                  : "border-2 border-primary bg-background text-primary hover:bg-primary-soft/50",
              )}
            >
              <Zap className="size-4 fill-primary" />
              <span>Buy Now</span>
            </button>

            {/* Wishlist Button */}
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

          {/* Description Overview */}
          <div className="mt-8 border-t pt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Product Overview
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          </div>

          {/* Key Specifications & Features tailored to category */}
          {specs.length > 0 && (
            <div className="mt-8 border-t pt-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Key Specifications & Features
              </h2>
              <div className="mt-3 overflow-hidden rounded-2xl border bg-card text-xs shadow-soft">
                <dl className="divide-y">
                  {specs.map((item, i) => (
                    <div
                      key={item.label}
                      className={cn(
                        "grid grid-cols-3 gap-4 px-4 py-3 sm:grid-cols-4",
                        i % 2 === 0 ? "bg-muted/20" : "bg-card",
                      )}
                    >
                      <dt className="col-span-1 font-semibold text-muted-foreground">
                        {item.label}
                      </dt>
                      <dd className="col-span-2 font-medium text-foreground sm:col-span-3">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}

          {/* Trust Guarantees */}
          <ul className="mt-8 space-y-2.5 border-t py-6">
            {[
              { icon: ShieldCheck, text: "100% safe & encrypted payments via Vendora Secure" },
              { icon: Truck, text: "Free standard doorstep delivery across India" },
              { icon: RotateCcw, text: "7-day hassle-free return and replacement policy" },
            ].map((item) => (
              <li
                key={item.text}
                className="flex items-center gap-2.5 text-xs text-muted-foreground"
              >
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
                Shoppers also explored these curated selections.
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
