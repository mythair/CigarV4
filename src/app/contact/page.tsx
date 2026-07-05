"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, MessageSquare, Shield, ArrowRight } from "lucide-react";

const contactMethods = [
  {
    icon: <Mail size={24} />,
    title: "Email Support",
    desc: "Reach out to our support team via email for any inquiries.",
    action: "support@cigar.gg",
    link: "mailto:support@cigar.gg",
  },
  {
    icon: <MessageSquare size={24} />,
    title: "Discord Community",
    desc: "Join our Discord server for real-time support and discussions.",
    action: "Join Discord",
    link: "#",
  },
  {
    icon: <Shield size={24} />,
    title: "Report a Bug",
    desc: "Found a bug? Let us know and we'll fix it as soon as possible.",
    action: "Report Bug",
    link: "#",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-16">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Contact <span className="text-teal-500">Us</span>
          </h1>
          <p className="text-[#6b6b72] max-w-lg mx-auto">
            Have questions? Want to report a bug? Need help with your account? We're here for you.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {contactMethods.map((method, i) => (
            <div
              key={i}
              className="card text-center group hover:-translate-y-2 transition-transform duration-300"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-teal-400 group-hover:scale-110 transition-transform duration-300">
                {method.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{method.title}</h3>
              <p className="text-sm text-[#6b6b72] mb-4">{method.desc}</p>
              <a
                href={method.link}
                className="inline-flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300 transition-colors font-medium"
              >
                {method.action}
                <ArrowRight size={14} />
              </a>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "Is Cigar v4 really free?", a: "Yes! Cigar v4 is 100% free to use. No subscriptions, no paywalls, no limitations." },
              { q: "Will I get banned using Cigar?", a: "We work hard to keep our modules undetected, but we can't guarantee anything. Always use at your own risk." },
              { q: "What Minecraft versions are supported?", a: "Cigar v4 supports Minecraft 1.8.x through 1.20+. We update regularly to support new versions." },
              { q: "How do I report bugs?", a: "You can report bugs via our Discord server or email support. Include as much detail as possible." },
            ].map((faq, i) => (
              <details key={i} className="border border-[#2a2a2e] rounded-lg group">
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#1a1a1c] transition-colors rounded-lg">
                  <span className="text-sm font-medium text-white">{faq.q}</span>
                  <span className="text-teal-400 transition-transform group-open:rotate-180">
                    <ArrowRight size={16} className="rotate-90" />
                  </span>
                </summary>
                <div className="px-4 pb-4 text-sm text-[#6b6b72] leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
