import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="w-full bg-gradient-to-b from-blue-50 to-white dark:from-zinc-900 dark:to-zinc-950">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32">
          <span className="mb-6 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
            Actuarial ML · Frequency + Severity Modeling
          </span>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-zinc-900 sm:text-6xl dark:text-zinc-50">
            Fair, personalized motor insurance premiums — powered by AI
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Instead of one-size-fits-all pricing, our system models how often you&apos;ll claim
            (frequency) and how much each claim costs (severity) — then combines them into a
            transparent, risk-segmented premium.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/quote"
              className="rounded-full bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700"
            >
              Get a Quote
            </Link>
            <Link
              href="/quote/bulk"
              className="rounded-full border border-zinc-300 px-8 py-3.5 text-base font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Bulk Upload
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="w-full">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">How the pricing works</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Predict claim frequency",
                body: "A Poisson regression model estimates how many claims a policy is likely to generate per year based on driver and vehicle risk factors.",
              },
              {
                step: "02",
                title: "Predict claim severity",
                body: "A Gamma regression model estimates the average cost of each claim when one occurs — from minor fender-benders to total write-offs.",
              },
              {
                step: "03",
                title: "Combine into a fair premium",
                body: "Expected Loss = Frequency × Severity. We apply expense loading and fixed costs to produce a transparent final premium with a risk category.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{item.step}</span>
                <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example */}
      <section className="w-full bg-zinc-50 dark:bg-zinc-900">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">Two drivers, two fair prices</h2>
          <div className="mx-auto mt-12 grid max-w-4xl gap-8 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
              <h3 className="font-semibold">Driver A — Young, Sports Car</h3>
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-zinc-500">Predicted frequency</dt><dd className="font-medium">0.25 claims/yr</dd></div>
                <div className="flex justify-between"><dt className="text-zinc-500">Predicted severity</dt><dd className="font-medium">€3,200 / claim</dd></div>
                <div className="flex justify-between"><dt className="text-zinc-500">Expected loss</dt><dd className="font-medium">€800 / yr</dd></div>
                <div className="flex justify-between border-t border-zinc-200 pt-3 dark:border-zinc-800"><dt className="font-semibold">Final premium</dt><dd className="text-lg font-bold text-red-600 dark:text-red-400">~€1,090 / yr</dd></div>
              </dl>
              <span className="mt-4 inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">High risk</span>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
              <h3 className="font-semibold">Driver B — Experienced, Sedan</h3>
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-zinc-500">Predicted frequency</dt><dd className="font-medium">0.08 claims/yr</dd></div>
                <div className="flex justify-between"><dt className="text-zinc-500">Predicted severity</dt><dd className="font-medium">€1,800 / claim</dd></div>
                <div className="flex justify-between"><dt className="text-zinc-500">Expected loss</dt><dd className="font-medium">€144 / yr</dd></div>
                <div className="flex justify-between border-t border-zinc-200 pt-3 dark:border-zinc-800"><dt className="font-semibold">Final premium</dt><dd className="text-lg font-bold text-emerald-600 dark:text-emerald-400">~€237 / yr</dd></div>
              </dl>
              <span className="mt-4 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Low risk</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight">Ready to see your premium?</h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-600 dark:text-zinc-400">
            Enter your policy details for an instant quote, or upload a batch of policies for portfolio pricing.
          </p>
          <Link
            href="/quote"
            className="mt-8 inline-block rounded-full bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700"
          >
            Get a Quote
          </Link>
        </div>
      </section>
    </div>
  );
}