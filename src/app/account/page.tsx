"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { products } from "@/lib/products";
import type { Changelog, PublicUser } from "@/lib/localStore";
import { Check, ChevronDown, ChevronUp, Download, Key, Loader2, Lock, Shield, UserPlus } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type AuthMode = "login" | "register";
type AccountTab = "account" | "products" | "subscriptions";

function formatDate(ms: number) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(ms));
}

function ProductCard({ product }: { product: (typeof products)[number] }) {
  const [showFeatures, setShowFeatures] = useState(false);
  const [acquired, setAcquired] = useState(false);

  return (
    <div className="card group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-500/10 rounded-lg flex items-center justify-center">
            <Shield className="text-teal-400" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-white">{product.name}</h3>
            <span className="text-xs text-[#6b6b72]">Minecraft {product.minecraftVersion}</span>
          </div>
        </div>
        {acquired ? (
          <div className="flex items-center gap-1 text-teal-400 text-sm font-medium">
            <Check size={16} />
            Acquired
          </div>
        ) : (
          <span className="text-xs text-[#6b6b72]">Not acquired</span>
        )}
      </div>

      <p className="text-sm text-[#6b6b72] mb-4">{product.description}</p>

      <button
        onClick={() => setShowFeatures(!showFeatures)}
        className="flex items-center gap-2 text-sm text-[#a0a0a8] hover:text-white mb-4 transition-colors"
      >
        {showFeatures ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {showFeatures ? "Hide modules" : "View modules"}
      </button>

      {showFeatures && (
        <div className="grid grid-cols-2 gap-2 mb-4 animate-slide-up">
          {product.features.map((feature) => (
            <div key={feature} className="text-xs text-[#a0a0a8] bg-[#1a1a1c] px-3 py-1.5 rounded-md flex items-center gap-2">
              <Check size={12} className="text-teal-500 flex-shrink-0" />
              {feature}
            </div>
          ))}
        </div>
      )}

      {acquired ? (
        <button className="btn-ghost w-full text-sm">
          <Download size={16} />
          Download
        </button>
      ) : (
        <button onClick={() => setAcquired(true)} className="btn-accent w-full text-sm">
          Get
        </button>
      )}
    </div>
  );
}

function AuthPanel({ onAuthed }: { onAuthed: (user: PublicUser) => void }) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (username.trim().length < 4) return setError("Username must be at least 4 letters long.");
    if (password.length < 6) return setError("Password must be at least 6 characters long.");

    setLoading(true);
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email: mode === "register" ? email : undefined, password }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Authentication failed.");
      onAuthed(json.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#1a1a1c] border border-[#2a2a2e] rounded-full flex items-center justify-center mx-auto mb-4">
          {mode === "login" ? <Lock className="text-teal-400" size={24} /> : <UserPlus className="text-teal-400" size={24} />}
        </div>
        <h1 className="text-2xl font-bold mb-1">{mode === "login" ? "Log in" : "Create account"}</h1>
        <p className="text-sm text-[#6b6b72]">
          Log in before accessing Cigar products, changelogs, and forum posting.
        </p>
      </div>

      <div className="card">
        <div className="grid grid-cols-2 gap-1 bg-[#131314] rounded-lg p-1 mb-6">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === "login" ? "bg-[#1a1a1c] text-white" : "text-[#6b6b72] hover:text-white"}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === "register" ? "bg-[#1a1a1c] text-white" : "text-[#6b6b72] hover:text-white"}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-xs text-[#a0a0a8] mb-2 block">Username</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              minLength={4}
              required
              className="w-full bg-[#131314] border border-[#2a2a2e] rounded-lg px-4 py-3 text-sm text-white placeholder-[#6b6b72] outline-none focus:border-teal-500/50 transition-colors"
              placeholder="Minimum 4 letters"
            />
          </label>

          {mode === "register" && (
            <label className="block">
              <span className="text-xs text-[#a0a0a8] mb-2 block">Email <span className="text-[#6b6b72]">optional</span></span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                className="w-full bg-[#131314] border border-[#2a2a2e] rounded-lg px-4 py-3 text-sm text-white placeholder-[#6b6b72] outline-none focus:border-teal-500/50 transition-colors"
                placeholder="you@example.com"
              />
            </label>
          )}

          <label className="block">
            <span className="text-xs text-[#a0a0a8] mb-2 block">Password</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
              type="password"
              className="w-full bg-[#131314] border border-[#2a2a2e] rounded-lg px-4 py-3 text-sm text-white placeholder-[#6b6b72] outline-none focus:border-teal-500/50 transition-colors"
              placeholder="Minimum 6 characters"
            />
          </label>

          {mode === "register" && (
            <p className="text-xs text-[#6b6b72] leading-relaxed">
              One account is allowed per network/IP hash to reduce alt accounts.
            </p>
          )}

          {error && <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</div>}

          <button disabled={loading} className="btn-accent w-full py-3 disabled:opacity-60 disabled:cursor-not-allowed">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AccountTab>("products");
  const [changelogs, setChangelogs] = useState<Changelog[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [meResponse, changelogResponse] = await Promise.all([fetch("/api/auth/me"), fetch("/api/changelogs")]);
        const meJson = await meResponse.json();
        const changelogJson = await changelogResponse.json();
        setUser(meJson.user ?? null);
        setChangelogs(changelogJson.changelogs ?? []);
      } finally {
        setAuthLoading(false);
      }
    }
    load();
  }, []);

  const groupedChangelogs = useMemo(() => changelogs, [changelogs]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }

  return (
    <div className="min-h-screen pt-16">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-12 min-h-[70vh]">
        {authLoading ? (
          <div className="flex items-center justify-center py-32 text-[#6b6b72]">
            <Loader2 className="animate-spin mr-2" size={18} /> Loading account...
          </div>
        ) : !user ? (
          <AuthPanel onAuthed={setUser} />
        ) : (
          <>
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-[#1a1a1c] border border-[#2a2a2e] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎮</span>
              </div>
              <h1 className="text-2xl font-bold mb-1">Account</h1>
              <p className="text-sm text-[#6b6b72]">Signed in as {user.username}. Manage Cigar products and changelogs.</p>
            </div>

            <div className="flex items-center justify-between mb-8 gap-4">
              <div className="flex items-center gap-1 bg-[#131314] rounded-lg p-1 overflow-x-auto">
                {(["account", "products", "subscriptions"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize whitespace-nowrap ${
                      activeTab === tab ? "bg-[#1a1a1c] text-white" : "text-[#6b6b72] hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <button onClick={logout} className="flex items-center gap-2 text-sm text-[#6b6b72] hover:text-white transition-colors">
                <Key size={14} />
                Logout
              </button>
            </div>

            {activeTab === "products" && (
              <div className="space-y-6">
                <div className="card">
                  <div className="mb-6 pb-6 border-b border-[#2a2a2e]">
                    <h2 className="text-lg font-semibold mb-1">Product information</h2>
                    <p className="text-sm text-[#6b6b72]">Current status of Cigar 1.8.9 products on your account.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h2 className="text-lg font-semibold mb-6">Product changelogs</h2>
                  {groupedChangelogs.length ? (
                    <div className="space-y-4">
                      {groupedChangelogs.map((changelog) => (
                        <details key={changelog.id} className="border border-[#2a2a2e] rounded-lg group">
                          <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#1a1a1c] rounded-lg transition-colors">
                            <div>
                              <span className="text-sm font-mono text-teal-400">{changelog.productName} v{changelog.version}</span>
                              <span className="ml-3 text-xs text-[#6b6b72]">{formatDate(changelog.createdAt)}</span>
                            </div>
                            <ChevronDown size={16} className="text-[#6b6b72] group-open:rotate-180 transition-transform" />
                          </summary>
                          <ul className="px-4 pb-4 space-y-2">
                            {changelog.content.map((change) => (
                              <li key={change} className="flex items-start gap-2 text-sm text-[#a0a0a8]">
                                <Check size={14} className="text-teal-500 mt-0.5 flex-shrink-0" />
                                {change}
                              </li>
                            ))}
                          </ul>
                        </details>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#6b6b72]">No changelogs have been posted yet.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "account" && (
              <div className="card">
                <h2 className="text-lg font-semibold mb-6">My account</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between py-3 border-b border-[#2a2a2e]">
                    <span className="text-sm text-[#6b6b72]">Username</span>
                    <span className="text-sm font-medium">{user.username}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-[#2a2a2e]">
                    <span className="text-sm text-[#6b6b72]">Email</span>
                    <span className="text-sm font-medium">{user.email || "Not set"}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-[#2a2a2e]">
                    <span className="text-sm text-[#6b6b72]">Joined</span>
                    <span className="text-sm font-medium">{formatDate(user.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-[#6b6b72]">Account Status</span>
                    <span className="text-sm font-medium text-teal-400">Active</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "subscriptions" && (
              <div className="card text-center py-16">
                <Shield className="mx-auto text-[#6b6b72] mb-4" size={32} />
                <h2 className="text-lg font-semibold mb-2">No subscriptions</h2>
                <p className="text-sm text-[#6b6b72] max-w-sm mx-auto">Cigar v4 is free. Use the Products tab and press Get.</p>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
