import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const SESSION_LENGTH_MS = 1000 * 60 * 60 * 24 * 30;

function publicUser(user: {
  _id: string;
  username: string;
  email?: string;
  createdAt: number;
}) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export const register = mutation({
  args: {
    username: v.string(),
    email: v.optional(v.string()),
    passwordHash: v.string(),
    ipHash: v.string(),
    sessionTokenHash: v.string(),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const username = args.username.trim();
    if (username.length < 4) throw new Error("Username must be at least 4 letters long.");

    const usernameLower = username.toLowerCase();
    const existingUsername = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("usernameLower", usernameLower))
      .first();
    if (existingUsername) throw new Error("That username is already taken.");

    const existingIp = await ctx.db.query("users").withIndex("by_ip", (q) => q.eq("ipHash", args.ipHash)).first();
    if (existingIp) throw new Error("An account already exists for this network. Alt accounts are not allowed.");

    const userId = await ctx.db.insert("users", {
      username,
      usernameLower,
      email: args.email,
      passwordHash: args.passwordHash,
      ipHash: args.ipHash,
      createdAt: args.now,
    });

    await ctx.db.insert("sessions", {
      userId,
      tokenHash: args.sessionTokenHash,
      createdAt: args.now,
      expiresAt: args.now + SESSION_LENGTH_MS,
    });

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Unable to create account.");
    return publicUser(user);
  },
});

export const login = mutation({
  args: {
    username: v.string(),
    passwordHash: v.string(),
    sessionTokenHash: v.string(),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("usernameLower", args.username.trim().toLowerCase()))
      .first();

    if (!user || user.passwordHash !== args.passwordHash) {
      throw new Error("Invalid username or password.");
    }

    await ctx.db.insert("sessions", {
      userId: user._id,
      tokenHash: args.sessionTokenHash,
      createdAt: args.now,
      expiresAt: args.now + SESSION_LENGTH_MS,
    });

    return publicUser(user);
  },
});

export const me = query({
  args: { tokenHash: v.string(), now: v.number() },
  handler: async (ctx, args) => {
    const session = await ctx.db.query("sessions").withIndex("by_token", (q) => q.eq("tokenHash", args.tokenHash)).first();
    if (!session || session.expiresAt <= args.now) return null;
    const user = await ctx.db.get(session.userId);
    return user ? publicUser(user) : null;
  },
});

export const logout = mutation({
  args: { tokenHash: v.string() },
  handler: async (ctx, args) => {
    const sessions = await ctx.db.query("sessions").withIndex("by_token", (q) => q.eq("tokenHash", args.tokenHash)).collect();
    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }
    return { ok: true };
  },
});
