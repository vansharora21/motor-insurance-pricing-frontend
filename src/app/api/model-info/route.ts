import { NextResponse } from "next/server";

function pythonApiBase(): string {
  return process.env.PYTHON_API_BASE ?? "http://127.0.0.1:8000";
}

export async function GET() {
  try {
    const base = pythonApiBase();
    const response = await fetch(`${base}/model-info`, {
      method: "GET",
      cache: "no-store",
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      {
        error:
          "Could not reach the pricing backend. Is the Python API running? " +
          `(expected at ${pythonApiBase()})`,
      },
      { status: 502 }
    );
  }
}