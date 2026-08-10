"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle, Lightning } from "@phosphor-icons/react";
import { predictSingle } from "@/lib/api";
import type { PolicyInput, ScoredPolicy } from "@/lib/types";

const BRAND_OPTIONS = ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10", "B11", "B12", "B13", "B14"];
const GAS_OPTIONS = ["Regular", "Diesel"];
const AREA_OPTIONS = ["A", "B", "C", "D", "E", "F"];
const REGION_OPTIONS = [
  "Alsace", "Aquitaine", "Auvergne", "Basse-Normandie", "Bourgogne", "Bretagne",
  "Centre", "Champagne-Ardenne", "Corse", "Franche-Comte", "Haute-Normandie",
  "Ile-de-France", "Languedoc-Roussillon", "Limousin", "Lorraine", "Midi-Pyrenees",
  "Nord-Pas-de-Calais", "Pays-de-la-Loire", "Picardie", "Poitou-Charentes",
  "Provence-Alpes-Cote d'Azur", "Rhone-Alpes",
];

const DEFAULT_POLICY: PolicyInput = {
  Exposure: 1.0,
  VehPower: 6,
  VehAge: 6,
  DrivAge: 40,
  BonusMalus: 60,
  VehBrand: "B12",
  VehGas: "Regular",
  Area: "C",
  Density: 500,
  Region: "Centre",
};

const RISK_STYLES: Record<string, { badge: string; text: string }> = {
  Low: { badge: "border-low/30 bg-low/10 text-low", text: "text-low" },
  Medium: { badge: "border-medium/30 bg-medium/10 text-medium", text: "text-medium" },
  High: { badge: "border-high/30 bg-high/10 text-high", text: "text-high" },
};

const INPUT_CLASS =
  "w-full rounded-lg border border-line bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none transition-colors " +
  "placeholder:text-faint focus:border-accent/60 focus:ring-2 focus:ring-accent/15 hover:border-line-strong";

const LABEL_CLASS = "mono-label mb-2 block text-faint";

function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

export default function SingleQuotePage() {
  const [policy, setPolicy] = useState<PolicyInput>(DEFAULT_POLICY);
  const [consent, setConsent] = useState(false);
  const [result, setResult] = useState<ScoredPolicy | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof PolicyInput>(key: K, value: PolicyInput[K]) {
    setPolicy((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await predictSingle(policy, consent);
      setResult(response.policy);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const risk = result ? RISK_STYLES[result.risk_category] : null;

  return (
    <div className="mx-auto max-w-6xl px-6 pb-28 pt-36">
      <div className="mb-12">
        <p className="mono-label text-accent">Quote · Single</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Policyholder details</h1>
        <p className="mt-3 max-w-[52ch] text-muted">
          The pricing engine scores the policy with the saved frequency and severity models.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Form */}
        <form onSubmit={handleSubmit} className="bezel">
          <div className="bezel-inner p-6 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className={LABEL_CLASS}>Exposure (years)</span>
                <input
                  type="number"
                  min={0.01}
                  max={2.5}
                  step={0.01}
                  value={policy.Exposure}
                  onChange={(e) => update("Exposure", parseFloat(e.target.value) || 0)}
                  className={INPUT_CLASS}
                />
              </label>
              <label className="block">
                <span className={LABEL_CLASS}>Driver age</span>
                <input
                  type="number"
                  min={18}
                  max={100}
                  value={policy.DrivAge}
                  onChange={(e) => update("DrivAge", parseInt(e.target.value, 10) || 18)}
                  className={INPUT_CLASS}
                />
              </label>
              <label className="block">
                <span className={LABEL_CLASS}>Bonus-malus</span>
                <input
                  type="number"
                  min={50}
                  max={350}
                  value={policy.BonusMalus}
                  onChange={(e) => update("BonusMalus", parseInt(e.target.value, 10) || 50)}
                  className={INPUT_CLASS}
                />
              </label>
              <label className="block">
                <span className={LABEL_CLASS}>Vehicle power</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={policy.VehPower}
                  onChange={(e) => update("VehPower", parseInt(e.target.value, 10) || 1)}
                  className={INPUT_CLASS}
                />
              </label>
              <label className="block">
                <span className={LABEL_CLASS}>Vehicle age (years)</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={policy.VehAge}
                  onChange={(e) => update("VehAge", parseInt(e.target.value, 10) || 0)}
                  className={INPUT_CLASS}
                />
              </label>
              <label className="block">
                <span className={LABEL_CLASS}>Population density</span>
                <input
                  type="number"
                  min={0}
                  max={27000}
                  value={policy.Density}
                  onChange={(e) => update("Density", parseInt(e.target.value, 10) || 0)}
                  className={INPUT_CLASS}
                />
              </label>
              <label className="block">
                <span className={LABEL_CLASS}>Vehicle brand</span>
                <select
                  value={policy.VehBrand}
                  onChange={(e) => update("VehBrand", e.target.value)}
                  className={INPUT_CLASS}
                >
                  {BRAND_OPTIONS.map((brand) => (
                    <option key={brand} value={brand} className="bg-surface-2">
                      {brand}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={LABEL_CLASS}>Fuel type</span>
                <select
                  value={policy.VehGas}
                  onChange={(e) => update("VehGas", e.target.value)}
                  className={INPUT_CLASS}
                >
                  {GAS_OPTIONS.map((gas) => (
                    <option key={gas} value={gas} className="bg-surface-2">
                      {gas}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={LABEL_CLASS}>Area</span>
                <select
                  value={policy.Area}
                  onChange={(e) => update("Area", e.target.value)}
                  className={INPUT_CLASS}
                >
                  {AREA_OPTIONS.map((area) => (
                    <option key={area} value={area} className="bg-surface-2">
                      {area}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={LABEL_CLASS}>Region</span>
                <select
                  value={policy.Region}
                  onChange={(e) => update("Region", e.target.value)}
                  className={INPUT_CLASS}
                >
                  {REGION_OPTIONS.map((region) => (
                    <option key={region} value={region} className="bg-surface-2">
                      {region}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {error && (
              <div className="mt-6 rounded-lg border border-high/30 bg-high/10 p-4 text-sm text-high">
                {error}
              </div>
            )}

            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-surface-2/60 p-4 transition-colors hover:border-line-strong">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-line-strong bg-surface-2 accent-accent"
              />
              <span className="text-xs leading-relaxed text-muted">
                I agree to my anonymized quote being stored to help improve pricing research.
                No personal information is collected.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="group mt-6 flex w-full items-center justify-center gap-2.5 rounded-full bg-accent px-6 py-3.5 text-[15px] font-semibold text-ink transition-all hover:bg-accent-strong active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Lightning size={18} weight="fill" className="animate-pulse" />
                  Calculating premium…
                </>
              ) : (
                <>
                  Predict premium
                  <ArrowRight size={18} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Result */}
        <div className="bezel">
          <div className="bezel-inner flex min-h-[480px] flex-col p-6 sm:p-8">
            {!result ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-surface-2 text-faint">
                  <Lightning size={28} weight="duotone" />
                </span>
                <p className="mt-6 max-w-[30ch] text-sm leading-relaxed text-muted">
                  Fill in the policy attributes and hit{" "}
                  <span className="font-semibold text-text">Predict premium</span> — the pricing
                  breakdown appears here.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <p className="mono-label text-faint">Pricing result</p>
                  {risk && (
                    <span className={`rounded-full border px-3 py-1 font-mono text-[11px] font-semibold ${risk.badge}`}>
                      {result.risk_category} risk
                    </span>
                  )}
                </div>

                <div className="mt-8 rounded-2xl border border-accent/25 bg-accent-dim p-6 text-center">
                  <p className="mono-label text-accent">Final premium</p>
                  <p className="mt-2 font-mono text-5xl font-medium tracking-tight text-text">
                    {formatINR(result.final_premium)}
                  </p>
                  <p className="mt-2 font-mono text-xs text-faint">per policy term</p>
                </div>

                <dl className="mt-8 space-y-3 font-mono text-sm">
                  {[
                    ["Predicted frequency", `${result.predicted_annual_frequency.toFixed(4)} claims/yr`],
                    ["Predicted severity", formatINR(result.predicted_claim_severity)],
                    ["Expected loss", formatINR(result.expected_loss)],
                    ["Pure premium", formatINR(result.pure_premium)],
                    ["Technical premium", formatINR(result.technical_premium)],
                    ["Risk score", result.risk_score.toFixed(1)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between border-b border-line pb-3 last:border-0">
                      <dt className="text-faint">{label}</dt>
                      <dd className="font-semibold text-text">{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-8 flex items-center gap-2.5 rounded-lg border border-low/25 bg-low/10 px-4 py-3">
                  <CheckCircle size={18} weight="duotone" className="shrink-0 text-low" />
                  <p className="text-xs leading-relaxed text-muted">
                    Scored by the deployed Poisson + Gamma models on 783,573 policies.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}