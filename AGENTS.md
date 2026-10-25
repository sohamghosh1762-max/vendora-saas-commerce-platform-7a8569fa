<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Project rules

- The Vendora marketplace uses TanStack Router route files (not React Router DOM) and a React context store in `src/lib/cart.tsx` for cart/wishlist state (not Redux Toolkit); the uploaded brief's stack names are adapted, not installed. Why: the fixed project stack is TanStack Start, and a tiny context covers the state needs.
- All Vendora colors/fonts are semantic oklch tokens in `src/styles.css`; components must only use semantic utilities (e.g. `bg-cat-fashion`), never raw hex or palette classes. Why: keeps theming consistent and the reference palette in one place.
- Marketplace mock data (products, stores, categories, testimonials) lives in `src/data/*`; keep it separate from JSX so a real API can replace it later. Why: the brief requires a swappable mock-data layer.
- Brand/design values (colors, section order, sample data) are in memory at `mem://design/vendora-brand.md`; read it before changing homepage visuals.
