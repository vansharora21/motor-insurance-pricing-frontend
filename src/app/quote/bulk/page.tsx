"use client";

import { useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle,
  DownloadSimple,
  UploadSimple,
} from "@phosphor-icons/react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { predictBatch } from "@/lib/api";
import { csvToPolicies, REQUIRED_COLUMNS } from "@/lib/csv";
import type { BatchPredictionResponse, PolicyInput } from "@/lib/types";

/** One-line definition for each required CSV column (mirrors the single-form helpers). */
const COLUMN_GLOSSARY: Record<string, string> = {
  Exposure: "How long each policy is in force — usually 1 year.",
  VehPower: "Insurer's engine power class, 1 to 20.",
  VehAge: "Age of the insured vehicle in years.",
  DrivAge: "Age of the main driver at policy start (18–100).",
  BonusMalus: "Claims history coefficient — 50 is best, 100 is base, higher means recent claims.",
  VehBrand: "Insurer brand group B1–B14 — groups cars with similar claim profiles.",
  VehGas: "Fuel type — Regular (petrol) or Diesel.",
  Area: "How built-up the area is — A is most rural, F is a metro core.",
  Density: "Population density of the area where the car is kept.",
  Region: "Geographic rating region from the training dataset.",
};

const RISK_COLORS: Record<string, string> = {
  Low: "#2ee6a8",
  Medium: "#f5b84b",
  High: "#f26d5b",
};

const RISK_STYLES: Record<string, string> = {
  Low: "border-low/30 bg-low/10 text-low",
  Medium: "border-medium/30 bg-medium/10 text-medium",
  High: "border-high/30 bg-high/10 text-high",
};

function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

export default function BulkUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [policies, setPolicies] = useState<PolicyInput[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [result, setResult] = useState<BatchPredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File) {
    setFileName(file.name);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const parsed = csvToPolicies(text);
      setPolicies(parsed.policies);
      setParseErrors(parsed.errors);
    };
    reader.readAsText(file);
  }

  async function handleSubmit() {
    if (policies.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const response = await predictBatch(policies, consent);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Batch prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function downloadResults() {
    if (!result) return;
    const rows = result.policies.map((policy) =>
      [
        policy.IDpol ?? "",
        policy.Exposure, policy.VehPower, policy.VehAge, policy.DrivAge,
        policy.BonusMalus, policy.VehBrand, policy.VehGas, policy.Area,
        policy.Density, policy.Region,
        policy.predicted_annual_frequency, policy.predicted_claim_count,
        policy.predicted_claim_severity, policy.annualized_expected_loss,
        policy.expected_loss, policy.pure_premium, policy.technical_premium,
        policy.final_premium, policy.risk_score, policy.risk_category,
      ].join(",")
    );
    const header = [
      "IDpol", "Exposure", "VehPower", "VehAge", "DrivAge", "BonusMalus",
      "VehBrand", "VehGas", "Area", "Density", "Region",
      "predicted_annual_frequency", "predicted_claim_count", "predicted_claim_severity",
      "annualized_expected_loss", "expected_loss", "pure_premium", "technical_premium",
      "final_premium", "risk_score", "risk_category",
    ].join(",");
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "batch_predictions.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pb-28 pt-36">
      <div className="mb-12">
        <p className="mono-label text-accent">Quote · Batch</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Portfolio upload</h1>
        <p className="mt-3 max-w-[52ch] text-muted">
          Upload a CSV of policies. Required columns:{" "}
          <code className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-accent">
            Exposure, VehPower, VehAge, DrivAge, BonusMalus, VehBrand, VehGas, Area, Density, Region
          </code>
          . <code className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-accent">IDpol</code> is optional.
        </p>

        {/* Column glossary */}
        <div className="mt-6 rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <p className="mono-label text-faint">What each column means</p>
          <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {REQUIRED_COLUMNS.map((column) => (
              <div key={column} className="flex items-baseline gap-3">
                <dt className="shrink-0 font-mono text-xs font-semibold text-accent">{column}</dt>
                <dd className="text-xs leading-relaxed text-muted">{COLUMN_GLOSSARY[column]}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Upload card */}
      <div className="bezel">
        <div className="bezel-inner p-6 sm:p-8">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line-strong bg-surface-2/40 px-6 py-14 text-center transition-colors hover:border-accent/50 hover:bg-accent-dim/40"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-surface-2 text-muted transition-colors group-hover:border-accent/40 group-hover:text-accent">
              <UploadSimple size={26} weight="duotone" />
            </span>
            <p className="mt-5 text-base font-semibold text-text">
              {fileName ?? "Choose a CSV file"}
            </p>
            <p className="mt-1.5 font-mono text-xs text-faint">
              {fileName ? "Click again to choose a different file" : "Only .csv files are accepted"}
            </p>
          </button>

          {parseErrors.length > 0 && (
            <div className="mt-6 rounded-lg border border-medium/30 bg-medium/10 p-4 text-sm text-medium">
              <p className="font-semibold">CSV issues:</p>
              <ul className="mt-1.5 list-inside list-disc space-y-0.5">
                {parseErrors.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          {policies.length > 0 && (
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-sm text-muted">
                <span className="font-semibold text-accent">{policies.length}</span> valid polic
                {policies.length === 1 ? "y" : "ies"} parsed
                {parseErrors.length > 0 && (
                  <span className="text-medium"> · {parseErrors.length} row(s) skipped</span>
                )}
              </p>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-ink transition-all hover:bg-accent-strong active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  "Scoring policies…"
                ) : (
                  <>
                    Score policies
                    <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
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
              I agree to these anonymized quotes being stored to help improve pricing research.
              No personal information is collected.
            </span>
          </label>
        </div>
      </div>

      {/* Errors */}
      {error && (
        <div className="mt-6 rounded-lg border border-high/30 bg-high/10 p-4 text-sm text-high">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="mt-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mono-label text-accent">Results</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                {result.summary.total} policies scored
              </h2>
            </div>
            <button
              type="button"
              onClick={downloadResults}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-line-strong px-5 py-2.5 text-sm font-semibold text-text transition-colors hover:border-accent/50 hover:text-accent"
            >
              <DownloadSimple size={16} weight="bold" />
              Download CSV
            </button>
          </div>

          {/* Summary cards */}
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
            {[
              { label: "Low risk", value: String(result.summary.risk_counts.Low), color: "text-low" },
              { label: "Medium risk", value: String(result.summary.risk_counts.Medium), color: "text-medium" },
              { label: "High risk", value: String(result.summary.risk_counts.High), color: "text-high" },
              { label: "Avg premium", value: formatINR(result.summary.avg_premium), color: "text-text" },
              { label: "Premium range", value: `${formatINR(result.summary.min_premium)} – ${formatINR(result.summary.max_premium)}`, color: "text-text" },
            ].map((card) => (
              <div key={card.label} className="rounded-2xl border border-line bg-surface p-5">
                <p className="mono-label text-faint">{card.label}</p>
                <p className={`mt-2 font-mono text-xl font-semibold sm:text-2xl ${card.color}`}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          {/* Risk distribution chart */}
          <div className="mt-8 rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <p className="mono-label text-faint">Risk distribution</p>
            <div className="mt-4 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={["Low", "Medium", "High"].map((category) => ({
                    category,
                    count: result.summary.risk_counts[category as keyof typeof result.summary.risk_counts],
                  }))}
                  margin={{ top: 8, right: 8, bottom: 0, left: -18 }}
                >
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="category"
                    tick={{ fill: "#8ca09a", fontSize: 12, fontFamily: "var(--font-mono)" }}
                    axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "#5c6f68", fontSize: 11, fontFamily: "var(--font-mono)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    contentStyle={{
                      background: "#161e19",
                      border: "1px solid rgba(255,255,255,0.16)",
                      borderRadius: 12,
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "#edf2ef",
                    }}
                    labelStyle={{ color: "#8ca09a", marginBottom: 4 }}
                  />
                  <Bar dataKey="count" name="Policies" radius={[6, 6, 0, 0]} maxBarSize={56}>
                    {["Low", "Medium", "High"].map((category) => (
                      <Cell key={category} fill={RISK_COLORS[category]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table */}
          <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-ink-2">
                <tr>
                  {["ID", "Frequency", "Severity", "Expected loss", "Final premium", "Risk"].map((heading) => (
                    <th key={heading} className="mono-label px-5 py-4 font-medium text-faint">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.policies.map((policy, index) => (
                  <tr key={index} className="border-b border-line last:border-0 hover:bg-surface-2/60">
                    <td className="px-5 py-3.5 font-mono text-xs text-faint">{policy.IDpol ?? index + 1}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted">
                      {policy.predicted_annual_frequency.toFixed(4)}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted">
                      {formatINR(policy.predicted_claim_severity)}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted">
                      {formatINR(policy.expected_loss)}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-sm font-semibold text-text">
                      {formatINR(policy.final_premium)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-semibold ${RISK_STYLES[policy.risk_category]}`}>
                        {policy.risk_category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center gap-2.5 rounded-lg border border-low/25 bg-low/10 px-4 py-3">
            <CheckCircle size={18} weight="duotone" className="shrink-0 text-low" />
            <p className="text-xs leading-relaxed text-muted">
              Scored by the deployed Poisson + Gamma models on 783,573 policies.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}