"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { ForumCategory, ForumThread, PublicUser } from "@/lib/localStore";
import { FileText, Loader2, MessageCircle, Plus, Search, Users } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

function formatNumber(num: number): string {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatTime(ms: number): string {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(ms));
}

function CategoryRow({ category }: { category: ForumCategory }) {
  return (
    <Link href={`/forums/${category.slug}`} className="flex items-center justify-between px-5 py-4 hover:bg-[#1a1a1c]/50 transition-colors group">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="w-10 h-10 bg-[#1a1a1c] border border-[#2a2a2e] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:border-teal-500/30 transition-colors">
          <MessageCircle size={18} className="text-[#6b6b72] group-hover:text-teal-400 transition-colors" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-teal-400 group-hover:underline">{category.name}</h3>
          <p className="text-xs text-[#6b6b72] mt-0.5 line-clamp-1">{category.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-center hidden sm:block">
          <p className="text-sm font-semibold text-white">{formatNumber(category.threadsCount)}</p>
          <p className="text-xs text-[#6b6b72]">Threads</p>
        </div>
        <div className="text-center hidden sm:block">
          <p className="text-sm font-semibold text-white">{formatNumber(category.messagesCount)}</p>
          <p className="text-xs text-[#6b6b72]">Messages</p>
        </div>
        <div className="hidden lg:block min-w-[220px]">
          {category.lastThread ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#1a1a1c] border border-[#2a2a2e] rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                {category.lastThread.authorName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm text-teal-400 truncate">{category.lastThread.title}</p>
                <p className="text-xs text-[#6b6b72]">{formatTime(category.lastThread.lastPostAt)} · {category.lastThread.authorName}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#6b6b72]">No threads yet</p>
          )}
        </div>
      </div>
    </Link>
  );
}

function CreateChannelForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [section, setSection] = useState("Community");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/forums/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, section }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Could not create channel.");
      setName("");
      setDescription("");
      setOpen(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create channel.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-ghost text-sm border border-[#2a2a2e]">
        <Plus size={16} /> Create channel
      </button>
    );
  }

  return (
    <div className="card mb-6">
      <h2 className="text-lg font-semibold mb-4">Create channel</h2>
      <form onSubmit={submit} className="space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} required minLength={3} placeholder="Channel name" className="w-full bg-[#131314] border border-[#2a2a2e] rounded-lg px-4 py-3 text-sm outline-none focus:border-teal-500/50" />
        <input value={section} onChange={(e) => setSection(e.target.value)} placeholder="Section" className="w-full bg-[#131314] border border-[#2a2a2e] rounded-lg px-4 py-3 text-sm outline-none focus:border-teal-500/50" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full bg-[#131314] border border-[#2a2a2e] rounded-lg px-4 py-3 text-sm outline-none focus:border-teal-500/50 resize-none h-24" />
        {error && <p className="text-sm text-red-300">{error}</p>}
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => setOpen(false)} className="btn-ghost text-sm">Cancel</button>
          <button disabled={loading} className="btn-accent text-sm disabled:opacity-60">
            {loading && <Loader2 size={16} className="animate-spin" />} Create
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ForumsPage() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [latestThreads, setLatestThreads] = useState<ForumThread[]>([]);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [categoriesResponse, latestResponse, meResponse] = await Promise.all([
        fetch("/api/forums/categories"),
        fetch("/api/forums/threads?limit=5"),
        fetch("/api/auth/me"),
      ]);
      const categoriesJson = await categoriesResponse.json();
      const latestJson = await latestResponse.json();
      const meJson = await meResponse.json();
      setCategories(categoriesJson.categories ?? []);
      setLatestThreads(latestJson.threads ?? []);
      setUser(meJson.user ?? null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const grouped = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = query ? categories.filter((category) => category.name.toLowerCase().includes(query) || category.description.toLowerCase().includes(query)) : categories;
    return filtered.reduce<Record<string, ForumCategory[]>>((acc, category) => {
      acc[category.section] ??= [];
      acc[category.section].push(category);
      return acc;
    }, {});
  }, [categories, search]);

  const totalThreads = categories.reduce((sum, category) => sum + category.threadsCount, 0);
  const totalMessages = categories.reduce((sum, category) => sum + category.messagesCount, 0);

  return (
    <div className="min-h-screen pt-16">
      <Navbar />

      <div className="bg-[#131314] border-b border-[#2a2a2e]">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <nav className="flex items-center gap-2 text-xs text-[#6b6b72] mb-2">
                <Link href="/" className="hover:text-teal-400 transition-colors">Home</Link>
                <span>&gt;</span>
                <span className="text-white">Forums</span>
              </nav>
              <h1 className="text-2xl font-bold">Cigar Forums</h1>
              <p className="text-sm text-[#6b6b72] mt-1">Live community channels powered by your database.</p>
            </div>
            <Link href={user ? "/forums/general" : "/account"} className="btn-accent text-sm">
              <FileText size={16} />
              {user ? "New post" : "Log in to post"}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {user && <CreateChannelForm onCreated={load} />}

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            {loading ? (
              <div className="card text-center py-16 text-[#6b6b72]">
                <Loader2 className="animate-spin mx-auto mb-3" /> Loading forums...
              </div>
            ) : Object.keys(grouped).length ? (
              Object.entries(grouped).map(([section, items]) => (
                <div key={section} className="card p-0 overflow-hidden">
                  <div className="px-5 py-3 bg-[#131314] border-b border-[#2a2a2e]">
                    <h2 className="text-sm font-semibold text-[#a0a0a8] uppercase tracking-wider">{section}</h2>
                  </div>
                  <div className="divide-y divide-[#2a2a2e]">
                    {items.map((category) => <CategoryRow key={category.slug} category={category} />)}
                  </div>
                </div>
              ))
            ) : (
              <div className="card text-center py-16">
                <MessageCircle className="mx-auto text-[#6b6b72] mb-4" />
                <h2 className="font-semibold mb-2">No channels found</h2>
                <p className="text-sm text-[#6b6b72]">Try another search or create a new channel after logging in.</p>
              </div>
            )}
          </div>

          <aside className="w-full lg:w-80 space-y-6">
            <div className="card">
              <div className="flex items-center gap-2 bg-[#131314] border border-[#2a2a2e] rounded-lg px-3 py-2 focus-within:border-teal-500/50 transition-colors">
                <Search size={16} className="text-[#6b6b72]" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} type="text" placeholder="Search channels..." className="bg-transparent text-sm text-white placeholder-[#6b6b72] outline-none w-full" />
              </div>
            </div>

            <div className="card p-0 overflow-hidden">
              <div className="px-5 py-3 bg-[#131314] border-b border-[#2a2a2e]">
                <h2 className="text-sm font-semibold text-[#a0a0a8] uppercase tracking-wider">Latest posts</h2>
              </div>
              <div className="divide-y divide-[#2a2a2e]">
                {latestThreads.length ? latestThreads.map((thread) => (
                  <Link key={thread.id} href={`/forums/thread/${thread.id}`} className="px-5 py-3 hover:bg-[#1a1a1c]/50 transition-colors block">
                    <p className="text-sm font-medium text-teal-400 hover:underline truncate">{thread.title}</p>
                    <p className="text-xs text-[#6b6b72] mt-0.5">Latest: {thread.authorName} · {formatTime(thread.lastPostAt)}</p>
                    <p className="text-xs text-[#6b6b72]">{thread.replies} replies · {thread.views} views</p>
                  </Link>
                )) : (
                  <div className="px-5 py-6 text-sm text-[#6b6b72]">No real posts yet. Be the first to create a thread.</div>
                )}
              </div>
            </div>

            <div className="card">
              <h2 className="text-sm font-semibold text-[#a0a0a8] uppercase tracking-wider mb-4">Forum statistics</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-sm text-[#6b6b72]">Channels</span><span className="text-sm font-semibold text-white">{categories.length}</span></div>
                <div className="flex items-center justify-between"><span className="text-sm text-[#6b6b72]">Threads</span><span className="text-sm font-semibold text-white">{totalThreads}</span></div>
                <div className="flex items-center justify-between"><span className="text-sm text-[#6b6b72]">Messages</span><span className="text-sm font-semibold text-white">{totalMessages}</span></div>
                <div className="flex items-center justify-between"><span className="text-sm text-[#6b6b72]">Status</span><span className="text-sm font-semibold text-teal-400 flex items-center gap-1"><Users size={14} /> Live</span></div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
