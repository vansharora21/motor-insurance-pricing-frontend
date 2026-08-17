import { afterEach, describe, expect, it, vi } from "vitest";
import { predictBatch, predictSingle } from "./api";
import type { PolicyInput } from "./types";

const POLICY: PolicyInput = {
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
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("predictSingle", () => {
  it("posts the policy and consent to /api/predict", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse({ policy: { final_premium: 1234 } }));

    const result = await predictSingle(POLICY, true);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/predict",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ policy: POLICY, consent: true }),
      })
    );
    expect(result.policy.final_premium).toBe(1234);
  });

  it("throws the backend error message on a non-OK response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ error: "DrivAge must be at most 100" }, 422)
    );

    await expect(predictSingle(POLICY)).rejects.toThrow("DrivAge must be at most 100");
  });

  it("falls back to the detail field when error is absent", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ detail: "Validation failed" }, 422)
    );

    await expect(predictSingle(POLICY)).rejects.toThrow("Validation failed");
  });

  it("falls back to a status message when the body is not JSON", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Internal Server Error", { status: 500 })
    );

    await expect(predictSingle(POLICY)).rejects.toThrow("Request failed with status 500");
  });
});

describe("predictBatch", () => {
  it("posts the policy list to /api/predict/batch", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse({ policies: [], summary: { total: 0 } }));

    await predictBatch([POLICY], false);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/predict/batch",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ policies: [POLICY], consent: false }),
      })
    );
  });

  it("surfaces backend errors to the caller", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ error: "Batch too large" }, 413)
    );

    await expect(predictBatch([POLICY])).rejects.toThrow("Batch too large");
  });
});