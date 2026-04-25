"use client";

import Link from "next/link";
import { LiveDemo } from "@/components/landing/LiveDemo";

export function Hero() {
  return (
    <section className="relative px-6 pt-24 pb-20 md:pt-36 md:pb-32">
      {/* Background noise texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />

      {/* Amber gradient glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2">
        <div className="h-[500px] w-[800px] rounded-full bg-[#F59E0B]/[0.04] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <div className="grid gap-12 md:grid-cols-2 md:items-center md:gap-16">
          {/* Left: Text */}
          <div>
            {/* Version badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded border border-[#2A2A2A] bg-[#161616] px-3 py-1">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-[#666]">
                v1.1 — now live
              </span>
            </div>

            <h1 className="font-[family-name:var(--font-mono)] text-3xl font-bold leading-[1.15] tracking-tight text-white md:text-5xl">
              Stop waiting
              <br />
              for the backend.
            </h1>

            <p className="mt-5 max-w-md text-base leading-relaxed text-[#888]">
              Spin up mock REST endpoints in 30 seconds. Get a live URL.
              Plug it into your frontend and keep shipping.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex items-center gap-4">
              <Link href="/login">
                <button className="group relative rounded-md bg-[#F59E0B] px-6 py-2.5 font-[family-name:var(--font-mono)] text-sm font-bold text-black transition-all hover:shadow-[0_0_30px_rgba(245,158,11,0.25)]">
                  Start Building — Free
                  <span className="ml-2 inline-block transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </button>
              </Link>
              <a
                href="#how-it-works"
                className="font-[family-name:var(--font-mono)] text-sm text-[#666] transition-colors hover:text-white"
              >
                How it works
              </a>
            </div>

            {/* Stats */}
            <div className="mt-10 flex items-center gap-8 border-t border-[#1E1E1E] pt-6">
              <div>
                <p className="font-[family-name:var(--font-mono)] text-xl font-bold text-white">
                  &lt;30s
                </p>
                <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-[#555]">
                  Setup time
                </p>
              </div>
              <div className="h-8 w-px bg-[#1E1E1E]" />
              <div>
                <p className="font-[family-name:var(--font-mono)] text-xl font-bold text-white">
                  5
                </p>
                <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-[#555]">
                  HTTP Methods
                </p>
              </div>
              <div className="h-8 w-px bg-[#1E1E1E]" />
              <div>
                <p className="font-[family-name:var(--font-mono)] text-xl font-bold text-white">
                  ∞
                </p>
                <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-[#555]">
                  Endpoints
                </p>
              </div>
            </div>
          </div>

          {/* Right: Live Demo Widget */}
          <div className="relative">
            {/* Glow */}
            <div className="absolute -inset-2 rounded-xl bg-[#F59E0B]/[0.03] blur-xl" />
            <div className="relative">
              <LiveDemo />
              <p className="mt-2 text-center font-[family-name:var(--font-mono)] text-[10px] text-[#333]">
                ↑ real API — try it yourself
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

