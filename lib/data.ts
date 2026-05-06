export type ProductSeed = {
  id: string;
  name: string;
  category: ProductCategory;
  aroma: string;
  description: string;
  price: number;
  promoLabel: string;
  promoDiscount: number;
  stock: number;
  imageUrl: string;
  imageAlt: string;
  rating: number;
  leadTime: string;
  variants: ProductVariants;
  giftCardAvailable: boolean;
  customBuild?: boolean;
};

export type ProductCategory = "Signature" | "Floral" | "Fresh" | "Gift Set" | "Custom";

export type ProductVariants = {
  aromas: string[];
  containers: string[];
  decorations: string[];
};

export type ProductRecord = {
  id: string;
  name: string;
  category: string;
  aroma: string;
  description: string;
  price: number;
  promoLabel?: string | null;
  promoDiscount?: number | null;
  stock: number;
  imageUrl: string;
  imageAlt: string;
  rating: number;
  leadTime: string;
  aromaOptions: string[];
  containerOptions: string[];
  decorationOptions: string[];
  giftCardAvailable: boolean;
  customBuild: boolean;
};

export const productCategories: ProductCategory[] = [
  "Signature",
  "Floral",
  "Fresh",
  "Gift Set",
  "Custom",
];

export const products: ProductSeed[] = [
  {
    id: "aurora-vanilla",
    name: "Aurora Vanilla",
    category: "Signature",
    aroma: "Vanilla, amber, clove",
    description:
      "A creamy warm candle for dinner tables, reading corners, and slow evenings with polished glass and dried botanical accents.",
    price: 129000,
    promoLabel: "Weekend glow",
    promoDiscount: 12,
    stock: 42,
    imageUrl:
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Warm vanilla candle in a clear glass jar",
    rating: 4.9,
    leadTime: "Ready stock",
    variants: {
      aromas: ["Vanilla amber", "Vanilla clove", "Vanilla sandalwood"],
      containers: ["Clear glass jar", "Amber glass jar", "Matte cream tin"],
      decorations: ["Dried orange", "Cinnamon stick", "Gold wax seal"],
    },
    giftCardAvailable: true,
  },
  {
    id: "citrus-market",
    name: "Citrus Market",
    category: "Fresh",
    aroma: "Lemongrass, bergamot, mint",
    description:
      "Bright aromatherapy notes made for cafes, kitchens, and fresh morning rituals with clean reusable containers.",
    price: 119000,
    promoLabel: "",
    promoDiscount: 0,
    stock: 36,
    imageUrl:
      "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Fresh citrus candle with simple home styling",
    rating: 4.8,
    leadTime: "Ready stock",
    variants: {
      aromas: ["Lemongrass mint", "Bergamot peel", "Lime basil"],
      containers: ["Frosted glass jar", "Clear glass jar", "Mini travel tin"],
      decorations: ["Dried lemon slice", "Mint leaf stamp", "Natural twine"],
    },
    giftCardAvailable: true,
  },
  {
    id: "forest-after-rain",
    name: "Forest After Rain",
    category: "Fresh",
    aroma: "Vetiver, cedarwood, eucalyptus",
    description: "Grounded, green, and restorative with a clean slow-burn coconut-soy wax blend.",
    price: 139000,
    promoLabel: "",
    promoDiscount: 0,
    stock: 28,
    imageUrl:
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Green restorative candle with a natural calm setting",
    rating: 5,
    leadTime: "Ready stock",
    variants: {
      aromas: ["Vetiver rain", "Cedar eucalyptus", "Pine rosemary"],
      containers: ["Smoked glass jar", "Stone ceramic cup", "Recycled glass tumbler"],
      decorations: ["Pressed fern", "Wood wick", "Cotton label"],
    },
    giftCardAvailable: false,
  },
  {
    id: "saffron-dusk",
    name: "Saffron Dusk",
    category: "Gift Set",
    aroma: "Saffron, sandalwood, orange peel",
    description:
      "A premium statement candle poured from refined circular-economy materials and packed for gifting.",
    price: 159000,
    promoLabel: "Gift deal",
    promoDiscount: 10,
    stock: 18,
    imageUrl:
      "https://images.unsplash.com/photo-1602526432604-029a709e131c?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Premium candle in a styled gift-ready setting",
    rating: 4.9,
    leadTime: "Ready stock",
    variants: {
      aromas: ["Saffron dusk", "Sandalwood orange", "Amber resin"],
      containers: ["Amber glass jar", "Black glass jar", "Brass travel tin"],
      decorations: ["Wax seal", "Dried orange", "Velvet ribbon"],
    },
    giftCardAvailable: true,
  },
  {
    id: "rose-petal-note",
    name: "Rose Petal Note",
    category: "Floral",
    aroma: "Rose, geranium, white tea",
    description:
      "A soft floral candle with petal decoration and optional handwritten greeting card for personal moments.",
    price: 149000,
    promoLabel: "",
    promoDiscount: 0,
    stock: 24,
    imageUrl:
      "https://images.unsplash.com/photo-1607344645866-009c7d2b63df?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Floral candle with soft petals and gift styling",
    rating: 4.9,
    leadTime: "Ready stock",
    variants: {
      aromas: ["Rose white tea", "Peony musk", "Jasmine linen"],
      containers: ["Blush glass jar", "Clear glass jar", "Pearl ceramic cup"],
      decorations: ["Rose petals", "Baby breath", "Pink ribbon"],
    },
    giftCardAvailable: true,
  },
  {
    id: "custom-candle-studio",
    name: "Custom Candle Studio",
    category: "Custom",
    aroma: "Design your own",
    description:
      "Build a candle from your preferred aroma, container, decoration, and greeting card message.",
    price: 189000,
    promoLabel: "",
    promoDiscount: 0,
    stock: 12,
    imageUrl:
      "https://images.unsplash.com/photo-1602526432604-029a709e131c?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Custom candle design studio with candle materials",
    rating: 5,
    leadTime: "3-5 working days",
    variants: {
      aromas: ["Vanilla amber", "Rose white tea", "Lemongrass mint", "Cedar eucalyptus", "Saffron sandalwood"],
      containers: ["Clear glass jar", "Amber glass jar", "Stone ceramic cup", "Matte black jar"],
      decorations: ["Dried flowers", "Wax seal", "Ribbon wrap", "Pressed leaves", "Minimal label only"],
    },
    giftCardAvailable: true,
    customBuild: true,
  },
];

export function productToDbInput(product: ProductSeed) {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    aroma: product.aroma,
    description: product.description,
    price: product.price,
    promoLabel: product.promoLabel,
    promoDiscount: product.promoDiscount,
    stock: product.stock,
    imageUrl: product.imageUrl,
    imageAlt: product.imageAlt,
    rating: product.rating,
    leadTime: product.leadTime,
    aromaOptions: product.variants.aromas,
    containerOptions: product.variants.containers,
    decorationOptions: product.variants.decorations,
    giftCardAvailable: product.giftCardAvailable,
    customBuild: product.customBuild ?? false,
  };
}

export function productFromDb(product: ProductRecord): ProductSeed {
  const category = productCategories.includes(product.category as ProductCategory)
    ? (product.category as ProductCategory)
    : "Signature";

  return {
    id: product.id,
    name: product.name,
    category,
    aroma: product.aroma,
    description: product.description,
    price: product.price,
    promoLabel: product.promoLabel ?? "",
    promoDiscount: product.promoDiscount ?? 0,
    stock: product.stock,
    imageUrl: product.imageUrl,
    imageAlt: product.imageAlt || product.name,
    rating: product.rating,
    leadTime: product.leadTime,
    variants: {
      aromas: product.aromaOptions.length ? product.aromaOptions : [product.aroma],
      containers: product.containerOptions.length ? product.containerOptions : ["Clear glass jar"],
      decorations: product.decorationOptions.length ? product.decorationOptions : ["Minimal label only"],
    },
    giftCardAvailable: product.giftCardAvailable,
    customBuild: product.customBuild,
  };
}

export function productSalePrice(product: Pick<ProductSeed, "price" | "promoDiscount">) {
  const discount = Math.min(Math.max(product.promoDiscount, 0), 90);
  return Math.round(product.price * (1 - discount / 100));
}

export function productHasPromo(product: Pick<ProductSeed, "promoDiscount">) {
  return product.promoDiscount > 0;
}

export const oilSubmissions = [
  {
    location: "Kemang, Jakarta Selatan",
    quantity: 18,
    pickupMethod: "PICKUP",
    schedule: "2026-05-08T09:00:00.000Z",
    status: "SCHEDULED",
    priceEstimate: 101088,
  },
  {
    location: "Cihampelas, Bandung",
    quantity: 7,
    pickupMethod: "DROPOFF",
    schedule: "2026-05-10T13:00:00.000Z",
    status: "REQUESTED",
    priceEstimate: 36400,
  },
];

export const steps = [
  ["Collect", "Households and cafes submit jelantah for pickup or drop-off."],
  ["Refine", "Oil is filtered and processed into clean candle-ready material."],
  ["Pour", "Artisan batches become premium aromatherapy candles."],
  ["Glow", "Customers buy candles and fund the next circular cycle."],
];

export const awarenessArticles = [
  {
    title: "Why candle containers are worth reusing",
    source: "CandleX Journal",
    date: "2026-05-02",
    category: "Circular design",
    imageUrl:
      "https://images.unsplash.com/photo-1771149437810-56fec4035757?auto=format&fit=crop&w=900&q=82",
    imageAlt: "Oil slick spreading across polluted water",
    summary:
      "Glass jars, ceramic cups, and tins can extend a candle product cycle when customers clean, refill, or return them.",
  },
  {
    title: "Choosing safer candle care habits at home",
    source: "CandleX Care Desk",
    date: "2026-04-26",
    category: "Home awareness",
    imageUrl:
      "https://images.unsplash.com/photo-1759868414347-e3b4f79f4bba?auto=format&fit=crop&w=900&q=82",
    imageAlt: "Plastic waste floating in dirty water",
    summary:
      "Trimming wicks, keeping candles away from airflow, and stopping before the wax runs out helps candles burn cleaner.",
  },
  {
    title: "How waste oil can support low-waste gifting",
    source: "Circular Living Review",
    date: "2026-04-18",
    category: "Sustainability",
    imageUrl:
      "https://images.unsplash.com/photo-1776260700301-c1d5e30a3f19?auto=format&fit=crop&w=900&q=82",
    imageAlt: "Murky green water contaminated with waste",
    summary:
      "Refined used cooking oil can become part of a small-batch candle supply story for mindful gifts.",
  },
];

export const customerTestimonials = [
  {
    name: "Nadya Prameswari",
    location: "Jakarta Selatan",
    product: "Aurora Vanilla",
    purchasedAt: "3 Mei 2026",
    rating: 5,
    comment:
      "Aromanya warm, lembut, dan tidak menusuk. Saya nyalakan sekitar satu jam sebelum tidur, kamar langsung terasa lebih calm dan wangi vanillanya tahan sampai pagi.",
  },
  {
    name: "Raka Mahendra",
    location: "Bandung",
    product: "Citrus Market",
    purchasedAt: "28 April 2026",
    rating: 4.9,
    comment:
      "Citrus dan lemongrass-nya segar banget untuk ruang kerja, tapi tetap soft. Packaging rapi, wick mudah dinyalakan, dan burn-nya rata.",
  },
  {
    name: "Alya Putri",
    location: "Tangerang",
    product: "Saffron Dusk Gift Set",
    purchasedAt: "21 April 2026",
    rating: 5,
    comment:
      "Saya beli untuk hadiah ulang tahun. Box-nya terlihat premium, aroma saffron-sandalwood-nya elegan, dan penerimanya suka karena ada cerita bahan circular di balik produknya.",
  },
];
