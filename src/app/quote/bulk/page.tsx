"use client";

import { useRef, useState } from "react";
import { predictBatch } from "@/lib/api";
import type { BatchPredictionResponse, PolicyInput } from "@/lib/types";

const REQUIRED_COLUMNS = [
  "Exposure", "VehPower", "VehAge", "DrivAge", "BonusMalus",
  "VehBrand", "VehGas", "Area", "Density", "Region",
];

const RISK_STYLES: Record<string, string> = {
  Low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  High: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

function formatEuro(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(value);
}

/** Minimal CSV parser that handles quoted fields and commas inside quotes. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  row.push(field);
  if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  return rows;
}

function csvToPolicies(text: string): { policies: PolicyInput[]; errors: string[] } {
  const rows = parseCsv(text);
  if (rows.length < 2) {
    return { policies: [], errors: ["CSV must contain a header row and at least one data row."] };
  }

  const header = rows[0].map((cell) => cell.trim());
  const missing = REQUIRED_COLUMNS.filter((column) => !header.includes(column));
  if (missing.length > 0) {
    return {
      policies: [],
      errors: [`CSV is missing required columns: ${missing.join(", ")}`],
    };
  }

  const policies: PolicyInput[] = [];
  const errors: string[] = [];

  for (let i = 1; i < rows.length; i++) {
    const values = rows[i];
    const record: Record<string, string> = {};
    header.forEach((column, index) => {
      record[column] = (values[index] ?? "").trim();
    });

    const policy: PolicyInput = {
      Exposure: parseFloat(record.Exposure),
      VehPower: parseInt(record.VehPower, 10),
      VehAge: parseInt(record.VehAge, 10),
      DrivAge: parseInt(record.DrivAge, 10),
      BonusMalus: parseInt(record.BonusMalus, 10),
      VehBrand: record.VehBrand,
      VehGas: record.VehGas,
      Area: record.Area,
      Density: parseInt(record.Density, 10),
      Region: record.Region,
    };

    if (record.IDpol) policy.IDpol = parseInt(record.IDpol, 10);

    const invalid = Object.entries(policy).some(
      ([key, value]) => typeof value === "number" && Number.isNaN(value)
    );
    if (invalid) {
      errors.push(`Row ${i + 1}: contains non-numeric values.`);
      continue;
    }
    policies.push(policy);
  }

  return { policies, errors };
}

export default function BulkUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [policies, setPolicies] = useState<PolicyInput[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
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
      const response = await predictBatch(policies);
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
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Bulk upload</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Upload a CSV of policies. Required columns:{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
            Exposure, VehPower, VehAge, DrivAge, BonusMalus, VehBrand, VehGas, Area, Density, Region
          </code>
          . <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">IDpol</code> is optional.
        </p>
      </div>

      {/* Upload card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
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
          className="w-full rounded-xl border-2 border-dashed border-zinc-300 p-10 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/50 dark:border-zinc-700 dark:hover:border-blue-600 dark:hover:bg-blue-950/30"
        >
          <span className="text-3xl">📁</span>
          <p className="mt-3 font-medium">{fileName ?? "Click to choose a CSV file"}</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {fileName ? "Click again to choose a different file" : "Only .csv files are accepted"}
          </p>
        </button>

        {parseErrors.length > 0 && (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
            <p className="font-semibold">CSV issues:</p>
            <ul className="mt-1 list-inside list-disc">
              {parseErrors.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </div>
        )}

        {policies.length > 0 && (
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              <strong>{policies.length}</strong> valid polic{policies.length === 1 ? "y" : "ies"} parsed
              {parseErrors.length > 0 && ` · ${parseErrors.length} row(s) skipped`}
            </p>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-full bg-blue-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Scoring policies…" : "Score Policies"}
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">Results — {result.summary.total} policies scored</h2>
            <button
              type="button"
              onClick={downloadResults}
              className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              ⬇ Download CSV
            </button>
          </div>

          {/* Summary cards */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs font-medium text-zinc-500">Low risk</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{result.summary.risk_counts.Low}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs font-medium text-zinc-500">Medium risk</p>
              <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">{result.summary.risk_counts.Medium}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs font-medium text-zinc-500">High risk</p>
              <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">{result.summary.risk_counts.High}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs font-medium text-zinc-500">Avg premium</p>
              <p className="mt-1 text-2xl font-bold">{formatEuro(result.summary.avg_premium)}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs font-medium text-zinc-500">Premium range</p>
              <p className="mt-1 text-sm font-bold">
                {formatEuro(result.summary.min_premium)} – {formatEuro(result.summary.max_premium)}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Frequency</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Expected loss</th>
                  <th className="px-4 py-3">Final premium</th>
                  <th className="px-4 py-3">Risk</th>
                </tr>
              </thead>
              <tbody>
                {result.policies.map((policy, index) => (
                  <tr key={index} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                    <td className="px-4 py-3 font-mono text-xs">{policy.IDpol ?? index + 1}</td>
                    <td className="px-4 py-3">{policy.predicted_annual_frequency.toFixed(4)}</td>
                    <td className="px-4 py-3">{formatEuro(policy.predicted_claim_severity)}</td>
                    <td className="px-4 py-3">{formatEuro(policy.expected_loss)}</td>
                    <td className="px-4 py-3 font-semibold">{formatEuro(policy.final_premium)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${RISK_STYLES[policy.risk_category]}`}>
                        {policy.risk_category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}