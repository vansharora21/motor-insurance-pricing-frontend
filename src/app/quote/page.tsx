import Link from "next/link";
import { ArrowRight, FileCsv, UserCircle } from "@phosphor-icons/react/dist/ssr";
import Reveal from "@/components/Reveal";

export default function QuoteChoicePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-28 pt-40">
      <Reveal>
        <p className="mono-label text-accent">Quote · 01 / 02</p>
        <h1 className="mt-5 max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          How would you like to price?
        </h1>
        <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-muted">
          A single policyholder for an instant personalized premium, or a whole portfolio for
          distribution-level pricing.
        </p>
      </Reveal>

      <div className="mt-16 grid gap-6 lg:grid-cols-2">
        <Reveal>
          <Link
            href="/quote/single"
            className="group bezel block transition-transform hover:-translate-y-1"
          >
            <div className="bezel-inner flex h-full flex-col p-8 sm:p-10">
              <div className="flex items-start justify-between">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/30 bg-accent-dim text-accent">
                  <UserCircle size={28} weight="duotone" />
                </span>
                <span className="mono-label text-faint">Single</span>
              </div>
              <h2 className="mt-8 text-2xl font-semibold tracking-tight">One customer, one premium</h2>
              <p className="mt-3 flex-1 leading-relaxed text-muted">
                Enter the policyholder&apos;s details — driver age, vehicle, bonus-malus history —
                and get a full pricing breakdown with risk category.
              </p>
              <span className="mt-8 inline-flex items-center gap-2 font-mono text-sm font-semibold text-accent">
                Start single quote
                <ArrowRight
                  size={16}
                  weight="bold"
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
            </div>
          </Link>
        </Reveal>

        <Reveal delay={0.1}>
          <Link
            href="/quote/bulk"
            className="group bezel block transition-transform hover:-translate-y-1"
          >
            <div className="bezel-inner flex h-full flex-col p-8 sm:p-10">
              <div className="flex items-start justify-between">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-line-strong bg-surface-2 text-muted">
                  <FileCsv size={28} weight="duotone" />
                </span>
                <span className="mono-label text-faint">Batch</span>
              </div>
              <h2 className="mt-8 text-2xl font-semibold tracking-tight">A portfolio, priced at once</h2>
              <p className="mt-3 flex-1 leading-relaxed text-muted">
                Upload a CSV of policies, score the whole book, review the risk distribution and
                download the results.
              </p>
              <span className="mt-8 inline-flex items-center gap-2 font-mono text-sm font-semibold text-accent">
                Go to bulk upload
                <ArrowRight
                  size={16}
                  weight="bold"
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
            </div>
          </Link>
        </Reveal>
      </div>
    </div>
  );
}