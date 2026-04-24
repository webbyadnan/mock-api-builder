"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "border-b border-[#2A2A2A] bg-[#0D0D0D]/95 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative flex h-7 w-7 items-center justify-center">
            <div className="absolute inset-0 rounded bg-[#F59E0B] opacity-20 blur-sm" />
            <span className="relative font-[family-name:var(--font-mono)] text-base font-black text-[#F59E0B]">
              M
            </span>
          </div>
          <span className="font-[family-name:var(--font-mono)] text-sm font-bold tracking-tight text-white">
            mockapi<span className="text-[#555]">.builder</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#how-it-works"
            className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-[#666] transition-colors hover:text-white"
          >
            Process
          </a>
          <a
            href="#features"
            className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-[#666] transition-colors hover:text-white"
          >
            Features
          </a>
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          {session ? (
            <Link href="/dashboard">
              <Button size="sm">Dashboard →</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <button className="font-[family-name:var(--font-mono)] text-xs text-[#666] transition-colors hover:text-white">
                  Log in
                </button>
              </Link>
              <Link href="/login">
                <button className="rounded-md bg-[#F59E0B] px-4 py-1.5 font-[family-name:var(--font-mono)] text-xs font-semibold text-black transition-all hover:bg-[#EAB308] hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                  Start Building
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
