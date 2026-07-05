"use client";

import { ArrowRight, Shield, Zap, Eye, Sparkles, ChevronDown, Swords, Lock, Ghost, Star, Crown } from "lucide-react";
import { useState, useEffect } from "react";

function useInView(threshold = 0.1) {
  const [ref, setRef] = useState<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref);
        }
      },
      { threshold }
    );
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return [setRef, inView] as const;
}

function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const [ref, inView] = useInView(0.1);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${className}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(40px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

const modules = [
  { name: "AutoCrystal", icon: <Star size={20} />, desc: "Place crystals automatically with optimized calculations", category: "Combat" },
  { name: "KillAura", icon: <Swords size={20} />, desc: "Attack entities within range with customizable settings", category: "Combat" },
  { name: "Velocity", icon: <Zap size={20} />, desc: "Modify knockback and velocity for better movement", category: "Movement" },
  { name: "Speed", icon: <Zap size={20} />, desc: "Increase your movement speed significantly", category: "Movement" },
  { name: "Blink", icon: <Ghost size={20} />, desc: "Freeze your movement while still processing packets", category: "Exploit" },
  { name: "NoFall", icon: <Shield size={20} />, desc: "Take no fall damage from any height", category: "Player" },
  { name: "ChestStealer", icon: <Lock size={20} />, desc: "Automatically steal items from chests", category: "Player" },
  { name: "ESP", icon: <Eye size={20} />, desc: "See entities through walls with beautiful outlines", category: "Render" },
];

const features = [
  {
    icon: <Shield className="text-teal-400" size={24} />,
    title: "Undetected",
    desc: "Our advanced bypass technology keeps you safe on any server. We update constantly to stay ahead.",
  },
  {
    icon: <Sparkles className="text-teal-400" size={24} />,
    title: "150+ Modules",
    desc: "A comprehensive suite of modules for combat, movement, rendering, player, and world manipulation.",
  },
  {
    icon: <Crown className="text-teal-400" size={24} />,
    title: "100% Free",
    desc: "No paywalls, no subscriptions, no limitations. Cigar v4 is completely free to use for everyone.",
  },
];

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute w-[600px] h-[600px] bg-teal-600/10 rounded-full blur-[120px]"
            style={{
              top: "10%",
              right: "10%",
              transform: `translateY(${scrollY * 0.2}px)`,
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[100px]"
            style={{
              bottom: "20%",
              left: "5%",
              transform: `translateY(${scrollY * 0.1}px)`,
            }}
          />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a1c] border border-[#2a2a2e] rounded-full text-sm text-[#a0a0a8] mb-8">
              <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
              Now available — Free for everyone
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-6">
              <span className="text-gradient">Like tobacco</span>
              <br />
              <span className="text-gradient">for </span>
              <span className="text-accent-gradient">Minecraft.</span>
            </h1>

            <p className="text-[#6b6b72] text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
              Get an unfair advantage over your opponents, while remaining completely undetected.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/account" className="btn-accent text-base px-8 py-4">
                Get Now <ArrowRight size={18} />
              </a>
              <a href="#features" className="btn-ghost text-base px-8 py-4">
                Learn More <ChevronDown size={18} />
              </a>
            </div>
          </div>

          {/* Minecraft character placeholder */}
          <div className="relative mt-16 mb-8 animate-float">
            <div className="relative inline-block">
              <div className="w-48 h-48 md:w-64 md:h-64 bg-gradient-to-br from-teal-500/20 to-teal-600/10 rounded-3xl border border-teal-500/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-2">⚔️</div>
                  <div className="text-sm text-teal-400 font-medium">CIGAR v4</div>
                  <div className="text-xs text-[#6b6b72]">Powered Up</div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-teal-500 rounded-full blur-xl animate-pulse-glow" />
              <div className="absolute -bottom-2 -left-6 w-6 h-6 bg-teal-400/50 rounded-full blur-lg" />
              <div className="absolute top-1/2 -right-8 w-4 h-4 bg-teal-300/30 rounded-full blur-sm" />
              <div className="absolute top-1/4 -left-4 w-3 h-3 bg-teal-500/40 rounded-full blur-sm" />
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown size={24} className="text-[#6b6b72]" />
          </div>
        </div>
      </section>

      {/* Undetectable Ghost Modules Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#131314]/50 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 relative">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Undetectable <span className="text-teal-500">Ghost Modules</span>
              </h2>
              <p className="text-[#6b6b72] max-w-lg mx-auto">
                Built for practice servers. Bypass anywhere. Our modules are carefully crafted to fly under the radar.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {modules.map((mod, i) => (
              <AnimatedSection key={mod.name} delay={i * 80}>
                <div className="card group cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-teal-500/10 rounded-lg flex items-center justify-center text-teal-400 group-hover:bg-teal-500/20 transition-colors">
                      {mod.icon}
                    </div>
                    <span className="text-xs text-[#6b6b72] bg-[#1a1a1c] px-2 py-1 rounded-full">{mod.category}</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2 group-hover:text-teal-400 transition-colors">{mod.name}</h3>
                  <p className="text-sm text-[#6b6b72] leading-relaxed">{mod.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why <span className="text-teal-500">Cigar v4</span>?
              </h2>
              <p className="text-[#6b6b72] max-w-lg mx-auto">
                Everything you need to dominate on any server, completely free.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <AnimatedSection key={feature.title} delay={i * 120}>
                <div className="card text-center group h-full hover:-translate-y-2 transition-transform duration-300">
                  <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-[#6b6b72] text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-t border-b border-[#2a2a2e]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "150+", label: "Modules" },
              { value: "50K+", label: "Active Users" },
              { value: "99.9%", label: "Uptime" },
              { value: "24/7", label: "Support" },
            ].map((stat, i) => (
              <AnimatedSection key={stat.label} delay={i * 100}>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-black text-teal-500 mb-1">{stat.value}</div>
                  <div className="text-[#6b6b72] text-sm">{stat.label}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <AnimatedSection>
            <div className="card bg-gradient-to-br from-teal-600/10 to-teal-500/5 border-teal-500/20">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to get started?
              </h2>
              <p className="text-[#6b6b72] mb-8 max-w-lg mx-auto">
                Download Cigar v4 now and experience the power of a fully-featured Minecraft client. It's free, it's fast, and it's undetected.
              </p>
              <a href="/account" className="btn-accent text-base px-8 py-4 inline-flex">
                Get Cigar v4 <ArrowRight size={18} />
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
