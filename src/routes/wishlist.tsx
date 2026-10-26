import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { products } from "@/data/products";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/wishlist")({
  component: WishlistPage,
  head: () => ({
    meta: [
      { title: "Your Wishlist — Vendora" },
      { name: "description", content: "Products you've saved on Vendora." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function WishlistPage() {
  const { wishlist, hydrated } = useCart();
  const list = products.filter((p) => wishlist.includes(p.id));

  if (hydrated && list.length === 0) {
    return (
      <section className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-primary-soft text-primary">
          <Heart className="size-8" />
        </span>
        <h1 className="mt-4 text-xl font-bold text-foreground">Your wishlist is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tap the heart on any product to save it here.
        </p>
        <Link
          to="/shop"
          className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
        >
          Browse Products
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Your Wishlist</h1>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
