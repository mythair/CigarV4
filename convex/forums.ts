import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const DEFAULT_CATEGORIES = [
  {
    id: "cat-announcements",
    name: "Announcements",
    slug: "announcements",
    description: "Official news, releases, and staff updates for Cigar v4.",
    section: "Official",
    order: 1,
    createdAt: 0,
  },
  {
    id: "cat-general",
    name: "General Discussion",
    slug: "general",
    description: "Talk about Cigar, Minecraft practice, and module setups.",
    section: "Discussion",
    order: 2,
    createdAt: 0,
  },
  {
    id: "cat-settings",
    name: "Settings",
    slug: "settings",
    description: "Share configs, binds, HUD layouts, and module settings.",
    section: "Discussion",
    order: 3,
    createdAt: 0,
  },
  {
    id: "cat-off-topic",
    name: "Off Topic",
    slug: "off-topic",
    description: "Anything that does not fit the main Cigar discussions.",
    section: "Discussion",
    order: 4,
    createdAt: 0,
  },
  {
    id: "cat-suggestions",
    name: "Feature Requests",
    slug: "feature-requests",
    description: "Suggest modules, bypass improvements, and quality-of-life ideas.",
    section: "Suggestions",
    order: 5,
    createdAt: 0,
  },
];

async function getUserByToken(ctx: any, tokenHash: string, now: number) {
  const session = await ctx.db.query("sessions").withIndex("by_token", (q: any) => q.eq("tokenHash", tokenHash)).first();
  if (!session || session.expiresAt <= now) throw new Error("You must be logged in.");
  const user = await ctx.db.get(session.userId);
  if (!user) throw new Error("You must be logged in.");
  return user;
}

function threadPayload(thread: any) {
  return {
    id: thread._id,
    categorySlug: thread.categorySlug,
    title: thread.title,
    content: thread.content,
    authorId: thread.authorId,
    authorName: thread.authorName,
    views: thread.views,
    replies: thread.replies,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
    lastPostAt: thread.lastPostAt,
    isPinned: thread.isPinned,
    isLocked: thread.isLocked,
  };
}

function postPayload(post: any) {
  return {
    id: post._id,
    threadId: post.threadId,
    authorId: post.authorId,
    authorName: post.authorName,
    content: post.content,
    createdAt: post.createdAt,
  };
}

export const listCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("forumCategories").collect();
    const allThreads = await ctx.db.query("forumThreads").collect();
    const allPosts = await ctx.db.query("forumPosts").collect();
    const source = categories.length
      ? categories.map((category) => ({
          id: category._id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          section: category.section,
          order: category.order,
          createdAt: category.createdAt,
        }))
      : DEFAULT_CATEGORIES;

    return source
      .sort((a, b) => a.order - b.order)
      .map((category) => {
        const threads = allThreads.filter((thread) => thread.categorySlug === category.slug);
        const lastThread = threads.slice().sort((a, b) => b.lastPostAt - a.lastPostAt)[0];
        const messagesCount = threads.length + allPosts.filter((post) => threads.some((thread) => thread._id === post.threadId)).length;
        return {
          ...category,
          threadsCount: threads.length,
          messagesCount,
          lastThread: lastThread ? threadPayload(lastThread) : undefined,
        };
      });
  },
});

export const createCategory = mutation({
  args: {
    tokenHash: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    section: v.string(),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getUserByToken(ctx, args.tokenHash, args.now);
    const existing = await ctx.db.query("forumCategories").withIndex("by_slug", (q) => q.eq("slug", args.slug)).first();
    if (existing) throw new Error("A channel with that slug already exists.");
    const order = (await ctx.db.query("forumCategories").collect()).length + DEFAULT_CATEGORIES.length + 1;
    const id = await ctx.db.insert("forumCategories", {
      name: args.name,
      slug: args.slug,
      description: args.description,
      section: args.section,
      order,
      createdBy: user._id,
      createdAt: args.now,
    });
    const category = await ctx.db.get(id);
    return category ? { id: category._id, ...category } : null;
  },
});

export const listThreads = query({
  args: { categorySlug: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    let threads = args.categorySlug
      ? await ctx.db
          .query("forumThreads")
          .withIndex("by_category", (q) => q.eq("categorySlug", args.categorySlug!))
          .order("desc")
          .collect()
      : await ctx.db.query("forumThreads").withIndex("by_last_post").order("desc").collect();
    if (args.limit) threads = threads.slice(0, args.limit);
    return threads.map(threadPayload);
  },
});

export const createThread = mutation({
  args: {
    tokenHash: v.string(),
    categorySlug: v.string(),
    title: v.string(),
    content: v.string(),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getUserByToken(ctx, args.tokenHash, args.now);
    const customCategory = await ctx.db.query("forumCategories").withIndex("by_slug", (q) => q.eq("slug", args.categorySlug)).first();
    const isDefault = DEFAULT_CATEGORIES.some((category) => category.slug === args.categorySlug);
    if (!customCategory && !isDefault) throw new Error("Channel not found.");

    const threadId = await ctx.db.insert("forumThreads", {
      categorySlug: args.categorySlug,
      title: args.title,
      content: args.content,
      authorId: user._id,
      authorName: user.username,
      views: 0,
      replies: 0,
      createdAt: args.now,
      updatedAt: args.now,
      lastPostAt: args.now,
      isPinned: false,
      isLocked: false,
    });

    await ctx.db.insert("forumPosts", {
      threadId,
      authorId: user._id,
      authorName: user.username,
      content: args.content,
      createdAt: args.now,
    });

    const thread = await ctx.db.get(threadId);
    if (!thread) throw new Error("Unable to create thread.");
    return threadPayload(thread);
  },
});

export const getThread = mutation({
  args: { threadId: v.string() },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("forumThreads", args.threadId);
    if (!id) return null;
    const thread = await ctx.db.get(id);
    if (!thread) return null;
    await ctx.db.patch(id, { views: thread.views + 1 });
    const posts = await ctx.db.query("forumPosts").withIndex("by_thread", (q) => q.eq("threadId", id)).collect();
    return {
      thread: threadPayload({ ...thread, views: thread.views + 1 }),
      posts: posts.map(postPayload),
    };
  },
});

export const createPost = mutation({
  args: { tokenHash: v.string(), threadId: v.string(), content: v.string(), now: v.number() },
  handler: async (ctx, args) => {
    const user = await getUserByToken(ctx, args.tokenHash, args.now);
    const id = ctx.db.normalizeId("forumThreads", args.threadId);
    if (!id) throw new Error("Thread not found.");
    const thread = await ctx.db.get(id);
    if (!thread) throw new Error("Thread not found.");
    if (thread.isLocked) throw new Error("This thread is locked.");

    const postId = await ctx.db.insert("forumPosts", {
      threadId: id,
      authorId: user._id,
      authorName: user.username,
      content: args.content,
      createdAt: args.now,
    });

    await ctx.db.patch(id, {
      replies: thread.replies + 1,
      updatedAt: args.now,
      lastPostAt: args.now,
    });

    const post = await ctx.db.get(postId);
    if (!post) throw new Error("Unable to post reply.");
    return postPayload(post);
  },
});
