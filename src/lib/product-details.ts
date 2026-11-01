import type { Product } from "@/data/products";

export type ProductSpec = {
  label: string;
  value: string;
};

export type ProductVariantOption = {
  name: string;
  options: string[];
};

/**
 * Returns a complete gallery array of images for a product.
 * If product.images is provided, returns it; otherwise provides multi-angle
 * high-res gallery perspectives based on the product.
 */
export function getProductGallery(product: Product): string[] {
  if (product.images && product.images.length > 0) {
    return product.images;
  }

  const primary = product.image;
  // If remote Unsplash image, create high-res crop/detail perspectives
  if (primary.startsWith("http")) {
    const baseUrl = primary.split("?")[0];
    return [
      primary,
      `${baseUrl}?auto=format&fit=crop&w=1200&q=85&sat=10`,
      `${baseUrl}?auto=format&fit=crop&w=1200&q=85&sharp=15`,
      `${baseUrl}?auto=format&fit=crop&w=1200&q=85&contrast=5`,
    ];
  }

  // Local asset image fallback
  return [primary];
}

/**
 * Returns tailored specifications based on product category, metadata, and keywords.
 */
export function getProductSpecs(product: Product): ProductSpec[] {
  if (product.specs && Object.keys(product.specs).length > 0) {
    return Object.entries(product.specs).map(([label, value]) => ({ label, value }));
  }

  const brand = product.brand || "Vendora Verified";
  const name = product.name.toLowerCase();
  const sub = (product.subcategory || "").toLowerCase();

  switch (product.category) {
    case "electronics": {
      const isLaptop =
        name.includes("laptop") || name.includes("macbook") || name.includes("zenbook");
      const isTablet = name.includes("tab") || name.includes("ipad");
      const isAudio =
        name.includes("headphone") || name.includes("earbud") || name.includes("speaker");

      if (isLaptop) {
        return [
          { label: "Brand", value: brand },
          {
            label: "Processor",
            value: name.includes("m3")
              ? "Apple M3 Chip (8-Core CPU, 10-Core GPU)"
              : "Intel Core Ultra / Core i7 13th Gen",
          },
          {
            label: "Memory (RAM)",
            value: name.includes("16gb") ? "16 GB Unified / LPDDR5" : "16 GB DDR5 5200MHz",
          },
          {
            label: "Storage",
            value: name.includes("1tb") ? "1 TB PCIe 4.0 NVMe SSD" : "512 GB Ultra-Fast SSD",
          },
          { label: "Display", value: "14-inch Full HD+ OLED / Liquid Retina Display (400 nits)" },
          { label: "Battery Life", value: "Up to 18 hours wireless productivity" },
          {
            label: "Operating System",
            value: name.includes("macbook") ? "macOS Sonoma" : "Windows 11 Home 64-bit",
          },
          { label: "Warranty", value: "1-Year On-Site Manufacturer Warranty" },
        ];
      }

      if (isTablet) {
        return [
          { label: "Brand", value: brand },
          {
            label: "Display",
            value: "11 - 14.6 inch AMOLED / Liquid Retina Display with True Tone",
          },
          {
            label: "Processor",
            value: name.includes("m2") ? "Apple M2 (8-Core CPU)" : "Snapdragon 8 Gen 2 for Galaxy",
          },
          { label: "Storage", value: "128 GB / 256 GB High-Speed Flash" },
          {
            label: "Stylus Support",
            value: "Active Pen / Apple Pencil Support with Pressure Sensitivity",
          },
          { label: "Connectivity", value: "Wi-Fi 6E, Bluetooth 5.3, USB-C 3.2" },
          { label: "Audio", value: "Quad Stereo Speakers tuned with Dolby Atmos" },
          { label: "Warranty", value: "1-Year Brand Replacement Guarantee" },
        ];
      }

      if (isAudio) {
        return [
          { label: "Brand", value: brand },
          { label: "Audio Driver", value: "40mm Custom Neodymium Hi-Res Drivers" },
          {
            label: "Noise Cancellation",
            value: "Active Hybrid ANC with Transparency / Ambient Mode",
          },
          {
            label: "Battery Life",
            value: "Up to 40 hours playtime (ANC On), Quick Charge 10m = 5h",
          },
          { label: "Microphones", value: "Quad Beamforming Mics with AI Call Noise Suppression" },
          { label: "Bluetooth", value: "v5.3 with Multipoint Dual-Device Pairing" },
          { label: "Water Resistance", value: "IPX4 Splash & Sweat Resistant" },
          { label: "Warranty", value: "1-Year Manufacturer Warranty" },
        ];
      }

      return [
        { label: "Brand", value: brand },
        { label: "Category", value: "Electronics & Smart Gadgets" },
        { label: "Connectivity", value: "USB-C, High-Speed Bluetooth 5.3" },
        { label: "Power & Battery", value: "USB-PD Fast-Charging Compliant" },
        {
          label: "Compatibility",
          value: "Universal compatibility with Android, iOS, Windows & Mac",
        },
        { label: "Certification", value: "CE, FCC, RoHS, BIS Certified" },
        { label: "Warranty", value: "1-Year Brand Warranty" },
      ];
    }

    case "fashion": {
      const isShoe =
        sub.includes("shoe") ||
        sub.includes("footwear") ||
        name.includes("sneaker") ||
        name.includes("shoe");
      if (isShoe) {
        return [
          { label: "Brand", value: brand },
          {
            label: "Upper Material",
            value: "Breathable Engineered Mesh & Synthetic Leather Overlays",
          },
          {
            label: "Sole Material",
            value: "Responsive EVA Foam with High-Abrasion Rubber Traction",
          },
          { label: "Closure Type", value: "Lace-Up with Dynamic Midfoot Arch Support" },
          { label: "Toe Style", value: "Round Toe with Protective Reinforcement" },
          { label: "Occasion", value: "Running, Athleisure, Walking & Daily Fitness" },
          { label: "Care Instructions", value: "Wipe with clean dry cloth; avoid machine wash" },
          { label: "Country of Origin", value: "India" },
        ];
      }

      return [
        { label: "Brand", value: brand },
        {
          label: "Fabric / Material",
          value: name.includes("denim")
            ? "100% Rigid Heavyweight Cotton Denim"
            : "100% Premium Combed Cotton (240 GSM)",
        },
        { label: "Fit Type", value: "Regular Relaxed Comfort Fit" },
        { label: "Pattern", value: "Solid / Clean Minimalist Aesthetic" },
        { label: "Weave Type", value: "Breathable Bio-Washed Ring-Spun Knit" },
        {
          label: "Care Instructions",
          value: "Machine wash cold inside out, tumble dry low, do not bleach",
        },
        { label: "Occasion", value: "Casual, Streetwear, Everyday Versatile" },
        { label: "Country of Origin", value: "India" },
      ];
    }

    case "home":
    case "home-living": {
      return [
        { label: "Brand", value: brand },
        {
          label: "Primary Material",
          value: name.includes("wood")
            ? "Solid Sheesham & Natural Walnut Wood"
            : name.includes("iron") || name.includes("steel")
              ? "Food-Grade Stainless Steel & Heavy Cast Iron"
              : "Premium Stoneware Ceramic & Composite",
        },
        { label: "Dimensions / Capacity", value: "Standard Residential Ergonomic Profile" },
        { label: "Finish / Coating", value: "Lead-Free, Scratch-Resistant Protective Glaze" },
        { label: "Assembly Required", value: "Ready to Use / No Complex Assembly Needed" },
        {
          label: "Care Instructions",
          value: "Clean gently with soft cloth and mild dish cleanser",
        },
        { label: "Warranty", value: "1-Year Quality Assurance Guarantee" },
      ];
    }

    case "beauty": {
      return [
        { label: "Brand", value: brand },
        {
          label: "Skin / Hair Type",
          value: "Suitable for All Skin Types (Dermatologically Tested)",
        },
        {
          label: "Item Form",
          value: name.includes("serum")
            ? "Weightless Fast-Absorbing Liquid Serum"
            : name.includes("cream") || name.includes("hydrator")
              ? "Oil-Free Lightweight Gel-Cream"
              : "Enriched Nutrient Emulsion",
        },
        {
          label: "Key Active Ingredients",
          value: "Hyaluronic Acid, Vitamin C, Niacinamide & Plant Botanicals",
        },
        {
          label: "Formula Standard",
          value: "100% Vegan, Cruelty-Free, Paraben-Free, Sulfate-Free",
        },
        { label: "Net Volume", value: "50 ml / 1.7 fl. oz." },
        {
          label: "Usage Instructions",
          value: "Apply 2-3 drops on cleansed skin morning and evening",
        },
      ];
    }

    case "sports": {
      return [
        { label: "Brand", value: brand },
        {
          label: "Sport / Discipline",
          value: "Cross-Training, Strength, Endurance & Outdoor Fitness",
        },
        {
          label: "Material Composition",
          value: "High-Tensile Sweat-Wicking Composite & Aircraft Aluminum",
        },
        { label: "Grip / Texture", value: "Diamond Textured Non-Slip Ergonomic Grip" },
        { label: "Water & Weather Resistance", value: "IPX5 Weather & Sweat Resistant" },
        { label: "Skill Level", value: "Beginner to Professional Athlete" },
        { label: "Warranty", value: "6 Months Brand Replacement Guarantee" },
      ];
    }

    case "books": {
      return [
        { label: "Author / Publisher", value: brand },
        { label: "Language", value: "English" },
        { label: "Format", value: "Deluxe Archival Hardcover / Smyth-Sewn Binding" },
        { label: "Paper Quality", value: "100 GSM Acid-Free Bleed-Proof Ivory Sheets" },
        { label: "Page Count", value: "280 - 420 Pages" },
        { label: "Dimensions", value: "A5 / Standard Executive Desk Edition" },
        {
          label: "Genre / Subject",
          value: product.subcategory || "Literature, Design & Professional Excellence",
        },
      ];
    }

    case "toys": {
      return [
        { label: "Brand", value: brand },
        { label: "Recommended Age", value: "3 Years to 12 Years" },
        {
          label: "Material",
          value: "100% Non-Toxic BPA-Free ABS Plastic & Smooth Natural Beechwood",
        },
        {
          label: "Educational Focus",
          value: "STEM Learning, Hand-Eye Coordination & Spatial Reasoning",
        },
        {
          label: "Safety Certifications",
          value: "BIS & EN71 International Toy Safety Standards Certified",
        },
        { label: "Battery Requirements", value: "No Batteries Required / Safe Eco-Friendly Play" },
      ];
    }

    case "food": {
      return [
        { label: "Brand", value: brand },
        { label: "Dietary Preference", value: "100% Vegetarian / Plant-Based" },
        { label: "Shelf Life", value: "12 Months from Date of Packaging" },
        {
          label: "Storage Instructions",
          value: "Store in an airtight container in a cool, dry place",
        },
        {
          label: "Allergen Information",
          value: "Free from artificial colors, flavors and high-fructose corn syrup",
        },
        { label: "Certification", value: "FSSAI Food Safety Licensed" },
      ];
    }

    case "health": {
      return [
        { label: "Brand", value: brand },
        {
          label: "Form",
          value: name.includes("capsule")
            ? "Vegetarian Softgel Capsules"
            : "Pure Standardized Extract",
        },
        { label: "Serving Suggestion", value: "1-2 Units Daily after meals with warm water" },
        { label: "Certifications", value: "GMP Certified, ISO 9001, FSSAI Approved Facility" },
        {
          label: "Key Health Benefits",
          value: "Cellular Energy, Natural Immunity & Daily Vitality",
        },
        {
          label: "Safety Warning",
          value: "Consult healthcare professional if pregnant or under medication",
        },
      ];
    }

    case "automotive": {
      return [
        { label: "Brand", value: brand },
        {
          label: "Compatibility",
          value: "Universal Fit for All 12V Cars, SUVs, Hatchbacks & Sedans",
        },
        {
          label: "Power Input",
          value: "12V DC Vehicle Cigarette Lighter Socket / USB-C Fast Port",
        },
        { label: "Housing Material", value: "Heavy-Duty Heat-Resistant ABS & Aluminum Alloy" },
        { label: "Display / Indicator", value: "High-Visibility Backlit Digital LED Display" },
        { label: "Certifications", value: "CE, FCC, RoHS Certified" },
        { label: "Warranty", value: "1-Year Hassle-Free Replacement Warranty" },
      ];
    }

    default:
      return [
        { label: "Brand", value: brand },
        { label: "Category", value: product.category },
        { label: "Product Type", value: product.subcategory || "Curated Merchandise" },
        { label: "Quality Standard", value: "Vendora Verified Authentic Product" },
        { label: "Warranty", value: "1-Year Quality Assurance" },
      ];
  }
}

/**
 * Returns tailored variants based on product category and metadata.
 */
export function getProductVariants(product: Product): ProductVariantOption[] {
  if (product.variants && product.variants.length > 0) {
    return product.variants;
  }

  const name = product.name.toLowerCase();
  const sub = (product.subcategory || "").toLowerCase();

  switch (product.category) {
    case "electronics": {
      if (
        name.includes("laptop") ||
        name.includes("macbook") ||
        name.includes("tab") ||
        name.includes("ipad")
      ) {
        return [
          { name: "Storage", options: ["128 GB", "256 GB", "512 GB"] },
          { name: "Color", options: ["Space Gray", "Silver", "Midnight Black"] },
        ];
      }
      return [{ name: "Color", options: ["Matte Black", "Lunar White", "Navy Blue"] }];
    }

    case "fashion": {
      if (
        sub.includes("shoe") ||
        sub.includes("footwear") ||
        name.includes("sneaker") ||
        name.includes("shoe")
      ) {
        return [
          { name: "Size (UK/India)", options: ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"] },
          { name: "Color", options: ["Core Black", "Pure White", "Olive Green"] },
        ];
      }
      return [
        { name: "Size", options: ["S", "M", "L", "XL", "XXL"] },
        { name: "Color", options: ["Classic Black", "Navy Blue", "Olive Green", "Charcoal"] },
      ];
    }

    case "home":
    case "home-living": {
      return [{ name: "Finish", options: ["Natural Walnut", "Classic Teak", "Matte Charcoal"] }];
    }

    case "beauty": {
      return [{ name: "Volume", options: ["30 ml", "50 ml", "100 ml"] }];
    }

    case "sports": {
      return [{ name: "Option", options: ["Standard Edition", "Pro Athlete Pack"] }];
    }

    case "books": {
      return [{ name: "Format", options: ["Hardcover Edition", "Paperback", "Deluxe Box Set"] }];
    }

    case "toys": {
      return [{ name: "Edition", options: ["Standard Kit", "Mega Builder Pack (+50 Pieces)"] }];
    }

    case "food": {
      return [{ name: "Pack Size", options: ["250 g", "500 g", "1 kg Family Pack"] }];
    }

    case "health": {
      return [
        { name: "Bottle Size", options: ["60 Units", "120 Units (Value Pack)", "Pack of 2"] },
      ];
    }

    case "automotive": {
      return [{ name: "Edition", options: ["Standard Unit", "Pro Kit with Storage Bag"] }];
    }

    default:
      return [];
  }
}
