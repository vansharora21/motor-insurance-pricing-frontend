import type { Metadata } from "next";
import { Geist_Mono, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import "./globals.css";

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Actuaris — AI Motor Insurance Pricing",
  description:
    "Frequency × severity actuarial pricing. Fair, personalized motor insurance premiums in INR, powered by 783k policies.",
};

function Navbar() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-5">
      <nav className="pointer-events-auto flex w-full max-w-5xl items-center justify-between rounded-full border border-line bg-ink-2/80 px-5 py-2.5 shadow-[0_8px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-accent/40 bg-accent-dim font-mono text-xs font-bold text-accent transition-colors group-hover:border-accent/70">
            A
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-text">
            Actuaris
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/quote/bulk"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-text sm:block"
          >
            Bulk upload
          </Link>
          <Link
            href="/quote"
            className="group flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-ink transition-all hover:bg-accent-strong active:scale-[0.97]"
          >
            Get a quote
            <ArrowRight
              size={14}
              weight="bold"
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${grotesk.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-ink text-text">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="hairline-t">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 sm:flex-row">
            <p className="mono-label text-faint">Actuaris · Frequency × Severity</p>
            <p className="font-mono text-xs text-faint">
              783,573 policies · 46,090 claims · INR
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}