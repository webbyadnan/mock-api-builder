import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Features />

        {/* CTA Section */}
        <section className="relative px-6 py-24 md:py-32">
          <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2A2A2A] to-transparent" />
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-[family-name:var(--font-mono)] text-2xl font-bold text-white md:text-3xl">
              Ready to stop mocking around?
            </h2>
            <p className="mt-3 text-sm text-[#666]">
              Create your first mock API in under a minute. No credit card, no setup fee, no BS.
            </p>
            <div className="mt-8">
              <a href="/login">
                <button className="rounded-md bg-[#F59E0B] px-8 py-3 font-[family-name:var(--font-mono)] text-sm font-bold text-black transition-all hover:shadow-[0_0_40px_rgba(245,158,11,0.2)]">
                  Get Started — It&apos;s Free →
                </button>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
