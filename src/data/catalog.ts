/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ClothingItem {
  id: string;
  name: string;
  nameHe: string;
  brand: string;
  price: number;
  category: 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes';
  color: string;
  colorHe: string;
  imageUrl: string;
  description: string;
  descriptionHe: string;
  tags: string[];
  scenes: Scene[];
}

export type Scene = {
  id: string;
  label: string;
  labelHe: string;
  emoji: string;
  prompt: string;
};

export const SCENES: Scene[] = [
  {
    id: 'street',
    label: 'Street',
    labelHe: 'רחוב',
    emoji: '🏙️',
    prompt: 'a stylish urban street in Tel Aviv, golden hour lighting, city vibes',
  },
  {
    id: 'cafe',
    label: 'Café',
    labelHe: 'בית קפה',
    emoji: '☕',
    prompt: 'a cozy modern coffee shop, warm light, cappuccino on the table, relaxed atmosphere',
  },
  {
    id: 'beach',
    label: 'Beach',
    labelHe: 'חוף הים',
    emoji: '🏖️',
    prompt: 'a beautiful Mediterranean beach in Israel, blue sea, sunny day, white sand',
  },
  {
    id: 'office',
    label: 'Office',
    labelHe: 'משרד',
    emoji: '💼',
    prompt: 'a modern tech startup office, large windows, professional yet casual environment',
  },
];

export const CATALOG: ClothingItem[] = [
  {
    id: '1',
    name: 'White Linen Shirt',
    nameHe: 'חולצת פשתן לבנה',
    brand: 'Zara',
    price: 199,
    category: 'top',
    color: 'white',
    colorHe: 'לבן',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop',
    description: 'Classic white linen shirt, perfect for summer',
    descriptionHe: 'חולצת פשתן קלאסית, מושלמת לקיץ',
    tags: ['casual', 'summer', 'classic'],
    scenes: SCENES,
  },
  {
    id: '2',
    name: 'Black Slim Jeans',
    nameHe: 'ג\'ינס שחור סלים',
    brand: 'Levis',
    price: 349,
    category: 'bottom',
    color: 'black',
    colorHe: 'שחור',
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop',
    description: 'Slim fit black jeans for any occasion',
    descriptionHe: 'ג\'ינס שחור slim fit לכל אירוע',
    tags: ['casual', 'versatile', 'classic'],
    scenes: SCENES,
  },
  {
    id: '3',
    name: 'Floral Summer Dress',
    nameHe: 'שמלת פרחים קיץ',
    brand: 'H&M',
    price: 279,
    category: 'dress',
    color: 'multicolor',
    colorHe: 'צבעוני',
    imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop',
    description: 'Light floral dress, perfect for warm days',
    descriptionHe: 'שמלה פרחונית קלה, מושלמת לימים חמים',
    tags: ['summer', 'feminine', 'colorful'],
    scenes: SCENES,
  },
  {
    id: '4',
    name: 'Beige Oversized Blazer',
    nameHe: 'בלייזר בז\' אוברסייז',
    brand: 'Mango',
    price: 449,
    category: 'outerwear',
    color: 'beige',
    colorHe: 'בז\'',
    imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop',
    description: 'Trendy oversized blazer for a chic look',
    descriptionHe: 'בלייזר אוברסייז טרנדי למראה שיק',
    tags: ['office', 'chic', 'trendy'],
    scenes: SCENES,
  },
  {
    id: '5',
    name: 'Navy Striped T-Shirt',
    nameHe: 'טישרט פסים כחול נייבי',
    brand: 'Gap',
    price: 149,
    category: 'top',
    color: 'navy',
    colorHe: 'כחול כהה',
    imageUrl: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=500&fit=crop',
    description: 'Classic Breton striped t-shirt',
    descriptionHe: 'טישרט פסים ברטוני קלאסי',
    tags: ['casual', 'nautical', 'classic'],
    scenes: SCENES,
  },
  {
    id: '6',
    name: 'Midi Leather Skirt',
    nameHe: 'חצאית עור מידי',
    brand: 'Zara',
    price: 329,
    category: 'bottom',
    color: 'black',
    colorHe: 'שחור',
    imageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&h=500&fit=crop',
    description: 'Sleek midi leather skirt, edgy and elegant',
    descriptionHe: 'חצאית עור מידי חלקה, אלגנטית ואדג\'ית',
    tags: ['evening', 'edgy', 'chic'],
    scenes: SCENES,
  },
  {
    id: '7',
    name: 'Olive Cargo Pants',
    nameHe: 'מכנסי קארגו ירוק זית',
    brand: 'Pull&Bear',
    price: 249,
    category: 'bottom',
    color: 'olive',
    colorHe: 'ירוק זית',
    imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=500&fit=crop',
    description: 'Trendy cargo pants with multiple pockets',
    descriptionHe: 'מכנסי קארגו טרנדיים עם כיסים מרובים',
    tags: ['streetwear', 'trendy', 'casual'],
    scenes: SCENES,
  },
  {
    id: '8',
    name: 'White Sneakers',
    nameHe: 'סניקרס לבן',
    brand: 'Nike',
    price: 499,
    category: 'shoes',
    color: 'white',
    colorHe: 'לבן',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop',
    description: 'Clean white sneakers, goes with everything',
    descriptionHe: 'סניקרס לבן נקי, מתאים לכל דבר',
    tags: ['casual', 'sporty', 'versatile'],
    scenes: SCENES,
  },
  {
    id: '9',
    name: 'Knit Cream Sweater',
    nameHe: 'סוודר קרם סרוג',
    brand: 'COS',
    price: 399,
    category: 'top',
    color: 'cream',
    colorHe: 'קרם',
    imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=500&fit=crop',
    description: 'Cozy knit sweater in warm cream tone',
    descriptionHe: 'סוודר סרוג חמים בגוון קרם',
    tags: ['cozy', 'winter', 'minimalist'],
    scenes: SCENES,
  },
  {
    id: '10',
    name: 'Denim Jacket',
    nameHe: 'ג\'קט ג\'ינס',
    brand: 'Levis',
    price: 499,
    category: 'outerwear',
    color: 'blue',
    colorHe: 'כחול',
    imageUrl: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400&h=500&fit=crop',
    description: 'Classic denim jacket, a wardrobe essential',
    descriptionHe: 'ג\'קט ג\'ינס קלאסי, חובה בארון',
    tags: ['casual', 'classic', 'layering'],
    scenes: SCENES,
  },
];
