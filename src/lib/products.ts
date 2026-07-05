export type ProductInfo = {
  id: number;
  name: string;
  slug: string;
  description: string;
  minecraftVersion: string;
  version: string;
  features: string[];
  isAvailable: boolean;
};

export const products: ProductInfo[] = [
  {
    id: 1,
    name: "Cigar v4.17",
    slug: "cigar-v4-17",
    description: "A stable 1.8.9 build with the core Cigar combat and movement module set.",
    minecraftVersion: "1.8.9",
    version: "4.17",
    features: ["KillAura", "Velocity", "Speed", "ESP", "NoFall", "ChestStealer", "Scaffold", "1.8.9 modules"],
    isAvailable: true,
  },
  {
    id: 2,
    name: "Cigar v4.18",
    slug: "cigar-v4-18",
    description: "The newest 1.8.9 build with improved clutch logic and smoother module timing.",
    minecraftVersion: "1.8.9",
    version: "4.18",
    features: ["AutoCrystal", "KillAura", "Velocity", "Speed", "Blink", "Improved Clutch", "ESP", "1.8.9 modules"],
    isAvailable: true,
  },
];

export const defaultChangelogs = [
  {
    id: "default-cigar-v4-18-1",
    productSlug: "cigar-v4-18",
    productName: "Cigar v4.18",
    version: "4.18",
    content: [
      "Added improved clutch timing for safer bridge and block-save plays.",
      "Refined 1.8.9 combat module delays.",
      "Improved Velocity and Speed compatibility with practice servers.",
      "Polished HUD animations and module toggle feedback.",
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    id: "default-cigar-v4-17-1",
    productSlug: "cigar-v4-17",
    productName: "Cigar v4.17",
    version: "4.17",
    content: [
      "Stable 1.8.9 module base release.",
      "Updated ESP rendering and no-fall checks.",
      "Improved scaffold placement consistency.",
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
  },
];
