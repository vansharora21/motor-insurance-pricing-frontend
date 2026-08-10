"use client";

import { useState } from "react";
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

const RISK_STYLES: Record<string, string> = {
  Low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  High: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

function formatEuro(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(value);
}

export default function SingleQuotePage() {
  const [policy, setPolicy] = useState<PolicyInput>(DEFAULT_POLICY);
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
      const response = await predictSingle(policy);
      setResult(response.policy);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Single customer quote</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Enter the policyholder&apos;s details below. The pricing engine will score the policy with
          the saved frequency and severity models.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Exposure (years)</span>
              <input
                type="number"
                min={0.01}
                max={2.5}
                step={0.01}
                value={policy.Exposure}
                onChange={(e) => update("Exposure", parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Driver age</span>
              <input
                type="number"
                min={18}
                max={100}
                value={policy.DrivAge}
                onChange={(e) => update("DrivAge", parseInt(e.target.value, 10) || 18)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Bonus-Malus</span>
              <input
                type="number"
                min={50}
                max={350}
                value={policy.BonusMalus}
                onChange={(e) => update("BonusMalus", parseInt(e.target.value, 10) || 50)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Vehicle power</span>
              <input
                type="number"
                min={1}
                max={20}
                value={policy.VehPower}
                onChange={(e) => update("VehPower", parseInt(e.target.value, 10) || 1)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Vehicle age (years)</span>
              <input
                type="number"
                min={0}
                max={100}
                value={policy.VehAge}
                onChange={(e) => update("VehAge", parseInt(e.target.value, 10) || 0)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Population density</span>
              <input
                type="number"
                min={0}
                max={27000}
                value={policy.Density}
                onChange={(e) => update("Density", parseInt(e.target.value, 10) || 0)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Vehicle brand</span>
              <select
                value={policy.VehBrand}
                onChange={(e) => update("VehBrand", e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              >
                {BRAND_OPTIONS.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Fuel type</span>
              <select
                value={policy.VehGas}
                onChange={(e) => update("VehGas", e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              >
                {GAS_OPTIONS.map((gas) => (
                  <option key={gas} value={gas}>{gas}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Area</span>
              <select
                value={policy.Area}
                onChange={(e) => update("Area", e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              >
                {AREA_OPTIONS.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Region</span>
              <select
                value={policy.Region}
                onChange={(e) => update("Region", e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              >
                {REGION_OPTIONS.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </label>
          </div>

          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Calculating premium…" : "Predict Premium"}
          </button>
        </form>

        {/* Result */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          {!result ? (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center text-zinc-400">
              <span className="text-4xl">📋</span>
              <p className="mt-4 max-w-xs text-sm">
                Fill in the policy attributes and click <strong>Predict Premium</strong> to see the
                pricing breakdown here.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Pricing result</h2>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${RISK_STYLES[result.risk_category]}`}>
                  {result.risk_category} risk
                </span>
              </div>

              <div className="mt-6 rounded-xl bg-blue-50 p-6 text-center dark:bg-blue-950">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Final premium</p>
                <p className="mt-1 text-4xl font-bold text-blue-700 dark:text-blue-300">
                  {formatEuro(result.final_premium)}
                </p>
                <p className="mt-1 text-xs text-blue-600/70 dark:text-blue-400/70">per policy term</p>
              </div>

              <dl className="mt-6 space-y-3 text-sm">
                {[
                  ["Predicted frequency", `${result.predicted_annual_frequency.toFixed(4)} claims/yr`],
                  ["Predicted severity", formatEuro(result.predicted_claim_severity)],
                  ["Expected loss", formatEuro(result.expected_loss)],
                  ["Pure premium", formatEuro(result.pure_premium)],
                  ["Technical premium", formatEuro(result.technical_premium)],
                  ["Risk score", result.risk_score.toFixed(1)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
                    <dt className="text-zinc-500 dark:text-zinc-400">{label}</dt>
                    <dd className="font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}