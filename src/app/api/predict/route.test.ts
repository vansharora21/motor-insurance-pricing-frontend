import { afterEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";
import { POST } from "./route";

// Mock next/server so the route handler runs in a plain jsdom environment.
vi.mock("next/server", () => {
  return {
    NextRequest: class NextRequest extends Request {
      constructor(input: string | URL, init?: RequestInit) {
        super(input, init);
      }
    },
    NextResponse: {
      json: (body: unknown, init?: { status?: number }) =>
        new Response(JSON.stringify(body), {
          status: init?.status ?? 200,
          headers: { "Content-Type": "application/json" },
        }),
    },
  };
});

function makeRequest(body: unknown): NextRequest {
  return new Request("http://localhost/api/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as NextRequest;
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  return (await response.json()) as Record<string, unknown>;
}

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.PYTHON_API_BASE;
});

describe("POST /api/predict (proxy route)", () => {
  it("forwards the request body to the Python backend", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ policy: { final_premium: 999 } }), { status: 200 }));

    const response = await POST(makeRequest({ policy: {}, consent: true }));

    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/predict",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policy: {}, consent: true }),
      })
    );
    expect(response.status).toBe(200);
    expect(await readJson(response)).toEqual({ policy: { final_premium: 999 } });
  });

  it("passes through backend error statuses and bodies", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ detail: "DrivAge must be at most 100" }), { status: 422 })
    );

    const response = await POST(makeRequest({ policy: {} }));

    expect(response.status).toBe(422);
    expect(await readJson(response)).toEqual({ detail: "DrivAge must be at most 100" });
  });

  it("returns 502 with a friendly message when the backend is unreachable", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("fetch failed"));

    const response = await POST(makeRequest({ policy: {} }));

    expect(response.status).toBe(502);
    const body = await readJson(response);
    expect(body).toMatchObject({ error: expect.stringContaining("Could not reach the pricing backend") });
    expect(String(body.error)).toContain("http://127.0.0.1:8000");
  });

  it("respects a custom PYTHON_API_BASE environment variable", async () => {
    process.env.PYTHON_API_BASE = "https://pricing.internal.example";
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await POST(makeRequest({ policy: {} }));

    expect(fetchMock).toHaveBeenCalledWith(
      "https://pricing.internal.example/predict",
      expect.anything()
    );
  });
});