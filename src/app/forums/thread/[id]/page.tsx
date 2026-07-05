"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { ForumPost, ForumThread, PublicUser } from "@/lib/localStore";
import { ArrowLeft, Eye, Loader2, MessageCircle, Reply } from "lucide-react";
import Link from "next/link";
import { FormEvent, use, useEffect, useState } from "react";

type ThreadPayload = { thread: ForumThread; posts: ForumPost[] };

function formatTime(ms: number): string {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(ms));
}

function PostCard({ post, index, isOriginalAuthor }: { post: ForumPost; index: number; isOriginalAuthor: boolean }) {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-48 bg-[#131314] border-r border-[#2a2a2e] p-5 flex md:flex-col items-center gap-4 md:gap-3">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 ${isOriginalAuthor ? "bg-teal-500/20 text-teal-400" : "bg-[#1a1a1c] text-[#a0a0a8]"}`}>
            {post.authorName.charAt(0).toUpperCase()}
          </div>
          <div className="md:text-center min-w-0">
            <p className={`font-semibold text-sm ${isOriginalAuthor ? "text-teal-400" : "text-white"}`}>
              {post.authorName}{isOriginalAuthor && <span className="ml-1 text-xs text-teal-500">(OP)</span>}
            </p>
            <p className="text-xs text-[#6b6b72]">Member</p>
          </div>
        </div>

        <div className="flex-1">
          <div className="px-5 py-3 border-b border-[#2a2a2e] flex items-center justify-between">
            <span className="text-xs text-[#6b6b72]">{formatTime(post.createdAt)}</span>
            <span className="text-xs text-[#6b6b72]">#{index + 1}</span>
          </div>
          <div className="px-5 py-4 text-sm text-[#a0a0a8] leading-relaxed whitespace-pre-wrap min-h-28">{post.content}</div>
          <div className="px-5 py-3 border-t border-[#2a2a2e] flex justify-end">
            <span className="flex items-center gap-2 text-xs text-[#6b6b72]"><Reply size={14} /> Reply</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [payload, setPayload] = useState<ThreadPayload | null>(null);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [posting, setPosting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [threadResponse, meResponse] = await Promise.all([
        fetch(`/api/forums/threads/${encodeURIComponent(id)}`),
        fetch("/api/auth/me"),
      ]);
      const meJson = await meResponse.json();
      setUser(meJson.user ?? null);
      if (threadResponse.ok) {
        const threadJson = await threadResponse.json();
        setPayload(threadJson);
      } else {
        setPayload(null);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function submitReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (reply.trim().length < 2) return setError("Reply cannot be empty.");
    setPosting(true);
    try {
      const response = await fetch(`/api/forums/threads/${encodeURIComponent(id)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: reply }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Could not post reply.");
      setReply("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post reply.");
    } finally {
      setPosting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-16">
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 py-24 text-center text-[#6b6b72]"><Loader2 className="animate-spin mx-auto mb-3" />Loading thread...</div>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="min-h-screen pt-16">
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 py-24 text-center">
          <MessageCircle className="mx-auto text-[#6b6b72] mb-4" />
          <h1 className="text-2xl font-bold mb-2">Thread not found</h1>
          <p className="text-sm text-[#6b6b72] mb-6">This thread does not exist in the database.</p>
          <Link href="/forums" className="btn-accent">Back to Forums</Link>
        </div>
      </div>
    );
  }

  const { thread, posts } = payload;

  return (
    <div className="min-h-screen pt-16">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 text-xs text-[#6b6b72] mb-6">
          <Link href="/" className="hover:text-teal-400 transition-colors">Home</Link>
          <span>&gt;</span>
          <Link href="/forums" className="hover:text-teal-400 transition-colors">Forums</Link>
          <span>&gt;</span>
          <Link href={`/forums/${thread.categorySlug}`} className="hover:text-teal-400 transition-colors capitalize">{thread.categorySlug.replace(/-/g, " ")}</Link>
          <span>&gt;</span>
          <span className="text-white truncate">{thread.title}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href={`/forums/${thread.categorySlug}`} className="text-[#6b6b72] hover:text-white transition-colors"><ArrowLeft size={20} /></Link>
            <h1 className="text-xl md:text-2xl font-bold truncate">{thread.title}</h1>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#6b6b72]">
            <span className="flex items-center gap-1"><MessageCircle size={14} />{thread.replies} replies</span>
            <span className="flex items-center gap-1"><Eye size={14} />{thread.views} views</span>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {posts.map((post, index) => <PostCard key={post.id} post={post} index={index} isOriginalAuthor={post.authorId === thread.authorId} />)}
        </div>

        {user ? (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Post a reply</h3>
            <form onSubmit={submitReply}>
              <textarea value={reply} onChange={(e) => setReply(e.target.value)} className="w-full h-32 bg-[#131314] border border-[#2a2a2e] rounded-lg px-4 py-3 text-sm text-white placeholder-[#6b6b72] resize-none focus:border-teal-500/50 outline-none transition-colors" placeholder="Write your reply..." />
              {error && <p className="text-sm text-red-300 mt-3">{error}</p>}
              <div className="flex justify-end mt-4">
                <button disabled={posting} className="btn-accent text-sm disabled:opacity-60">
                  {posting && <Loader2 size={16} className="animate-spin" />}
                  <MessageCircle size={16} /> Post Reply
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="card text-center">
            <p className="text-sm text-[#6b6b72] mb-4">Log in to join the discussion.</p>
            <Link href="/account" className="btn-accent text-sm">Log in</Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
