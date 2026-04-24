import type { Metadata } from "next";
import { IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MockAPI Builder — Create Mock REST APIs Instantly",
  description:
    "Build mock REST API endpoints in seconds. Get live URLs for your frontend projects. No backend needed.",
  keywords: [
    "mock API",
    "REST API",
    "API builder",
    "mock server",
    "frontend development",
    "API testing",
  ],
  openGraph: {
    title: "MockAPI Builder — Create Mock REST APIs Instantly",
    description:
      "Build mock REST API endpoints in seconds. Get live URLs for your frontend projects.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${ibmPlexMono.variable} ${instrumentSans.variable}`}>
      <body className="min-h-screen bg-[#F7F4EF] font-[family-name:var(--font-sans)] text-[#1A1A1A] antialiased">
        <SessionProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
