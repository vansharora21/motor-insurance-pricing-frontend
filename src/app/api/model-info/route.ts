import { NextResponse } from "next/server";

const PYTHON_API_BASE = process.env.PYTHON_API_BASE ?? "http://127.0.0.1:8000";

export async function GET() {
  try {
    const response = await fetch(`${PYTHON_API_BASE}/model-info`, {
      method: "GET",
      cache: "no-store",
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Could not reach the pricing backend. Is the Python API running? " +
          `(expected at ${PYTHON_API_BASE})`,
      },
      { status: 502 }
    );
  }
}