"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/forums", label: "Forums" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d0d0d]/80 backdrop-blur-xl border-b border-[#2a2a2e]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center font-black text-sm group-hover:bg-teal-500 transition-colors">
            C
          </div>
          <span className="text-xl font-bold tracking-tight">
            CIGAR<span className="text-teal-500"> v4</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                pathname === item.href
                  ? "text-white bg-[#1a1a1c]"
                  : "text-[#a0a0a8] hover:text-white hover:bg-[#1a1a1c]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/account"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#a0a0a8] hover:text-white transition-colors rounded-lg hover:bg-[#1a1a1c]"
          >
            <User size={16} />
            Account
          </Link>
          <Link href="/account" className="btn-accent text-sm">
            Get Now
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-[#a0a0a8] hover:text-white p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#2a2a2e] bg-[#0d0d0d]">
          <div className="px-6 py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  pathname === item.href
                    ? "text-white bg-[#1a1a1c]"
                    : "text-[#a0a0a8] hover:text-white hover:bg-[#1a1a1c]"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-[#2a2a2e] my-2" />
            <Link
              href="/account"
              className="px-4 py-3 text-sm font-medium text-[#a0a0a8] hover:text-white transition-colors rounded-lg hover:bg-[#1a1a1c]"
              onClick={() => setMobileOpen(false)}
            >
              <div className="flex items-center gap-2">
                <User size={16} />
                Account
              </div>
            </Link>
            <Link
              href="/account"
              className="btn-accent text-sm text-center mt-2"
              onClick={() => setMobileOpen(false)}
            >
              Get Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
