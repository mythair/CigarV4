import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    usernameLower: v.string(),
    email: v.optional(v.string()),
    passwordHash: v.string(),
    ipHash: v.string(),
    createdAt: v.number(),
  })
    .index("by_username", ["usernameLower"])
    .index("by_ip", ["ipHash"]),

  sessions: defineTable({
    userId: v.id("users"),
    tokenHash: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
  }).index("by_token", ["tokenHash"]),

  forumCategories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    section: v.string(),
    order: v.number(),
    createdBy: v.optional(v.id("users")),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_section", ["section"]),

  forumThreads: defineTable({
    categorySlug: v.string(),
    title: v.string(),
    content: v.string(),
    authorId: v.id("users"),
    authorName: v.string(),
    views: v.number(),
    replies: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastPostAt: v.number(),
    isPinned: v.boolean(),
    isLocked: v.boolean(),
  })
    .index("by_category", ["categorySlug", "lastPostAt"])
    .index("by_last_post", ["lastPostAt"]),

  forumPosts: defineTable({
    threadId: v.id("forumThreads"),
    authorId: v.id("users"),
    authorName: v.string(),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_thread", ["threadId", "createdAt"]),

  changelogs: defineTable({
    productSlug: v.string(),
    productName: v.string(),
    version: v.string(),
    content: v.array(v.string()),
    createdAt: v.number(),
  })
    .index("by_product", ["productSlug", "createdAt"])
    .index("by_created", ["createdAt"]),
});
