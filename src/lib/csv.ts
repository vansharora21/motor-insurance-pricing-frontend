import type { PolicyInput } from "./types";

/** CSV columns required by the pricing API — headers must match exactly. */
export const REQUIRED_COLUMNS = [
  "Exposure", "VehPower", "VehAge", "DrivAge", "BonusMalus",
  "VehBrand", "VehGas", "Area", "Density", "Region",
] as const;

/** Minimal CSV parser that handles quoted fields and commas inside quotes. */
export function parseCsv(text: string): string[][] {
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

/** Parse a CSV string into PolicyInput records, collecting per-row errors. */
export function csvToPolicies(text: string): { policies: PolicyInput[]; errors: string[] } {
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
      ([, value]) => typeof value === "number" && Number.isNaN(value)
    );
    if (invalid) {
      errors.push(`Row ${i + 1}: contains non-numeric values.`);
      continue;
    }
    policies.push(policy);
  }

  return { policies, errors };
}