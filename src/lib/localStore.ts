import { defaultChangelogs } from "@/lib/products";

export type AppUser = {
  id: string;
  username: string;
  email?: string;
  ipHash: string;
  createdAt: number;
};

export type PublicUser = Omit<AppUser, "ipHash">;

type StoredUser = AppUser & { usernameLower: string; passwordHash: string };

type Session = {
  tokenHash: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
};

export type ForumCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  section: string;
  order: number;
  threadsCount: number;
  messagesCount: number;
  lastThread?: ForumThread;
  createdAt: number;
};

export type ForumThread = {
  id: string;
  categorySlug: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  views: number;
  replies: number;
  createdAt: number;
  updatedAt: number;
  lastPostAt: number;
  isPinned: boolean;
  isLocked: boolean;
};

export type ForumPost = {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: number;
};

export type Changelog = {
  id: string;
  productSlug: string;
  productName: string;
  version: string;
  content: string[];
  createdAt: number;
};

type Store = {
  users: StoredUser[];
  sessions: Session[];
  categories: Omit<ForumCategory, "threadsCount" | "messagesCount" | "lastThread">[];
  threads: ForumThread[];
  posts: ForumPost[];
  changelogs: Changelog[];
  counters: Record<string, number>;
};

const DEFAULT_CATEGORIES: Store["categories"] = [
  {
    id: "cat-announcements",
    name: "Announcements",
    slug: "announcements",
    description: "Official news, releases, and staff updates for Cigar v4.",
    section: "Official",
    order: 1,
    createdAt: Date.now(),
  },
  {
    id: "cat-general",
    name: "General Discussion",
    slug: "general",
    description: "Talk about Cigar, Minecraft practice, and module setups.",
    section: "Discussion",
    order: 2,
    createdAt: Date.now(),
  },
  {
    id: "cat-settings",
    name: "Settings",
    slug: "settings",
    description: "Share configs, binds, HUD layouts, and module settings.",
    section: "Discussion",
    order: 3,
    createdAt: Date.now(),
  },
  {
    id: "cat-off-topic",
    name: "Off Topic",
    slug: "off-topic",
    description: "Anything that does not fit the main Cigar discussions.",
    section: "Discussion",
    order: 4,
    createdAt: Date.now(),
  },
  {
    id: "cat-suggestions",
    name: "Feature Requests",
    slug: "feature-requests",
    description: "Suggest modules, bypass improvements, and quality-of-life ideas.",
    section: "Suggestions",
    order: 5,
    createdAt: Date.now(),
  },
];

const globalForStore = globalThis as typeof globalThis & { __cigarStore?: Store };

function makeStore(): Store {
  return {
    users: [],
    sessions: [],
    categories: [...DEFAULT_CATEGORIES],
    threads: [],
    posts: [],
    changelogs: defaultChangelogs,
    counters: {},
  };
}

function store(): Store {
  globalForStore.__cigarStore ??= makeStore();
  return globalForStore.__cigarStore;
}

function nextId(prefix: string): string {
  const s = store();
  s.counters[prefix] = (s.counters[prefix] ?? 0) + 1;
  return `${prefix}-${s.counters[prefix]}`;
}

function publicUser(user: StoredUser | AppUser): PublicUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
  };
}

function getUserByToken(tokenHash: string, now = Date.now()): StoredUser | null {
  const s = store();
  const session = s.sessions.find((item) => item.tokenHash === tokenHash && item.expiresAt > now);
  if (!session) return null;
  return s.users.find((user) => user.id === session.userId) ?? null;
}

export const localStore = {
  register(args: { username: string; email?: string; passwordHash: string; ipHash: string; sessionTokenHash: string; now: number }) {
    const s = store();
    const usernameLower = args.username.toLowerCase();
    if (s.users.some((user) => user.usernameLower === usernameLower)) {
      throw new Error("That username is already taken.");
    }
    if (s.users.some((user) => user.ipHash === args.ipHash)) {
      throw new Error("An account already exists for this network. Alt accounts are not allowed.");
    }

    const user: StoredUser = {
      id: nextId("user"),
      username: args.username,
      usernameLower,
      email: args.email,
      passwordHash: args.passwordHash,
      ipHash: args.ipHash,
      createdAt: args.now,
    };
    s.users.push(user);
    s.sessions.push({
      tokenHash: args.sessionTokenHash,
      userId: user.id,
      createdAt: args.now,
      expiresAt: args.now + 1000 * 60 * 60 * 24 * 30,
    });
    return publicUser(user);
  },

  login(args: { username: string; passwordHash: string; sessionTokenHash: string; now: number }) {
    const s = store();
    const user = s.users.find((item) => item.usernameLower === args.username.toLowerCase());
    if (!user || user.passwordHash !== args.passwordHash) {
      throw new Error("Invalid username or password.");
    }
    s.sessions.push({
      tokenHash: args.sessionTokenHash,
      userId: user.id,
      createdAt: args.now,
      expiresAt: args.now + 1000 * 60 * 60 * 24 * 30,
    });
    return publicUser(user);
  },

  me(tokenHash: string | undefined) {
    if (!tokenHash) return null;
    const user = getUserByToken(tokenHash);
    return user ? publicUser(user) : null;
  },

  logout(tokenHash: string | undefined) {
    if (!tokenHash) return { ok: true };
    const s = store();
    s.sessions = s.sessions.filter((session) => session.tokenHash !== tokenHash);
    return { ok: true };
  },

  listCategories(): ForumCategory[] {
    const s = store();
    return s.categories
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((category) => {
        const threads = s.threads.filter((thread) => thread.categorySlug === category.slug);
        const lastThread = threads.slice().sort((a, b) => b.lastPostAt - a.lastPostAt)[0];
        const messagesCount = threads.length + s.posts.filter((post) => threads.some((thread) => thread.id === post.threadId)).length;
        return {
          ...category,
          threadsCount: threads.length,
          messagesCount,
          lastThread,
        };
      });
  },

  createCategory(args: { tokenHash: string; name: string; slug: string; description: string; section: string; now: number }) {
    const user = getUserByToken(args.tokenHash, args.now);
    if (!user) throw new Error("You must be logged in to create a channel.");
    const s = store();
    if (s.categories.some((category) => category.slug === args.slug)) {
      throw new Error("A channel with that slug already exists.");
    }
    const category = {
      id: nextId("cat"),
      name: args.name,
      slug: args.slug,
      description: args.description,
      section: args.section,
      order: s.categories.length + 1,
      createdAt: args.now,
    };
    s.categories.push(category);
    return category;
  },

  listThreads(args: { categorySlug?: string; limit?: number } = {}) {
    const s = store();
    let threads = s.threads.slice().sort((a, b) => b.lastPostAt - a.lastPostAt);
    if (args.categorySlug) threads = threads.filter((thread) => thread.categorySlug === args.categorySlug);
    if (args.limit) threads = threads.slice(0, args.limit);
    return threads;
  },

  createThread(args: { tokenHash: string; categorySlug: string; title: string; content: string; now: number }) {
    const user = getUserByToken(args.tokenHash, args.now);
    if (!user) throw new Error("You must be logged in to post a thread.");
    const s = store();
    if (!s.categories.some((category) => category.slug === args.categorySlug)) throw new Error("Channel not found.");
    const thread: ForumThread = {
      id: nextId("thread"),
      categorySlug: args.categorySlug,
      title: args.title,
      content: args.content,
      authorId: user.id,
      authorName: user.username,
      views: 0,
      replies: 0,
      createdAt: args.now,
      updatedAt: args.now,
      lastPostAt: args.now,
      isPinned: false,
      isLocked: false,
    };
    s.threads.push(thread);
    s.posts.push({
      id: nextId("post"),
      threadId: thread.id,
      authorId: user.id,
      authorName: user.username,
      content: args.content,
      createdAt: args.now,
    });
    return thread;
  },

  getThread(threadId: string) {
    const s = store();
    const thread = s.threads.find((item) => item.id === threadId);
    if (!thread) return null;
    thread.views += 1;
    return {
      thread,
      posts: s.posts.filter((post) => post.threadId === threadId).sort((a, b) => a.createdAt - b.createdAt),
    };
  },

  createPost(args: { tokenHash: string; threadId: string; content: string; now: number }) {
    const user = getUserByToken(args.tokenHash, args.now);
    if (!user) throw new Error("You must be logged in to reply.");
    const s = store();
    const thread = s.threads.find((item) => item.id === args.threadId);
    if (!thread) throw new Error("Thread not found.");
    if (thread.isLocked) throw new Error("This thread is locked.");
    const post: ForumPost = {
      id: nextId("post"),
      threadId: args.threadId,
      authorId: user.id,
      authorName: user.username,
      content: args.content,
      createdAt: args.now,
    };
    s.posts.push(post);
    thread.replies += 1;
    thread.updatedAt = args.now;
    thread.lastPostAt = args.now;
    return post;
  },

  listChangelogs(): Changelog[] {
    return store().changelogs.slice().sort((a, b) => b.createdAt - a.createdAt);
  },
};
