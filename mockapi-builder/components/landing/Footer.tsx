import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative border-t border-[#1E1E1E] px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="font-[family-name:var(--font-mono)] text-xs text-[#333]">
            mockapi.builder
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6">
          <a
            href="#how-it-works"
            className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-[#333] transition-colors hover:text-[#888]"
          >
            Process
          </a>
          <a
            href="#features"
            className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-[#333] transition-colors hover:text-[#888]"
          >
            Features
          </a>
          <a
            href="https://adnanxdev.site"
            target="_blank"
            rel="noopener noreferrer"
            className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-[#333] transition-colors hover:text-[#F59E0B]"
          >
            adnanxdev.site
          </a>
        </div>

        {/* Copyright */}
        <p className="font-[family-name:var(--font-mono)] text-[10px] text-[#333]">
          © {new Date().getFullYear()}{" "}
          <a
            href="https://adnanxdev.site"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#555] transition-colors hover:text-[#F59E0B]"
          >
            Adnan
          </a>
          . All rights reserved.
        </p>
      </div>
    </footer>
  );
}
