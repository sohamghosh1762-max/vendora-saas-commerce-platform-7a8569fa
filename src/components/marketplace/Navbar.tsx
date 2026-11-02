import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { useCart } from "@/lib/cart";
import { useCinematic } from "@/components/cinematic/cinematic-context";
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
  const { isIntroActive, scene } = useCinematic();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const isHiddenDuringIntro = isIntroActive && scene !== 4;

  const submitSearch = () => {
    const q = query.trim();
    if (!q) return;
    setMenuOpen(false);
    navigate({ to: "/shop", search: { q } });
  };

  const iconBadge =
    "absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[9px] font-bold shadow-sm";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md transition-opacity duration-1000",
        isHiddenDuringIntro ? "opacity-0 pointer-events-none" : "opacity-100",
      )}
    >
      <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between gap-2 sm:gap-3 px-3 sm:px-6 lg:px-8">
        <div className="flex shrink items-center">
          <Logo />
        </div>

        <nav className="hidden items-center gap-5 xl:gap-7 lg:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/" }}
              className={cn(
                "relative py-2 text-sm font-medium transition-colors",
                "text-muted-foreground hover:text-foreground",
                "data-[status=active]:text-primary data-[status=active]:font-semibold",
                "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:rounded-full after:bg-primary after:opacity-0 after:transition-all",
                "data-[status=active]:after:opacity-100",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <form
            className="relative hidden w-48 xl:w-64 lg:block"
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
              className="w-full rounded-full border border-border/80 bg-lavender/30 py-2 pl-10 pr-4 text-xs xl:text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
            />
          </form>

          <Link
            to="/wishlist"
            aria-label={`Wishlist, ${wishlist.length} items`}
            className="relative grid size-9 sm:size-10 min-h-[40px] min-w-[40px] place-items-center rounded-full text-foreground transition-colors hover:bg-accent hover:text-primary"
          >
            <Heart className="size-4.5 sm:size-5" />
            {hydrated && wishlist.length > 0 && (
              <span className={cn(iconBadge, "bg-primary text-primary-foreground")}>
                {wishlist.length}
              </span>
            )}
          </Link>

          <Link
            to="/cart"
            aria-label={`Cart, ${cartCount} items`}
            className="relative grid size-9 sm:size-10 min-h-[40px] min-w-[40px] place-items-center rounded-full text-foreground transition-colors hover:bg-accent hover:text-primary"
          >
            <ShoppingBag className="size-4.5 sm:size-5" />
            {hydrated && cartCount > 0 && (
              <span className={cn(iconBadge, "bg-primary text-primary-foreground")}>
                {cartCount}
              </span>
            )}
          </Link>

          <Link
            to="/signin"
            className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary-dark hover:shadow-soft active:scale-[0.98] sm:inline-flex"
          >
            Sign In
          </Link>

          <button
            className="grid size-9 sm:size-10 min-h-[40px] min-w-[40px] place-items-center rounded-full text-foreground transition-colors hover:bg-accent lg:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          className="border-t bg-background px-4 py-4 lg:hidden shadow-lg animate-in slide-in-from-top-2 duration-200"
          aria-label="Mobile navigation"
        >
          <form
            className="relative mb-3 block lg:hidden"
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
              className="w-full min-h-[44px] rounded-full border border-border/80 bg-lavender/30 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
            />
          </form>
          <ul className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  activeOptions={{ exact: link.to === "/" }}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-[44px] items-center rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent data-[status=active]:bg-primary-soft data-[status=active]:text-primary-dark data-[status=active]:font-semibold"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-2 sm:hidden">
              <Link
                to="/signin"
                onClick={() => setMenuOpen(false)}
                className="flex min-h-[44px] items-center justify-center rounded-full bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-dark"
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
