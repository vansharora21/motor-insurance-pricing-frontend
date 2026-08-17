import { describe, expect, it } from "vitest";
import { csvToPolicies, parseCsv, REQUIRED_COLUMNS } from "./csv";

const VALID_CSV = [
  "Exposure,VehPower,VehAge,DrivAge,BonusMalus,VehBrand,VehGas,Area,Density,Region",
  "1,6,6,40,60,B12,Regular,C,1000,Centre",
  "0.5,10,3,55,80,B5,Diesel,B,300,Bretagne",
].join("\n");

describe("parseCsv", () => {
  it("splits rows and fields", () => {
    const rows = parseCsv("a,b,c\n1,2,3");
    expect(rows).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
    ]);
  });

  it("keeps commas inside quoted fields", () => {
    const rows = parseCsv('a,"b,c",d\n1,2,3');
    expect(rows[0]).toEqual(["a", "b,c", "d"]);
  });

  it("handles escaped double quotes", () => {
    const rows = parseCsv('a,"say ""hi""",c');
    expect(rows[0]).toEqual(["a", 'say "hi"', "c"]);
  });

  it("handles CRLF line endings", () => {
    const rows = parseCsv("a,b\r\n1,2\r\n");
    expect(rows).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("skips blank lines", () => {
    const rows = parseCsv("a,b\n\n1,2\n\n");
    expect(rows).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });
});

describe("csvToPolicies", () => {
  it("parses a valid CSV into policies", () => {
    const { policies, errors } = csvToPolicies(VALID_CSV);
    expect(errors).toEqual([]);
    expect(policies).toHaveLength(2);
    expect(policies[0]).toMatchObject({
      Exposure: 1,
      VehPower: 6,
      VehAge: 6,
      DrivAge: 40,
      BonusMalus: 60,
      VehBrand: "B12",
      VehGas: "Regular",
      Area: "C",
      Density: 1000,
      Region: "Centre",
    });
  });

  it("reads the optional IDpol column", () => {
    const csv = [
      "IDpol,Exposure,VehPower,VehAge,DrivAge,BonusMalus,VehBrand,VehGas,Area,Density,Region",
      "42,1,6,6,40,60,B12,Regular,C,1000,Centre",
    ].join("\n");
    const { policies } = csvToPolicies(csv);
    expect(policies[0].IDpol).toBe(42);
  });

  it("rejects a CSV with no data rows", () => {
    const { policies, errors } = csvToPolicies("Exposure,VehPower");
    expect(policies).toEqual([]);
    expect(errors[0]).toMatch(/header row and at least one data row/);
  });

  it("reports missing required columns", () => {
    const csv = "Exposure,VehPower\n1,6";
    const { policies, errors } = csvToPolicies(csv);
    expect(policies).toEqual([]);
    expect(errors[0]).toMatch(/missing required columns/);
    expect(errors[0]).toContain("DrivAge");
  });

  it("flags rows with non-numeric values and skips them", () => {
    const csv = [
      "Exposure,VehPower,VehAge,DrivAge,BonusMalus,VehBrand,VehGas,Area,Density,Region",
      "1,6,6,40,60,B12,Regular,C,1000,Centre",
      "1,6,6,forty,60,B12,Regular,C,1000,Centre",
    ].join("\n");
    const { policies, errors } = csvToPolicies(csv);
    expect(policies).toHaveLength(1);
    expect(errors).toEqual(["Row 3: contains non-numeric values."]);
  });

  it("tolerates extra columns beyond the required set", () => {
    const csv = [
      "Exposure,VehPower,VehAge,DrivAge,BonusMalus,VehBrand,VehGas,Area,Density,Region,Extra",
      "1,6,6,40,60,B12,Regular,C,1000,Centre,whatever",
    ].join("\n");
    const { policies, errors } = csvToPolicies(csv);
    expect(errors).toEqual([]);
    expect(policies).toHaveLength(1);
  });

  it("exposes the exact required column names", () => {
    expect(REQUIRED_COLUMNS).toEqual([
      "Exposure", "VehPower", "VehAge", "DrivAge", "BonusMalus",
      "VehBrand", "VehGas", "Area", "Density", "Region",
    ]);
  });
});