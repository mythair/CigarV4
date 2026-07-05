import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#2a2a2e] bg-[#0d0d0d]">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center font-black text-sm">
                C
              </div>
              <span className="text-xl font-bold tracking-tight">
                CIGAR<span className="text-teal-500"> v4</span>
              </span>
            </div>
            <p className="text-[#6b6b72] text-sm leading-relaxed max-w-md">
              The ultimate free Minecraft client. Get an unfair advantage over your opponents, while remaining completely undetected.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#a0a0a8] uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-[#6b6b72] text-sm hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/account" className="text-[#6b6b72] text-sm hover:text-white transition-colors">Download</Link></li>
              <li><Link href="/account" className="text-[#6b6b72] text-sm hover:text-white transition-colors">Changelog</Link></li>
              <li><Link href="/contact" className="text-[#6b6b72] text-sm hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#a0a0a8] uppercase tracking-wider mb-4">Community</h4>
            <ul className="space-y-3">
              <li><Link href="/forums" className="text-[#6b6b72] text-sm hover:text-white transition-colors">Forums</Link></li>
              <li><a href="#" className="text-[#6b6b72] text-sm hover:text-white transition-colors">Discord</a></li>
              <li><a href="#" className="text-[#6b6b72] text-sm hover:text-white transition-colors">YouTube</a></li>
              <li><a href="#" className="text-[#6b6b72] text-sm hover:text-white transition-colors">GitHub</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#2a2a2e] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#6b6b72] text-xs">
            © 2026 Cigar v4. All rights reserved. Not affiliated with Mojang AB.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-[#6b6b72] text-xs hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-[#6b6b72] text-xs hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
