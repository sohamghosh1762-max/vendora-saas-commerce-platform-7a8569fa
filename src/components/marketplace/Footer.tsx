import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { Logo } from "./Logo";
import { StoreBadge } from "./MobileAppSection";
import { Apple, Play } from "lucide-react";

const columns = [
  {
    heading: "Shop",
    links: [
      { label: "All Categories", to: "/shop" },
      { label: "Deals", to: "/deals" },
      { label: "Stores", to: "/stores" },
      { label: "Gift Cards", to: "/gift-cards" },
      { label: "Student Discount", to: "/student-discount" },
    ],
  },
  {
    heading: "Sell on Vendora",
    links: [
      { label: "Become a Vendor", to: "/become-a-vendor" },
      { label: "Vendor Pricing", to: "/vendor-pricing" },
      { label: "Seller Resources", to: "/seller-resources" },
      { label: "Success Stories", to: "/success-stories" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help Center", to: "/help-center" },
      { label: "Returns & Refunds", to: "/returns" },
      { label: "Shipping Information", to: "/shipping" },
      { label: "Track Order", to: "/track-order" },
      { label: "Contact Us", to: "/contact-us" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Careers", to: "/careers" },
      { label: "Press", to: "/press" },
      { label: "Blog", to: "/blog" },
      { label: "Terms & Privacy", to: "/terms" },
    ],
  },
];

const socials = [
  { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
  { icon: Facebook, label: "Facebook", href: "https://facebook.com" },
  { icon: Twitter, label: "X (Twitter)", href: "https://x.com" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
  { icon: Youtube, label: "YouTube", href: "https://youtube.com" },
];

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1.2fr]">
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Logo />
            <p className="mt-4 max-w-56 text-xs leading-relaxed text-muted-foreground">
              Empowering independent businesses and creating a better shopping experience for
              everyone.
            </p>
            <div className="mt-4 flex gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="grid size-8 place-items-center rounded-full border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <s.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h3 className="text-sm font-bold text-foreground">{col.heading}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-xs text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h3 className="text-sm font-bold text-foreground">Get the App</h3>
            <div className="mt-4 flex flex-col items-start gap-2.5">
              <StoreBadge icon={Apple} top="Download on the" bottom="App Store" />
              <StoreBadge icon={Play} top="Get it on" bottom="Google Play" />
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© 2026 Vendora. All rights reserved.</p>
          <p>
            Made with <span className="text-destructive">♥</span> for independent businesses.
          </p>
        </div>
      </div>
    </footer>
  );
}
