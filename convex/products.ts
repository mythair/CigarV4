import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const DEFAULT_CHANGELOGS = [
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
    createdAt: 1765152000000,
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
    createdAt: 1764547200000,
  },
];

export const listChangelogs = query({
  args: {},
  handler: async (ctx) => {
    const changelogs = await ctx.db.query("changelogs").withIndex("by_created").order("desc").collect();
    if (!changelogs.length) return DEFAULT_CHANGELOGS;
    return changelogs.map((item) => ({
      id: item._id,
      productSlug: item.productSlug,
      productName: item.productName,
      version: item.version,
      content: item.content,
      createdAt: item.createdAt,
    }));
  },
});

export const addChangelog = mutation({
  args: {
    productSlug: v.string(),
    productName: v.string(),
    version: v.string(),
    content: v.array(v.string()),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("changelogs", args);
  },
});
