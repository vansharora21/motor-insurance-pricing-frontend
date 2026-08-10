import Link from "next/link";
import {
  ArrowRight,
  Gauge,
  ShieldCheck,
  TrendDown,
  Waves,
} from "@phosphor-icons/react/dist/ssr";
import Reveal from "@/components/Reveal";

const inr = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

/* ------------------------------------------------------------------ Hero */

function HeroQuoteCard() {
  return (
    <div className="bezel animate-rise shadow-[0_40px_120px_rgba(0,0,0,0.6)]" style={{ animationDelay: "0.25s" }}>
      <div className="bezel-inner p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <p className="mono-label text-faint">Live quote · Area C</p>
          <span className="flex items-center gap-1.5 rounded-full bg-accent-dim px-3 py-1 font-mono text-[11px] font-semibold text-accent">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />
            Medium risk
          </span>
        </div>

        <p className="mt-8 font-mono text-xs uppercase tracking-[0.22em] text-faint">Final premium</p>
        <p className="mt-2 font-mono text-5xl font-medium tracking-tight text-text sm:text-6xl">
          {inr(31659)}
          <span className="ml-2 font-sans text-sm text-muted">/ year</span>
        </p>

        <div className="mt-8 space-y-3 font-mono text-sm">
          {[
            ["Frequency", "0.231 claims/yr", "text-text"],
            ["Severity", inr(103662), "text-text"],
            ["Expected loss", inr(23969), "text-muted"],
            ["Risk score", "118.4", "text-accent"],
          ].map(([label, value, color]) => (
            <div key={label} className="flex items-center justify-between border-b border-line pb-3 last:border-0">
              <span className="text-faint">{label}</span>
              <span className={`font-semibold ${color}`}>{value}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {["Area C", "Regular", "35 yrs", "BM 100", "B12"].map((chip) => (
            <span
              key={chip}
              className="rounded-md border border-line px-2.5 py-1 font-mono text-[11px] text-muted"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="bg-grid bg-glow relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-16 px-6 pb-24 pt-36 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12 lg:pb-32 lg:pt-44">
        <div>
          <p className="mono-label animate-rise text-accent">Frequency × Severity actuarial pricing</p>
          <h1
            className="animate-rise mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.6rem]"
            style={{ animationDelay: "0.08s" }}
          >
            Motor premiums priced by the actuarial math, not the market average
          </h1>
          <p
            className="animate-rise mt-6 max-w-[46ch] text-lg leading-relaxed text-muted"
            style={{ animationDelay: "0.16s" }}
          >
            We model how often you claim and how much each claim costs — then combine both into
            one transparent premium, in INR.
          </p>
          <div
            className="animate-rise mt-10 flex flex-col gap-4 sm:flex-row"
            style={{ animationDelay: "0.24s" }}
          >
            <Link
              href="/quote"
              className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-accent px-7 py-3.5 text-[15px] font-semibold text-ink transition-all hover:bg-accent-strong active:scale-[0.98]"
            >
              Get a quote
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink/10 transition-transform group-hover:translate-x-0.5">
                <ArrowRight size={14} weight="bold" />
              </span>
            </Link>
            <Link
              href="/quote/bulk"
              className="inline-flex items-center justify-center rounded-full border border-line-strong px-7 py-3.5 text-[15px] font-semibold text-text transition-colors hover:border-accent/50 hover:text-accent"
            >
              Bulk upload
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 rounded-full bg-accent/5 blur-3xl" aria-hidden="true" />
          <HeroQuoteCard />
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- Stats */

const STATS = [
  { value: "783,573", label: "policies modelled" },
  { value: "46,090", label: "claims observed" },
  { value: "9", label: "model combos benchmarked" },
  { value: "93", label: "INR exchange calibration" },
];

function StatsStrip() {
  return (
    <section className="hairline-t hairline-b bg-ink-2/60">
      <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-line lg:grid-cols-4">
        {STATS.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 0.06}>
            <div className="px-6 py-10 text-center">
              <p className="font-mono text-3xl font-medium text-text sm:text-4xl">{stat.value}</p>
              <p className="mono-label mt-2 text-faint">{stat.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- How it works */

const STEPS = [
  {
    number: "01",
    title: "Predict claim frequency",
    body: "A Poisson model estimates how many claims a policy is likely to generate per year, from driver age, bonus-malus history, vehicle and region risk.",
    icon: Waves,
  },
  {
    number: "02",
    title: "Predict claim severity",
    body: "A Gamma model estimates the average cost of each claim when one happens — from minor fender-benders to total write-offs.",
    icon: Gauge,
  },
  {
    number: "03",
    title: "Combine into a fair premium",
    body: "Expected loss = frequency × severity. We add a fixed expense and 30% expense loading, then floor it at a ₹2,500 minimum.",
    icon: ShieldCheck,
  },
];

function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
      <Reveal>
        <p className="mono-label text-accent">The model</p>
        <h2 className="mt-5 max-w-xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Three equations stand between you and an average premium
        </h2>
      </Reveal>

      <div className="mt-16">
        {STEPS.map((step, index) => (
          <Reveal key={step.number} delay={index * 0.08}>
            <div className="group grid grid-cols-[auto_1fr] items-start gap-6 border-t border-line py-10 transition-colors hover:bg-surface/50 sm:grid-cols-[120px_1fr_320px] sm:gap-10 sm:px-4">
              <p className="font-mono text-2xl font-medium text-faint transition-colors group-hover:text-accent">
                {step.number}
              </p>
              <div>
                <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">{step.title}</h3>
                <p className="mt-3 max-w-[52ch] leading-relaxed text-muted">{step.body}</p>
              </div>
              <div className="hidden items-end justify-end sm:flex">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-surface-2 text-accent">
                  <step.icon size={22} weight="duotone" />
                </span>
              </div>
            </div>
          </Reveal>
        ))}
        <div className="border-t border-line" />
      </div>
    </section>
  );
}

/* ------------------------------------------------------ Driver comparison */

interface DriverCardProps {
  label: string;
  profile: string;
  chips: string[];
  frequency: number;
  severity: number;
  premium: number;
  risk: "Low" | "High";
}

function DriverCard({ label, profile, chips, frequency, severity, premium, risk }: DriverCardProps) {
  const isHigh = risk === "High";
  const riskColor = isHigh ? "text-high" : "text-low";
  const riskBadge = isHigh
    ? "bg-high/10 text-high border-high/30"
    : "bg-low/10 text-low border-low/30";

  return (
    <div className="bezel">
      <div className="bezel-inner p-7 sm:p-8">
        <div className="flex items-center justify-between">
          <p className="mono-label text-faint">{label}</p>
          <span className={`rounded-full border px-3 py-1 font-mono text-[11px] font-semibold ${riskBadge}`}>
            {risk} risk
          </span>
        </div>
        <h3 className="mt-5 text-xl font-semibold tracking-tight">{profile}</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span key={chip} className="rounded-md border border-line px-2 py-1 font-mono text-[11px] text-muted">
              {chip}
            </span>
          ))}
        </div>

        <div className="mt-8 space-y-3 font-mono text-sm">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <span className="text-faint">Frequency</span>
            <span className="font-semibold text-text">{frequency.toFixed(3)} / yr</span>
          </div>
          <div className="flex items-center justify-between border-b border-line pb-3">
            <span className="text-faint">Severity</span>
            <span className="font-semibold text-text">{inr(severity)}</span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-muted">Premium</span>
            <span className={`text-2xl font-semibold ${riskColor}`}>{inr(premium)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Comparison() {
  return (
    <section className="border-y border-line bg-ink-2/60">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <Reveal>
          <p className="mono-label text-accent">Fair pricing</p>
          <h2 className="mt-5 max-w-xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Two drivers, two very different premiums
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <DriverCard
              label="Driver A"
              profile="22 · first car · sports hatch"
              chips={["Area D", "Diesel", "BM 180", "VehPower 15"]}
              frequency={0.681}
              severity={160898}
              premium={143043}
              risk="High"
            />
          </Reveal>
          <Reveal delay={0.1}>
            <DriverCard
              label="Driver B"
              profile="44 · experienced · family sedan"
              chips={["Area A", "Diesel", "BM 80", "VehPower 8"]}
              frequency={0.156}
              severity={45522}
              premium={9718}
              risk="Low"
            />
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-accent/25 bg-accent-dim px-6 py-5">
            <TrendDown size={22} weight="duotone" className="shrink-0 text-accent" />
            <p className="text-sm leading-relaxed text-muted">
              Driver B pays <span className="font-semibold text-text">93% less</span> for the same
              coverage — the system prices risk, not averages.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- CTA */

function Cta() {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-glow absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-6 py-28 text-center sm:py-36">
        <Reveal>
          <p className="mono-label text-accent">Get started</p>
          <h2 className="mx-auto mt-5 max-w-xl text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            See your premium before you renew
          </h2>
          <p className="mx-auto mt-5 max-w-[42ch] text-muted">
            Enter your policy details for an instant quote, or upload a portfolio for batch pricing.
          </p>
          <Link
            href="/quote"
            className="group mt-10 inline-flex items-center justify-center gap-2.5 rounded-full bg-accent px-8 py-4 text-base font-semibold text-ink transition-all hover:bg-accent-strong active:scale-[0.98]"
          >
            Get a quote
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/10 transition-transform group-hover:translate-x-0.5">
              <ArrowRight size={16} weight="bold" />
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------- Page */

export default function Home() {
  return (
    <>
      <Hero />
      <StatsStrip />
      <HowItWorks />
      <Comparison />
      <Cta />
    </>
  );
}