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

// ─── Products ─────────────────────────────────────────────────────────────────

export const PRODUCTS: Product[] = [
  // ── Women ──────────────────────────────────────────────────────────────────
  {
    id: 'dior-pink-silk',
    name: 'שמלת משי ורודה',
    brand: 'דיור',
    brandId: 'dior',
    price: 8400,
    originalPrice: 10200,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYdQjQ_9ilff9eJt5Wpc5fM5Qig58fc5X8lXhIHk3KxT1t3ydftXYcEOGWlL653IQjkVyjQsZPBMnfhIEfs0ZVxdxu7C2_urhv_SBedmvpm-LsrdZ64fCxzZVW_eRSzbPy98Rmfl9IS1_xeHyPro8T4qd7N2w4PofjTpjsvtuOyahLntPyXW9rmocysOwKh3rENcZUgvYD2Cbo6rJCAgkZklgT7TGX6D98UWc_tJ2KzDeaklxOu8f9_Du5cx93eWM3aznK77xwzg',
    category: 'dresses',
    gender: 'women',
    description: 'שמלת משי אלגנטית בגוון ורוד רך, גזרה זורמת עם כתפיות עדינות. קולקציית אביב-קיץ 2025.',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['ורוד', 'שמנת'],
    inStock: true,
    isNew: true,
    tags: ['שמלה', 'משי', 'אלגנטי', 'קיץ'],
    scenes: [CAFE_SCENE, PARTY_SCENE, STREET_SCENE, BEACH_SCENE],
  },
  {
    id: 'gucci-beige-blazer',
    name: "ז'קט מחויט בז'",
    brand: "גוצ'י",
    brandId: 'gucci',
    price: 11200,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9v1Zh9h5Rj6sHFbZDyn2rfFnozZuENX76gjVDMNUD0s-JJZz2_SPIwb8uN1wVL-kPinZGtNntpnAiiF7vUok7K-O2Zk9_-7m_4XFpqsRu0NIr-_Q3bKHWDXiaoJF7Bl69Yvim7FgAck5yzOOXXlEGsxSDdEUyO9ymaCRCUkCu55geNK_fkR6cVhlmYV4vbYtcmGQvANBaGy-PYCdoRFc1l4PMG22Z7kK3GJuhXqZuUwS05vedBB6o5r2XmFFKgHYI8qFfK0oGyw',
    category: 'outerwear',
    gender: 'women',
    description: "ז'קט מחויט בגוון בז' עם עיטורי לוגו גוצ'י, כפתורי זהב וגזרה נשית מוגדרת. מושלם למשרד ולצהריים.",
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ["בז'", 'שחור', 'לבן'],
    inStock: true,
    tags: ["ז'קט", 'מחויט', 'עסקי', 'פרימיום'],
    scenes: [OFFICE_SCENE, STREET_SCENE, CAFE_SCENE, PARTY_SCENE],
  },
  {
    id: 'prada-yellow-suit',
    name: 'חליפת קיץ צהובה',
    brand: 'פראדה',
    brandId: 'prada',
    price: 6800,
    originalPrice: 8500,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYIowC_JvqN6rJ87j-4rrUa8VxGvNhv9hUIbGCzLP5zKuuUggwpge63R-qIx3YWQBfanEvQK-ffTbPDlkdhxQZGrD4oO68K8IkR2aavEEtG3RWq85VUNmqKXHm1dD64oLXncuF4Ss3-7AJyYACFwJdlZUqKBDDAd6X3vFyGaAnr27pW8i_1nQOrZf7aXUJZdKTY5eitNpmH8npY4HCMRZ-UXSPpnqXxEH6q6EBqZ8syfflFSrltK3qUK5ouRHpI_uVfbYlXGqWiA',
    category: 'suits',
    gender: 'women',
    description: 'חליפה קלה וצבעונית לעונת הקיץ — בד טרופי קל משקל, גזרה ישרה שמחמיאה לכל סוג גוף.',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['צהוב', 'לבן', 'כחול'],
    inStock: true,
    isNew: true,
    tags: ['חליפה', 'קיץ', 'צבעוני', 'טרנדי'],
    scenes: [BEACH_SCENE, STREET_SCENE, CAFE_SCENE, PARTY_SCENE],
  },
  {
    id: 'chanel-evening-dress',
    name: 'שמלת ערב קלאסית',
    brand: 'שאנל',
    brandId: 'chanel',
    price: 14900,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2XgizkQTUHlzPje1R12MoSgp8Z5JKqyfPlWYZ0wuWy-pIKgcxizihNJa4B2RrfEz59c7HiPpxtK8O1X3oSTnARg3vJTibtFQ67y4gc4WqvOcPLnsogXVwImGm09rxshBjQHGGu-VVF64NK2wWRfu5UEsEZppeqDcfq6TvTz_ezIRXjTiEkRtfndyWB4tY6uoXDdzP15nqJc2OSRH6x0qkOnQtWxInAPdy29T34_ZXVD7IX3LtO8iDltOEGM1wQ54Tz717Vrfq2A',
    category: 'dresses',
    gender: 'women',
    description: 'שמלת ערב שחורה קלאסית בהשראת ה"קטנה השחורה" האייקונית של שאנל. בד קריפ יוקרתי, כיסים נסתרים.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['שחור'],
    inStock: true,
    tags: ['שמלת ערב', 'קלאסי', 'שחור', 'אלגנטי'],
    scenes: [PARTY_SCENE, CAFE_SCENE, STREET_SCENE, OFFICE_SCENE],
  },
  // ── Men ────────────────────────────────────────────────────────────────────
  {
    id: 'prada-white-shirt',
    name: 'חולצת פשתן פרימיום',
    brand: 'פראדה',
    brandId: 'prada',
    price: 3200,
    originalPrice: 3800,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNiP9wyg8Vzpc3lxd0wvNEgrBwseWXWVBooVCqfRV3txyrWM1RI8gEeojxpMRI3Ndg1hhyg4cv9V-O3PLUzsvEcQF8aUIkm7zXW30XWGazPeYXIWmvx0910YY2xyrZNoSi4jrCjktPvn9Vt9zEHogts-n9HmUF5m3PF6KqzKBUJcpU31Ly9lWYzNPzOeQKWM1OmHf9T1RBmv85xy5wtucJO0UV0LyVpeK-MmWLuNlKMlwl3GSmSUt41tZf0eVIbRUfnyZQvrB6sg',
    category: 'tops',
    gender: 'men',
    description: 'חולצה לבנה בבד פשתן איטלקי מובחר, גזרה ישרה ונוחה. קפל כפול בשרוולים, כפתורי עצם.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['לבן', 'שמנת', 'תכלת'],
    inStock: true,
    isNew: false,
    tags: ['חולצה', 'פשתן', 'קיץ', 'אלגנטי'],
    scenes: [CAFE_SCENE, STREET_SCENE, BEACH_SCENE, OFFICE_SCENE],
  },
  {
    id: 'hermes-chino',
    name: "מכנסי צ'ינו קלאסיים",
    brand: 'הרמס',
    brandId: 'hermes',
    price: 4800,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaai8of2NzHlF3VVqlfiSEbvF37Kd7egdAFUZchc6SHxNEa8AJ6TiSQusesZBvlEupl43_WuLYum__9tgO8O8yHyF-wJQmQEdQvIJv0b-otJVG4KaniajjT3I_QuFnMfb6-sw1rbFPTXokA5BhvFTKQeAJY_T7EzmiYrvwbpaGds_-orqjUO4gy6cxmi9vFMZaEjyDldb-e9vjtrG2Ld6St8I8S4cSgayp1iL13Ny937ZgfAXru012BZW0anPSUIAeAOy3SG0Kfw',
    category: 'bottoms',
    gender: 'men',
    description: "מכנסי צ'ינו יוקרתיים בגוון כחול נייבי, בד כותנה עצרת ופנים, גזרה ישרה מעט נחמדת.",
    sizes: ['28', '30', '32', '34', '36', '38'],
    colors: ['כחול נייבי', 'חאקי', 'אפור'],
    inStock: true,
    tags: ["מכנסיים", "צ'ינו", 'קלאסי', 'נייבי'],
    scenes: [STREET_SCENE, OFFICE_SCENE, CAFE_SCENE, BEACH_SCENE],
  },
  {
    id: 'lv-polo',
    name: 'חולצת פולו סלים פיט',
    brand: 'לואי ויטון',
    brandId: 'lv',
    price: 5600,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdBxRSDroqTaYOHK7PRNGC_VeexPFiO0YE3aS_mpJjjJTb4GoSgTu-kWBHCp_dsEuJPKg8Eneq-bJO1hRxhW7SqqTdUVee7TLhzSgLGMQnIBgkU6GOlRmCrPG29zMAQjJE4oT2AHx3v_MS9oedgasCfTmwGkrTKnTH1-nIf8tMk1DN0JjHQzEKSy54NPyJuiNEIRxJ_WFgFkCyZPWKyeAFPWwXMSR07lSH1ymWGn_BQF9GORxpWytnbVfUuotLgrAF0C6R3RffbQ',
    category: 'tops',
    gender: 'men',
    description: 'חולצת פולו סלים פיט אפורה, בד פיקה איכותי עם לוגו LV רקום. אידיאלי לפנאי ולאירועים קז׳ואל-שיק.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['אפור', 'שחור', 'לבן', 'נייבי'],
    inStock: true,
    isNew: true,
    tags: ['פולו', 'סלים פיט', 'קז׳ואל', 'יוקרה'],
    scenes: [STREET_SCENE, CAFE_SCENE, BEACH_SCENE, OFFICE_SCENE],
  },
  {
    id: 'dior-blazer',
    name: 'בלייזר מחויט כהה',
    brand: 'דיור',
    brandId: 'dior',
    price: 9900,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCC6rtd-3FVk5rz24oGJtcYR8guPplzPxEn7dpvtV4vlCOEkCirAwbsm4KKRUsqTS3PAwNbnJptgyPz9S0Erlc6843A4TZhdCgenKGNjjvGse4jKANw21-cmbGeJNJqSlKegEEvxyI_VbQJyCGrhifgMp1O4qfGk_yYSEXKAit7uC6M_Ky5s8McoN_9tAu6zmJj5hKlKPrDIVzy-7TpC3NPD-q48UHNNT28A3-dUqJnhbpWbwYLwHmvtiqA805nN_An4eFbOtPL4A',
    category: 'outerwear',
    gender: 'men',
    description: 'בלייזר מחויט בצמר אנגלי כהה, כפתורי של דיור, תפירה ידנית איטלקית. מושלם לאירועים חגיגיים.',
    sizes: ['46', '48', '50', '52', '54'],
    colors: ['שחור', 'נייבי', 'אפור כהה'],
    inStock: true,
    tags: ['בלייזר', 'מחויט', 'חגיגי', 'דיור'],
    scenes: [OFFICE_SCENE, PARTY_SCENE, STREET_SCENE, CAFE_SCENE],
  },
  {
    id: 'gucci-suit',
    name: 'חליפת גברים קלאסית',
    brand: "גוצ'י",
    brandId: 'gucci',
    price: 18500,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b0a3c?w=600&q=80',
    category: 'suits',
    gender: 'men',
    description: "חליפת גברים קלאסית מגוצ'י — צמר מרינו איטלקי, גזרה סלים מודרנית, תפירה ידנית בפירנצה.",
    sizes: ['46', '48', '50', '52', '54', '56'],
    colors: ['אפור', 'כחול נייבי', 'שחור'],
    inStock: true,
    tags: ['חליפה', 'גברים', 'יוקרה', 'מחויט'],
    scenes: [OFFICE_SCENE, PARTY_SCENE, STREET_SCENE, CAFE_SCENE],
  },
  {
    id: 'lv-trench',
    name: 'מעיל טרנץ׳ קלאסי',
    brand: 'לואי ויטון',
    brandId: 'lv',
    price: 16500,
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80',
    category: 'outerwear',
    gender: 'unisex',
    description: 'מעיל טרנץ׳ איקוני של לואי ויטון, בד גאבארדין מגן גשם, מחמש רצועות מתכווננות וכפתורי נחושת.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['בז׳ קלאסי', 'שחור'],
    inStock: true,
    isNew: true,
    tags: ['מעיל', 'טרנץ׳', 'קלאסי', 'יוניסקס'],
    scenes: [STREET_SCENE, CAFE_SCENE, OFFICE_SCENE, PARTY_SCENE],
  },
  {
    id: 'chanel-tweed',
    name: 'ז׳קט טוויד שאנל',
    brand: 'שאנל',
    brandId: 'chanel',
    price: 22000,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80',
    category: 'outerwear',
    gender: 'women',
    description: 'ז׳קט טוויד איקוני של שאנל בגוון שמנת-מולטי, עיטורי שרשרת זהב, כפתורי CC מגולפים.',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['שמנת', 'שחור', 'ורוד'],
    inStock: true,
    tags: ["ז'קט", 'טוויד', 'איקוני', 'שאנל'],
    scenes: [CAFE_SCENE, STREET_SCENE, PARTY_SCENE, OFFICE_SCENE],
  },
  {
    id: 'hermes-scarf',
    name: 'צעיף משי קארה',
    brand: 'הרמס',
    brandId: 'hermes',
    price: 3900,
    image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80',
    category: 'accessories',
    gender: 'unisex',
    description: 'צעיף קארה 90×90 ס"מ של הרמס — הדפס בלוקס יד, משי 100% צרפתי. אביזר אייקוני עולמי.',
    sizes: ['90×90 ס"מ'],
    colors: ['כחול-כתום', 'ורוד-זהב', 'ירוק-אדום'],
    inStock: true,
    tags: ['צעיף', 'משי', 'הרמס', 'קארה'],
    scenes: [STREET_SCENE, CAFE_SCENE, PARTY_SCENE, BEACH_SCENE],
  },
];

export function getProductsByBrand(brandId: string): Product[] {
  return PRODUCTS.filter((p) => p.brandId === brandId);
}

export function getProductsByGender(gender: 'men' | 'women' | 'all'): Product[] {
  if (gender === 'all') return PRODUCTS;
  return PRODUCTS.filter((p) => p.gender === gender || p.gender === 'unisex');
}
