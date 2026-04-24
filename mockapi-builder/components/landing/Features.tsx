"use client";

const features = [
  {
    tag: "RESPONSE",
    title: "Any JSON shape",
    desc: "Arrays, nested objects, dynamic fields — write the exact response your frontend expects.",
  },
  {
    tag: "LATENCY",
    title: "Delay simulation",
    desc: "Add 0–10s delays to mock real network conditions. Test your loading states properly.",
  },
  {
    tag: "METHODS",
    title: "Full CRUD",
    desc: "GET, POST, PUT, DELETE, PATCH. Build complete mock APIs for any resource.",
  },
  {
    tag: "LIVE",
    title: "Instant URLs",
    desc: "Every endpoint is live the moment you save. No deploys. No config. Just copy and use.",
  },
  {
    tag: "EDITOR",
    title: "Monaco JSON editor",
    desc: "VS Code-quality editing with syntax highlighting, validation, and auto-formatting.",
  },
  {
    tag: "CORS",
    title: "Browser-ready",
    desc: "All mock endpoints return proper CORS headers. Works from any frontend, any domain.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative px-6 py-24 md:py-32">
      {/* Section divider */}
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2A2A2A] to-transparent" />

      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-16">
          <span className="font-[family-name:var(--font-mono)] text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F59E0B]">
            / Features
          </span>
          <h2 className="mt-2 font-[family-name:var(--font-mono)] text-2xl font-bold text-white md:text-3xl">
            Built for developers who ship fast
          </h2>
        </div>

        {/* Features list */}
        <div className="space-y-px overflow-hidden rounded-lg border border-[#1E1E1E]">
          {features.map((feature, i) => (
            <div
              key={feature.tag}
              className="group flex items-start gap-6 border-b border-[#1E1E1E] bg-[#0D0D0D] p-5 transition-colors last:border-b-0 hover:bg-[#111] md:items-center md:gap-8 md:p-6"
            >
              {/* Number */}
              <span className="shrink-0 font-[family-name:var(--font-mono)] text-xs text-[#333]">
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Tag */}
              <span className="hidden w-20 shrink-0 font-[family-name:var(--font-mono)] text-[10px] font-semibold uppercase tracking-[0.15em] text-[#444] transition-colors group-hover:text-[#F59E0B] md:block">
                {feature.tag}
              </span>

              {/* Title */}
              <h3 className="w-44 shrink-0 font-[family-name:var(--font-mono)] text-sm font-semibold text-white">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-[#555] transition-colors group-hover:text-[#888]">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
