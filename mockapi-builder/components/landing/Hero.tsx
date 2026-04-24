"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const lines = [
  { prefix: "$", text: 'curl https://mockapi.dev/api/mock/shop/products', delay: 0 },
  { prefix: "", text: "", delay: 600 },
  { prefix: "//", text: " Response in 23ms", delay: 900 },
  { prefix: "{", text: "", delay: 1100 },
  { prefix: " ", text: ' "id": 1,', delay: 1250 },
  { prefix: " ", text: ' "name": "MacBook Pro 16\\"",', delay: 1400 },
  { prefix: " ", text: ' "price": 2499.99,', delay: 1550 },
  { prefix: " ", text: ' "inStock": true', delay: 1700 },
  { prefix: "}", text: "", delay: 1850 },
];

export function Hero() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const timers = lines.map((line, i) =>
      setTimeout(() => setVisibleLines(i + 1), line.delay),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

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
                v1.0 — public beta
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

          {/* Right: Terminal */}
          <div className="relative">
            {/* Terminal glow */}
            <div className="absolute -inset-2 rounded-xl bg-[#F59E0B]/[0.03] blur-xl" />

            <div className="relative overflow-hidden rounded-xl border border-[#2A2A2A] bg-[#0A0A0A]">
              {/* Terminal header */}
              <div className="flex items-center gap-2 border-b border-[#1E1E1E] px-4 py-2.5">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                </div>
                <span className="ml-2 font-[family-name:var(--font-mono)] text-[10px] text-[#444]">
                  terminal — mockapi
                </span>
              </div>

              {/* Terminal body */}
              <div className="p-5 font-[family-name:var(--font-mono)] text-[13px] leading-6">
                {lines.slice(0, visibleLines).map((line, i) => (
                  <div key={i} className="flex">
                    {line.prefix === "$" && (
                      <>
                        <span className="mr-2 text-[#F59E0B]">$</span>
                        <span className="text-[#E5E1D8]">{line.text}</span>
                      </>
                    )}
                    {line.prefix === "//" && (
                      <span className="text-[#444]">{line.prefix}{line.text}</span>
                    )}
                    {line.prefix === "{" && (
                      <span className="text-[#E5E1D8]">{"{"}</span>
                    )}
                    {line.prefix === "}" && (
                      <span className="text-[#E5E1D8]">{"}"}</span>
                    )}
                    {line.prefix === " " && (
                      <span>
                        {"  "}
                        <span className="text-[#F59E0B]">
                          {line.text.split(":")[0]}
                        </span>
                        <span className="text-[#E5E1D8]">:</span>
                        <span className="text-[#34D399]">
                          {line.text.split(":").slice(1).join(":")}
                        </span>
                      </span>
                    )}
                    {line.prefix === "" && <span>&nbsp;</span>}
                  </div>
                ))}
                {visibleLines < lines.length && (
                  <span className="inline-block h-4 w-1.5 animate-pulse bg-[#F59E0B]" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
