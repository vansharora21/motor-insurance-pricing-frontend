import Link from "next/link";

export default function QuoteChoicePage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-20 sm:px-6">
      <span className="mb-4 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
        Step 1 of 2
      </span>
      <h1 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
        How would you like to get a quote?
      </h1>
      <p className="mt-4 max-w-xl text-center text-zinc-600 dark:text-zinc-400">
        Add a single customer response for an instant personalized premium, or upload a batch of
        policies for portfolio-level pricing.
      </p>

      <div className="mt-12 grid w-full max-w-4xl gap-8 sm:grid-cols-2">
        {/* Single customer */}
        <Link
          href="/quote/single"
          className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-8 transition-all hover:border-blue-400 hover:shadow-xl hover:shadow-blue-600/10 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-600"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl dark:bg-blue-950">
            👤
          </span>
          <h2 className="mt-6 text-xl font-semibold">Add a customer response</h2>
          <p className="mt-2 flex-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Enter one policyholder&apos;s details — driver age, vehicle, bonus-malus history and more —
            and get an instant premium with a full pricing breakdown and risk category.
          </p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
            Start single quote
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </span>
        </Link>

        {/* Bulk upload */}
        <Link
          href="/quote/bulk"
          className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-8 transition-all hover:border-blue-400 hover:shadow-xl hover:shadow-blue-600/10 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-600"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-2xl dark:bg-emerald-950">
            📊
          </span>
          <h2 className="mt-6 text-xl font-semibold">Bulk upload</h2>
          <p className="mt-2 flex-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Upload a CSV of many policies at once. Score the whole portfolio, review the risk
            distribution, and download the results.
          </p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
            Go to bulk upload
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </span>
        </Link>
      </div>
    </div>
  );
}