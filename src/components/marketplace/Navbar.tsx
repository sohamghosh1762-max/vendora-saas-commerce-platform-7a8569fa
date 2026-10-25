import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/stores", label: "Stores" },
  { to: "/deals", label: "Deals" },
  { to: "/become-a-vendor", label: "Become a Vendor" },
  { to: "/pricing", label: "Pricing" },
] as const;

export function Navbar() {
  const { cartCount, wishlist, hydrated } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const submitSearch = () => {
    const q = query.trim();
    if (!q) return;
    setMenuOpen(false);
    navigate({ to: "/shop", search: { q } });
  };

  const iconBadge = "absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[9px] font-bold";

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/" }}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                "text-muted-foreground hover:bg-accent hover:text-foreground",
                "data-[status=active]:bg-primary-soft data-[status=active]:text-primary-dark data-[status=active]:font-semibold",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <form
            className="relative hidden w-64 xl:block"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch();
            }}
          >
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products, brands, or stores..."
              aria-label="Search products and stores"
              className="w-full rounded-full border bg-muted/60 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:bg-background"
            />
          </form>

          <Link
            to="/wishlist"
            aria-label={`Wishlist, ${wishlist.length} items`}
            className="relative grid size-9 place-items-center rounded-full text-foreground transition-colors hover:bg-accent"
          >
            <Heart className="size-5" />
            {hydrated && wishlist.length > 0 && (
              <span className={cn(iconBadge, "bg-primary text-primary-foreground")}>
                {wishlist.length}
              </span>
            )}
          </Link>

          <Link
            to="/cart"
            aria-label={`Cart, ${cartCount} items`}
            className="relative grid size-9 place-items-center rounded-full text-foreground transition-colors hover:bg-accent"
          >
            <ShoppingBag className="size-5" />
            {hydrated && cartCount > 0 && (
              <span className={cn(iconBadge, "bg-destructive text-destructive-foreground")}>
                {cartCount}
              </span>
            )}
          </Link>

          <Link
            to="/signin"
            className="hidden rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark sm:inline-flex"
          >
            Sign In
          </Link>

          <button
            className="grid size-9 place-items-center rounded-full text-foreground transition-colors hover:bg-accent lg:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t bg-background px-4 py-3 lg:hidden" aria-label="Mobile">
          <div className="relative mb-3 xl:hidden" role="search">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitSearch()}
              placeholder="Search for products, brands, or stores..."
              aria-label="Search products and stores"
              className="w-full rounded-full border bg-muted/60 py-2 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-background"
            />
          </div>
          <ul className="flex flex-col">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  activeOptions={{ exact: link.to === "/" }}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent data-[status=active]:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="mt-2">
              <Link
                to="/signin"
                onClick={() => setMenuOpen(false)}
                className="block rounded-full bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground"
              >
                Sign In
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
