"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle, Lightning } from "@phosphor-icons/react";
import { predictSingle } from "@/lib/api";
import type { PolicyInput, ScoredPolicy } from "@/lib/types";

/* ---------------------------------------------------------------------------
   Field metadata — plain-language labels + one-line helpers for every input.
   The `value` sent to the API is unchanged; only the display is humanized.
--------------------------------------------------------------------------- */

const BRAND_OPTIONS = Array.from({ length: 14 }, (_, i) => ({
  value: `B${i + 1}`,
  label: `Brand group ${i + 1}`,
}));

const GAS_OPTIONS = [
  { value: "Regular", label: "Petrol" },
  { value: "Diesel", label: "Diesel" },
];

const AREA_OPTIONS = [
  { value: "A", label: "A — most rural" },
  { value: "B", label: "B — rural" },
  { value: "C", label: "C — mixed / suburban" },
  { value: "D", label: "D — built-up" },
  { value: "E", label: "E — urban" },
  { value: "F", label: "F — most built-up / metro core" },
];

/** Density buckets mapped to representative values from the training data
 *  (min 1, median 393, p75 1,658, max 27,000). */
const DENSITY_OPTIONS = [
  { value: 50, label: "Rural", hint: "Sparse population, little traffic" },
  { value: 300, label: "Small town", hint: "A few thousand residents" },
  { value: 1000, label: "Town or suburb", hint: "Moderate traffic density" },
  { value: 3000, label: "City", hint: "Dense streets, frequent congestion" },
  { value: 8000, label: "Dense urban", hint: "Metro core, heavy congestion" },
];

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
  Density: 1000,
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

/** One-line helper shown under every field. */
function FieldHelper({ children }: { children: React.ReactNode }) {
  return <span className="mt-1.5 block text-xs leading-relaxed text-faint">{children}</span>;
}

/** Live description for the bonus-malus slider. */
function bonusMalusLabel(value: number): string {
  if (value <= 50) return "Maximum no-claims discount";
  if (value < 100) return "Below base rate — good no-claims history";
  if (value === 100) return "Base rate — neutral claims history";
  if (value < 200) return "Above base rate — recent claims";
  return "Heavy penalty — multiple recent claims";
}

/** Live description for the vehicle power slider. */
function vehPowerLabel(value: number): string {
  if (value <= 6) return "Small / economy car";
  if (value <= 12) return "Mid-size family car";
  return "High-performance vehicle";
}

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
              {/* Exposure */}
              <label className="block">
                <span className={LABEL_CLASS}>Policy duration (years)</span>
                <input
                  type="number"
                  min={0.01}
                  max={2.5}
                  step={0.01}
                  value={policy.Exposure}
                  onChange={(e) => update("Exposure", parseFloat(e.target.value) || 0)}
                  className={INPUT_CLASS}
                />
                <FieldHelper>How long the policy is in force — usually 1 year.</FieldHelper>
              </label>

              {/* Driver age */}
              <label className="block">
                <span className={LABEL_CLASS}>Driver&apos;s age</span>
                <input
                  type="number"
                  min={18}
                  max={100}
                  value={policy.DrivAge}
                  onChange={(e) => update("DrivAge", parseInt(e.target.value, 10) || 18)}
                  className={INPUT_CLASS}
                />
                <FieldHelper>Age of the main driver at policy start (18–100).</FieldHelper>
              </label>

              {/* Bonus-malus slider */}
              <label className="block sm:col-span-2">
                <span className={LABEL_CLASS}>Claims history (bonus-malus)</span>
                <div className="flex items-center justify-between font-mono text-sm">
                  <span className="text-faint">50</span>
                  <span className="font-semibold text-accent">{policy.BonusMalus}</span>
                  <span className="text-faint">350</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={350}
                  step={1}
                  value={policy.BonusMalus}
                  onChange={(e) => update("BonusMalus", parseInt(e.target.value, 10))}
                  className="mt-2 w-full accent-accent"
                />
                <FieldHelper>
                  {bonusMalusLabel(policy.BonusMalus)} — 50 is the best no-claims
                  discount, 100 is the base rate, higher means recent claims.
                </FieldHelper>
              </label>

              {/* Vehicle power slider */}
              <label className="block sm:col-span-2">
                <span className={LABEL_CLASS}>Engine power rating</span>
                <div className="flex items-center justify-between font-mono text-sm">
                  <span className="text-faint">1</span>
                  <span className="font-semibold text-accent">{policy.VehPower}</span>
                  <span className="text-faint">20</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  step={1}
                  value={policy.VehPower}
                  onChange={(e) => update("VehPower", parseInt(e.target.value, 10))}
                  className="mt-2 w-full accent-accent"
                />
                <FieldHelper>
                  {vehPowerLabel(policy.VehPower)} — the insurer&apos;s power class, 1 to 20.
                </FieldHelper>
              </label>

              {/* Vehicle age */}
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
                <FieldHelper>Age of the insured vehicle in years.</FieldHelper>
              </label>

              {/* Density dropdown */}
              <label className="block">
                <span className={LABEL_CLASS}>Where the car is kept</span>
                <select
                  value={policy.Density}
                  onChange={(e) => update("Density", parseInt(e.target.value, 10))}
                  className={INPUT_CLASS}
                >
                  {DENSITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-surface-2">
                      {option.label}
                    </option>
                  ))}
                </select>
                <FieldHelper>
                  {DENSITY_OPTIONS.find((option) => option.value === policy.Density)?.hint ??
                    "Population density of the area where the car is kept."}
                </FieldHelper>
              </label>

              {/* Vehicle brand */}
              <label className="block">
                <span className={LABEL_CLASS}>Vehicle brand group</span>
                <select
                  value={policy.VehBrand}
                  onChange={(e) => update("VehBrand", e.target.value)}
                  className={INPUT_CLASS}
                >
                  {BRAND_OPTIONS.map((brand) => (
                    <option key={brand.value} value={brand.value} className="bg-surface-2">
                      {brand.label}
                    </option>
                  ))}
                </select>
                <FieldHelper>Insurer brand group 1–14 — groups cars with similar claim profiles.</FieldHelper>
              </label>

              {/* Fuel type */}
              <label className="block">
                <span className={LABEL_CLASS}>Fuel type</span>
                <select
                  value={policy.VehGas}
                  onChange={(e) => update("VehGas", e.target.value)}
                  className={INPUT_CLASS}
                >
                  {GAS_OPTIONS.map((gas) => (
                    <option key={gas.value} value={gas.value} className="bg-surface-2">
                      {gas.label}
                    </option>
                  ))}
                </select>
                <FieldHelper>Petrol or diesel — affects claim frequency and severity.</FieldHelper>
              </label>

              {/* Area */}
              <label className="block">
                <span className={LABEL_CLASS}>Area type</span>
                <select
                  value={policy.Area}
                  onChange={(e) => update("Area", e.target.value)}
                  className={INPUT_CLASS}
                >
                  {AREA_OPTIONS.map((area) => (
                    <option key={area.value} value={area.value} className="bg-surface-2">
                      {area.label}
                    </option>
                  ))}
                </select>
                <FieldHelper>How built-up the area is — A is most rural, F is a metro core.</FieldHelper>
              </label>

              {/* Region */}
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
                <FieldHelper>Geographic rating region from the training dataset.</FieldHelper>
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
                    ["Frequency relativity", `${result.frequency_relativity.toFixed(3)}×`],
                    ["Severity relativity", `${result.severity_relativity.toFixed(3)}×`],
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