"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password");
        setIsLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong");
      setIsLoading(false);
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] px-6">
      <div className="w-full max-w-[360px]">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center">
              <div className="absolute inset-0 rounded bg-[#F59E0B] opacity-20 blur-sm" />
              <span className="relative font-[family-name:var(--font-mono)] text-lg font-black text-[#F59E0B]">
                M
              </span>
            </div>
          </Link>
          <h1 className="mt-6 font-[family-name:var(--font-mono)] text-xl font-bold tracking-tight text-white">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-[#888]">
            Sign in to your mockapi.builder account
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-center font-[family-name:var(--font-mono)] text-xs text-red-400">
            {error}
          </div>
        )}

        <div className="rounded-xl border border-[#2A2A2A] bg-[#0D0D0D] p-6 shadow-2xl">
          {/* Email Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label className="mb-1.5 block font-[family-name:var(--font-mono)] text-xs font-medium uppercase tracking-wider text-[#666]">
                Email address
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-md border border-[#2A2A2A] bg-[#111] px-3 py-2 text-sm text-white placeholder-[#444] outline-none transition-colors focus:border-[#F59E0B]"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-[family-name:var(--font-mono)] text-xs font-medium uppercase tracking-wider text-[#666]">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                className="w-full rounded-md border border-[#2A2A2A] bg-[#111] px-3 py-2 text-sm text-white placeholder-[#444] outline-none transition-colors focus:border-[#F59E0B]"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-md bg-[#F59E0B] py-2 font-[family-name:var(--font-mono)] text-sm font-bold text-black transition-all hover:bg-[#EAB308] hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>


        </div>

        <p className="mt-8 text-center font-[family-name:var(--font-mono)] text-xs text-[#666]">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#F59E0B] transition-colors hover:text-[#EAB308]">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
