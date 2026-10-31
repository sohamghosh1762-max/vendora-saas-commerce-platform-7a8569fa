import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { products } from "@/data/products";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/wishlist")({
  component: WishlistPage,
  head: () => ({
    meta: [
      { title: "Your Wishlist — Vendora Marketplace" },
      { name: "description", content: "View and manage products saved in your Vendora wishlist." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function WishlistPage() {
  const { wishlist, addToCart, hydrated } = useCart();
  const list = products.filter((p) => wishlist.includes(p.id));

  const handleAddAllToCart = () => {
    for (const item of list) {
      if (item.inStock !== false) {
        addToCart(item.id);
      }
    }
  };

  if (hydrated && list.length === 0) {
    return (
      <section className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <span className="grid size-20 place-items-center rounded-3xl bg-primary-soft text-primary shadow-soft">
          <Heart className="size-10" />
        </span>
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-foreground">
          Your wishlist is empty
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Explore our marketplace catalog and tap the heart icon on any product to save it here for
          later.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-200 hover:bg-primary-dark active:scale-98"
        >
          <span>Explore Products</span>
          <ArrowRight className="size-4" />
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
      {/* Breadcrumb Navigation */}
      <nav
        className="flex items-center gap-1.5 text-xs text-muted-foreground"
        aria-label="Breadcrumb"
      >
        <Link to="/" className="transition-colors hover:text-primary">
          Home
        </Link>
        <span>/</span>
        <Link to="/shop" className="transition-colors hover:text-primary">
          Shop
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">Wishlist</span>
      </nav>

      {/* Header & Quick Action */}
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Your Wishlist
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {list.length} {list.length === 1 ? "saved item" : "saved items"}
          </p>
        </div>

        {list.length > 0 && (
          <button
            type="button"
            onClick={handleAddAllToCart}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary-dark"
          >
            <ShoppingBag className="size-3.5" />
            <span>Add All In-Stock to Cart</span>
          </button>
        )}
      </div>

      {/* Wishlist Products Grid */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
