"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { ForumCategory, ForumThread, PublicUser } from "@/lib/localStore";
import { ArrowLeft, Eye, Loader2, MessageCircle, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, use, useEffect, useMemo, useState } from "react";

function formatTime(ms: number): string {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(ms));
}

function ThreadRow({ thread }: { thread: ForumThread }) {
  return (
    <Link href={`/forums/thread/${thread.id}`} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 hover:bg-[#1a1a1c]/50 transition-colors border-b border-[#2a2a2e] last:border-b-0 items-center group">
      <div className="md:col-span-7 flex items-center gap-3 min-w-0">
        {thread.isPinned && <span className="text-xs bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded flex-shrink-0">Pinned</span>}
        <MessageCircle size={16} className="text-[#6b6b72] flex-shrink-0 hidden md:block" />
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-white group-hover:text-teal-400 transition-colors truncate">{thread.title}</h3>
          <p className="text-xs text-[#6b6b72] mt-0.5">by <span className="text-[#a0a0a8]">{thread.authorName}</span> · {formatTime(thread.createdAt)}</p>
        </div>
      </div>
      <div className="md:col-span-2 flex md:block items-center justify-between text-center">
        <span className="text-xs text-[#6b6b72] md:hidden">Replies</span>
        <span className="text-sm font-medium text-white">{thread.replies}</span>
      </div>
      <div className="md:col-span-1 flex md:block items-center justify-between text-center">
        <span className="text-xs text-[#6b6b72] md:hidden">Views</span>
        <span className="text-sm font-medium text-white">{thread.views}</span>
      </div>
      <div className="md:col-span-2 text-right">
        <p className="text-xs text-[#6b6b72]">{formatTime(thread.lastPostAt)}</p>
      </div>
    </Link>
  );
}

function NewThreadForm({ categorySlug, onCreated }: { categorySlug: string; onCreated: (thread: ForumThread) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/forums/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categorySlug, title, content }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Could not create thread.");
      onCreated(json.thread);
      router.push(`/forums/thread/${json.thread.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create thread.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return <button onClick={() => setOpen(true)} className="btn-accent text-sm"><Plus size={16} /> New Thread</button>;
  }

  return (
    <div className="card mb-6">
      <h2 className="text-lg font-semibold mb-4">New thread</h2>
      <form onSubmit={submit} className="space-y-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} required minLength={5} placeholder="Thread title" className="w-full bg-[#131314] border border-[#2a2a2e] rounded-lg px-4 py-3 text-sm outline-none focus:border-teal-500/50" />
        <textarea value={content} onChange={(e) => setContent(e.target.value)} required minLength={10} placeholder="Write your first post..." className="w-full bg-[#131314] border border-[#2a2a2e] rounded-lg px-4 py-3 text-sm outline-none focus:border-teal-500/50 resize-none h-36" />
        {error && <p className="text-sm text-red-300">{error}</p>}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => setOpen(false)} className="btn-ghost text-sm">Cancel</button>
          <button disabled={loading} className="btn-accent text-sm disabled:opacity-60">{loading && <Loader2 size={16} className="animate-spin" />} Post Thread</button>
        </div>
      </form>
    </div>
  );
}

export default function ForumCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [threadsResponse, categoriesResponse, meResponse] = await Promise.all([
          fetch(`/api/forums/threads?categorySlug=${encodeURIComponent(slug)}`),
          fetch("/api/forums/categories"),
          fetch("/api/auth/me"),
        ]);
        const threadsJson = await threadsResponse.json();
        const categoriesJson = await categoriesResponse.json();
        const meJson = await meResponse.json();
        setThreads(threadsJson.threads ?? []);
        setCategories(categoriesJson.categories ?? []);
        setUser(meJson.user ?? null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const category = useMemo(() => categories.find((item) => item.slug === slug), [categories, slug]);
  const categoryName = category?.name ?? slug.replace(/-/g, " ");

  return (
    <div className="min-h-screen pt-16">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 text-xs text-[#6b6b72] mb-6">
          <Link href="/" className="hover:text-teal-400 transition-colors">Home</Link>
          <span>&gt;</span>
          <Link href="/forums" className="hover:text-teal-400 transition-colors">Forums</Link>
          <span>&gt;</span>
          <span className="text-white capitalize">{categoryName}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Link href="/forums" className="text-[#6b6b72] hover:text-white transition-colors"><ArrowLeft size={20} /></Link>
            <div>
              <h1 className="text-2xl font-bold capitalize">{categoryName}</h1>
              <p className="text-sm text-[#6b6b72]">{category?.description ?? "Community channel"}</p>
            </div>
          </div>
          {user ? <NewThreadForm categorySlug={slug} onCreated={(thread) => setThreads((prev) => [thread, ...prev])} /> : <Link href="/account" className="btn-accent text-sm">Log in to post</Link>}
        </div>

        {loading ? (
          <div className="card text-center py-16 text-[#6b6b72]"><Loader2 className="animate-spin mx-auto mb-3" />Loading threads...</div>
        ) : threads.length ? (
          <div className="card p-0 overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-[#131314] border-b border-[#2a2a2e] text-xs font-semibold text-[#6b6b72] uppercase tracking-wider">
              <div className="col-span-7">Thread</div>
              <div className="col-span-2 text-center">Replies</div>
              <div className="col-span-1 text-center">Views</div>
              <div className="col-span-2 text-right">Last Post</div>
            </div>
            {threads.map((thread) => <ThreadRow key={thread.id} thread={thread} />)}
          </div>
        ) : (
          <div className="card text-center py-16">
            <MessageCircle className="mx-auto text-[#6b6b72] mb-4" />
            <h2 className="font-semibold mb-2">No threads here yet</h2>
            <p className="text-sm text-[#6b6b72] mb-6">This channel is empty. Create the first real thread after logging in.</p>
            <div className="inline-flex items-center gap-2 text-xs text-[#6b6b72]"><Eye size={14} /> No fake posts are shown.</div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
