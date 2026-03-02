export interface Brand {
  id: string;
  name: string;
  logo: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  brandId: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: 'tops' | 'bottoms' | 'dresses' | 'outerwear' | 'suits' | 'accessories';
  gender: 'men' | 'women' | 'unisex';
  description: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
  isNew?: boolean;
  tags: string[];
  /** Scenes used for try-on generation */
  scenes: { id: string; label: string; prompt: string }[];
}

// ─── Brands ───────────────────────────────────────────────────────────────────

export const BRANDS: Brand[] = [
  {
    id: 'gucci',
    name: "גוצ'י",
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnvAJsvIbIxjfXdg1EqRGK88_YIEzjmuEeu3SK5XdLZ86fqEW2kJkfVhy4E1vA2zb4S0BF7dOeMGFZ0AILlVCjX7DbEaN00r7xjT7rywnl8HcC9QP7KQ-iiSoIGm1UvG_TTDqTLkuMIZQm1WSwDiOmDL7HS_YtCy5WNGRMsVQrbQ9hbhdARRpkJAotBp6tz4aehgTUHRcgshPvF4yVxVvI7KauxzkPBSJW0jhlCoZK4iQ_MSOnoQUppcGHix1tKJq8kb3jN3xCdQ',
  },
  {
    id: 'prada',
    name: 'פראדה',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvwwtlFagQTmHQZ1lf-RJ7dOALzKhkAuQxnhH0a2n3DRW7iqhC2aMreTkHxjx971KVxwq_ZTDs923iAzdd-tcJK83Z4Gn-b41MzVFc6XCikbfFOXALp06mLAD8pUfVUYNGX3pjUnWhWKSDZ5wcH9yN99kGu39fiz2FXR-DMUYJR4mEmvIfMdjl5XPv1JOoqF6Oev9dHejWMFm1Co9_9WbUOtR6DcVxbzacNTtv5CB9OJLSAouOuBrw2bcpGxQD-vPlfv6GOy3Gog',
  },
  {
    id: 'chanel',
    name: 'שאנל',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDKh1MtaEFuQhi9kEuyUdIGHUHgoT_soCWfHnoGhuw-miatBv36gtUGbB04g_VJBqJc6IxObo45w72wrxxmxzsyFkRrqwp6PuoZG0Fv0jOBIX_UWGI7FpvMgdNW0EepS1M1i84DugjLPOdNq_4hxn71E3WDdMhm8idZzih514pKPCq41sdlV0LtlisDK76MXAQl7qqf5xz38dqIVAup8149l_4k01PVLzW1Jk98_yZ3CyBh4Jy2w7zj6uxtG1rPffbLsZyJOMNHg',
  },
  {
    id: 'dior',
    name: 'דיור',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4QRfr4XeF51oIB44BTNGBHHUEpGkUGihJHobjNlrkc4DOIBfBWpD5Ki-j0oBcKv6tDm5ThpNXn37YWcHZTQWqublffkmyhU7Qg90fnVXiQWg5WhaHN5o0O1xROVrZobwHT6z2cQvH3o7j9Akw5-MChfhCoKQMQw1xY20fjk7DFh3_pQTKLTj3SaclRQ9sJ3KcFgfes5ocZjNy9OJMtoYmFCi8_Fpt0IeMi51g-5vaLfUHmU5MpG9HrNyPXRC44o8xNClBM8b9gQ',
  },
  {
    id: 'hermes',
    name: 'הרמס',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZKqIIh6h7p6AHXqsSYRtiLYwEQRHaGok-Tz9N04fztjaW-4NxpoRww-TsinCxPaiM10iu6tXmAiI0dZwJtkvrNuxJT5VcNhTAp0d39n-pZ7hVEDlitGY8pr5AY9XJL1nQLiFHXSMDqHndNa2eIDj9UErisRmhsw8PVmklNeikS3eLxuVlWruvGDbmewyhs-fyfXypFR3uoK5RJ5P41L9Jmrg2eaNBsB9uhoOzgeZITEGL6RzNYuYS9cpEUEfciE6ZnVuzXHMnJQ',
  },
  {
    id: 'lv',
    name: 'לואי ויטון',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpCFmB-wcRk9bSjSy-y2w1YcUcxMDZb_cypgvn8CtuzNrQKTEy5eiXeh1Si3G86KJMGRpFFscnBzaotmx0Zv2QFl9iHz7XZkJSfmNxQu3ffEQolzcDJaexSjJgtLuRgnvd96jvuHIF8PEZxz1xTgOYOsj1fkbSSNW8GzyYnESI7MIfTLVZt9stNSC7L_RaIi31tqiBiW1MVmTKfQhQ2jqB02Ra11ySGUNaEzRlz1oCe4lJCo8Q3SfcihQc51iwf6hiIx9ovKdz2w',
  },
  {
    id: 'zara',
    name: 'Zara',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Zara_Logo.svg/320px-Zara_Logo.svg.png',
  },
];

// ─── Default scenes used for all try-ons ─────────────────────────────────────

const STREET_SCENE = {
  id: 'street',
  label: 'רחוב',
  prompt: 'a trendy urban street in Tel Aviv during golden hour, with bokeh city lights in the background',
};
const CAFE_SCENE = {
  id: 'cafe',
  label: 'בית קפה',
  prompt: 'a cozy, upscale Parisian-style cafe with warm amber lighting, marble tables, and large windows',
};
const OFFICE_SCENE = {
  id: 'office',
  label: 'משרד',
  prompt: 'a sleek modern office with floor-to-ceiling glass windows, clean minimalist interiors',
};
const BEACH_SCENE = {
  id: 'beach',
  label: 'חוף',
  prompt: 'a scenic Mediterranean beach at golden-hour sunset, turquoise water and soft sand',
};
const PARTY_SCENE = {
  id: 'party',
  label: 'מסיבה',
  prompt: 'an elegant rooftop party in a luxury penthouse with city lights, ambient lighting and a sophisticated crowd',
};

// ─── Products — Real Zara Israel Men's items (fetched via Apify datasaurus/zara) ─

export const PRODUCTS: Product[] = [
  {
    id: 'zara-05070904-V2026',
    name: '100% LINEN RELAXED FIT SHIRT',
    brand: 'Zara',
    brandId: 'zara',
    price: 249,
    image: 'https://static.zara.net/assets/public/c4fc/d493/837943db8256/1ad89cf8d64f/05070904250-e1/05070904250-e1.jpg?ts=1765447195312&w=600',
    category: 'tops',
    gender: 'men',
    description: 'חולצת פשתן 100% בגזרה רלקסד — קלה, נושמת ומושלמת לקיץ הישראלי. זמינה ב-5 צבעים.',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Light Beige', 'Dark Green', 'Brown / Taupe', 'Black'],
    inStock: true,
    isNew: true,
    tags: ['zara', 'men', 'tops', 'linen', 'summer'],
    scenes: [STREET_SCENE, BEACH_SCENE, CAFE_SCENE, OFFICE_SCENE],
  },
  {
    id: 'zara-06103407-V2026',
    name: 'CREASED-EFFECT SHIRT',
    brand: 'Zara',
    brandId: 'zara',
    price: 190,
    image: 'https://static.zara.net/assets/public/6e27/7d5e/696a464ebbf0/e805b248307b/06103407250-e1/06103407250-e1.jpg?ts=1770285350691&w=600',
    category: 'tops',
    gender: 'men',
    description: 'חולצה בסגנון מקומט-מכוון עם מרקם ייחודי. גזרה ישרה מודרנית, מושלמת ללוק קז׳ואל-שיק.',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Dark Khaki', 'Brown / Taupe', 'Charcoal', 'Blue'],
    inStock: true,
    isNew: true,
    tags: ['zara', 'men', 'tops', 'textured'],
    scenes: [STREET_SCENE, CAFE_SCENE, OFFICE_SCENE, BEACH_SCENE],
  },
  {
    id: 'zara-04364653-V2026',
    name: 'RELAXED FIT FLOWING SHIRT',
    brand: 'Zara',
    brandId: 'zara',
    price: 249,
    image: 'https://static.zara.net/assets/public/d480/60e8/5f57410ba49b/fe93f321744b/04364653712-e1/04364653712-e1.jpg?ts=1772117940574&w=600',
    category: 'tops',
    gender: 'men',
    description: 'חולצה זורמת בגזרה רלקסד עם בד קל ומחמיא. אידיאלית לחופשה ולאירועים כפריים.',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Ecru', 'Black', 'Brown'],
    inStock: true,
    isNew: true,
    tags: ['zara', 'men', 'tops', 'flowing', 'resort'],
    scenes: [BEACH_SCENE, STREET_SCENE, CAFE_SCENE, OFFICE_SCENE],
  },
  {
    id: 'zara-03090110-V2026',
    name: '100% LINEN REGULAR FIT SHIRT',
    brand: 'Zara',
    brandId: 'zara',
    price: 249,
    image: 'https://static.zara.net/assets/public/bcd9/868e/aaa84004ba52/3eaf7ebdd961/03090110403-e1/03090110403-e1.jpg?ts=1765447187944&w=600',
    category: 'tops',
    gender: 'men',
    description: 'חולצת פשתן 100% בגזרה רגולרית קלאסית — מתאימה לכל אוקיז׳ן, בצבעים נקיים ועכשוויים.',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Sky Blue', 'Light Beige', 'Chocolate', 'White', 'Navy Blue'],
    inStock: true,
    isNew: true,
    tags: ['zara', 'men', 'tops', 'linen', 'classic'],
    scenes: [OFFICE_SCENE, STREET_SCENE, CAFE_SCENE, BEACH_SCENE],
  },
  {
    id: 'zara-04187152-V2026',
    name: 'GEOMETRIC JACQUARD SHIRT',
    brand: 'Zara',
    brandId: 'zara',
    price: 229,
    image: 'https://static.zara.net/assets/public/dc2e/c276/68c646949393/857d240d92fb/04187152712-e1/04187152712-e1.jpg?ts=1769700540334&w=600',
    category: 'tops',
    gender: 'men',
    description: 'חולצת ז׳קאר עם הדפס גיאומטרי בולט. בד עשיר עם מרקם תלת-מימדי — בולטת בכל מקום.',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Ecru', 'Camel', 'Navy Blue'],
    inStock: true,
    tags: ['zara', 'men', 'tops', 'jacquard', 'pattern'],
    scenes: [STREET_SCENE, CAFE_SCENE, OFFICE_SCENE, BEACH_SCENE],
  },
  {
    id: 'zara-05862404-V2026',
    name: 'LIMITED EDITION BAGGY FIT CHECK TROUSERS',
    brand: 'Zara',
    brandId: 'zara',
    price: 279,
    image: 'https://static.zara.net/assets/public/4ed9/104d/fcdc4aefa4b6/296691953302/05862404406-e1/05862404406-e1.jpg?ts=1769617523033&w=600',
    category: 'bottoms',
    gender: 'men',
    description: 'מכנסי בגי פיט בדוגמת משבצות — אדישן מוגבל. טרנד רחוב עכשווי עם תחושה נוחה ורחבה.',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Light Blue'],
    inStock: true,
    isNew: true,
    tags: ['zara', 'men', 'bottoms', 'baggy', 'limited edition', 'check'],
    scenes: [STREET_SCENE, CAFE_SCENE, BEACH_SCENE, OFFICE_SCENE],
  },
  {
    id: 'zara-06861391-V2026',
    name: 'RELAXED FIT PLEATED TROUSERS',
    brand: 'Zara',
    brandId: 'zara',
    price: 279,
    image: 'https://static.zara.net/assets/public/30cd/1f97/1cf242bd9004/6afde0b5c9cd/07484391800-e1/07484391800-e1.jpg?ts=1763046678819&w=600',
    category: 'bottoms',
    gender: 'men',
    description: 'מכנסיים מקופלים בגזרה רלקסד — בד איכותי עם נפח מחמיא. מתאימים למשרד ולאירועים.',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Oyster-White', 'Brown / Taupe', 'Light Tan'],
    inStock: true,
    tags: ['zara', 'men', 'bottoms', 'pleated', 'smart casual'],
    scenes: [OFFICE_SCENE, STREET_SCENE, CAFE_SCENE, BEACH_SCENE],
  },
  {
    id: 'zara-05070902-V2026',
    name: '100% LINEN RELAXED FIT TROUSERS',
    brand: 'Zara',
    brandId: 'zara',
    price: 279,
    image: 'https://static.zara.net/assets/public/9f61/922d/416e45c4989e/a6ca879ca591/05070902250-e1/05070902250-e1.jpg?ts=1766392664782&w=600',
    category: 'bottoms',
    gender: 'men',
    description: 'מכנסי פשתן 100% בגזרה רלקסד — קלים ונושמים, מתאימים לחוף ולבילוי קיצי.',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Light Beige', 'Dark Green', 'Brown / Taupe', 'Black'],
    inStock: true,
    tags: ['zara', 'men', 'bottoms', 'linen', 'summer'],
    scenes: [BEACH_SCENE, STREET_SCENE, CAFE_SCENE, OFFICE_SCENE],
  },
  {
    id: 'zara-07147436-V2026',
    name: 'TEXTURED RELAXED FIT TROUSERS',
    brand: 'Zara',
    brandId: 'zara',
    price: 249,
    image: 'https://static.zara.net/assets/public/56db/c2f7/f9b94e0b9cbe/2111e76de578/07147436251-e1/07147436251-e1.jpg?ts=1762168723096&w=600',
    category: 'bottoms',
    gender: 'men',
    description: 'מכנסיים עם מרקם מיוחד בגזרה רלקסד מודרנית — מרגישים נוח, נראים מדויקים.',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Oyster-White', 'Camel', 'Light Beige', 'Black', 'Brown'],
    inStock: true,
    tags: ['zara', 'men', 'bottoms', 'textured', 'modern'],
    scenes: [STREET_SCENE, OFFICE_SCENE, CAFE_SCENE, BEACH_SCENE],
  },
  {
    id: 'zara-00693411-V2026',
    name: 'COTTON-LINEN LIMITED EDITION JUMPER',
    brand: 'Zara',
    brandId: 'zara',
    price: 399,
    image: 'https://static.zara.net/assets/public/a2e1/a90c/514840b893a0/d583f7d2231b/00693411500-a4/00693411500-a4.jpg?ts=1772196770149&w=600',
    category: 'tops',
    gender: 'men',
    description: 'סוודר כותנה-פשתן אדישן מוגבל — מרקם עדין עם חום ונוחות שאינם מתפשרים על סגנון.',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Green'],
    inStock: true,
    isNew: true,
    tags: ['zara', 'men', 'tops', 'knitwear', 'limited edition'],
    scenes: [STREET_SCENE, CAFE_SCENE, OFFICE_SCENE, BEACH_SCENE],
  },
  {
    id: 'zara-00693413-V2026',
    name: 'COTTON-LINEN V-NECK JUMPER LIMITED EDITION',
    brand: 'Zara',
    brandId: 'zara',
    price: 399,
    image: 'https://static.zara.net/assets/public/1d08/b486/665341479067/1e13c07d760c/00693413406-a1/00693413406-a1.jpg?ts=1772196772433&w=600',
    category: 'tops',
    gender: 'men',
    description: 'סוודר V-neck כותנה-פשתן אדישן מוגבל — חצוצרה עדינה עם סגנון מחמיא וחום קל.',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Light Blue'],
    inStock: true,
    isNew: true,
    tags: ['zara', 'men', 'tops', 'knitwear', 'v-neck', 'limited edition'],
    scenes: [CAFE_SCENE, OFFICE_SCENE, STREET_SCENE, BEACH_SCENE],
  },
  {
    id: 'zara-00693415-V2026',
    name: 'LIGHT COTTON/LINEN JUMPER LIMITED EDITION',
    brand: 'Zara',
    brandId: 'zara',
    price: 399,
    image: 'https://static.zara.net/assets/public/60d0/a8c8/b80e49a687ba/0c8e06901240/00693415401-a1/00693415401-a1.jpg?ts=1772196687472&w=600',
    category: 'tops',
    gender: 'men',
    description: 'סוודר קל ואווריר מכותנה-פשתן — אדישן מוגבל. מושלם למעברי עונות בסגנון מינימליסטי.',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Navy Blue', 'Grey'],
    inStock: true,
    tags: ['zara', 'men', 'tops', 'knitwear', 'lightweight', 'limited edition'],
    scenes: [STREET_SCENE, OFFICE_SCENE, CAFE_SCENE, BEACH_SCENE],
  },
];

export function getProductsByBrand(brandId: string): Product[] {
  return PRODUCTS.filter((p) => p.brandId === brandId);
}

export function getProductsByGender(gender: 'men' | 'women' | 'all'): Product[] {
  if (gender === 'all') return PRODUCTS;
  return PRODUCTS.filter((p) => p.gender === gender || p.gender === 'unisex');
}
