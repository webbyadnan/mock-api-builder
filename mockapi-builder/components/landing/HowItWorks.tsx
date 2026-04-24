"use client";

export function HowItWorks() {
  const steps = [
    {
      num: "01",
      label: "CREATE",
      title: "Name your project",
      desc: "Give it a name. We generate a unique slug and your base API URL is ready.",
      code: "POST /api/projects\n→ { slug: \"my-store-api-x7k2\" }",
    },
    {
      num: "02",
      label: "DEFINE",
      title: "Add endpoints",
      desc: "Pick a method, set a path, write your JSON response. Add delays to simulate real latency.",
      code: "GET /products → 200\nPOST /orders → 201\nDELETE /users/:id → 204",
    },
    {
      num: "03",
      label: "SHIP",
      title: "Use your live URL",
      desc: "Your mock API is live. Copy the URL, drop it in your frontend. Zero deploy, zero config.",
      code: "fetch('https://mockapi.dev\n  /api/mock/my-store-api-x7k2\n  /products')",
    },
  ];

  return (
    <section id="how-it-works" className="relative px-6 py-24 md:py-32">
      {/* Section divider line */}
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2A2A2A] to-transparent" />

      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-16 flex items-end justify-between">
          <div>
            <span className="font-[family-name:var(--font-mono)] text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F59E0B]">
              / Process
            </span>
            <h2 className="mt-2 font-[family-name:var(--font-mono)] text-2xl font-bold text-white md:text-3xl">
              How it works
            </h2>
          </div>
          <span className="hidden font-[family-name:var(--font-mono)] text-xs text-[#333] md:block">
            3 steps. 30 seconds. Done.
          </span>
        </div>

        {/* Steps grid */}
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.num}
              className="group relative rounded-lg border border-[#1E1E1E] bg-[#0D0D0D] p-6 transition-all duration-300 hover:border-[#2A2A2A] hover:bg-[#111]"
            >
              {/* Step header */}
              <div className="mb-5 flex items-center justify-between">
                <span className="font-[family-name:var(--font-mono)] text-2xl font-bold text-[#1E1E1E] transition-colors group-hover:text-[#2A2A2A]">
                  {step.num}
                </span>
                <span className="rounded border border-[#1E1E1E] px-2 py-0.5 font-[family-name:var(--font-mono)] text-[9px] font-semibold uppercase tracking-[0.15em] text-[#444] transition-colors group-hover:border-[#F59E0B]/20 group-hover:text-[#F59E0B]">
                  {step.label}
                </span>
              </div>

              {/* Content */}
              <h3 className="font-[family-name:var(--font-mono)] text-base font-semibold text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#666]">
                {step.desc}
              </p>

              {/* Code snippet */}
              <div className="mt-5 rounded border border-[#1A1A1A] bg-[#080808] p-3">
                <pre className="font-[family-name:var(--font-mono)] text-[11px] leading-5 text-[#555]">
                  {step.code}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
