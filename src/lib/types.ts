// Shared TypeScript types matching the Python pricing backend outputs.
// Source of truth: genai-insurance-pricing/src/pricing_engine.py

export type RiskCategory = "Low" | "Medium" | "High";

/** Input policy attributes accepted by the pricing API. */
export interface PolicyInput {
  IDpol?: number;
  Exposure: number;
  VehPower: number;
  VehAge: number;
  DrivAge: number;
  BonusMalus: number;
  VehBrand: string;
  VehGas: string;
  Area: string;
  Density: number;
  Region: string;
}

/** Full scored output row produced by calculate_premium(). */
export interface ScoredPolicy extends PolicyInput {
  predicted_annual_frequency: number;
  predicted_claim_count: number;
  predicted_claim_severity: number;
  annualized_expected_loss: number;
  expected_loss: number;
  pure_premium: number;
  technical_premium: number;
  loaded_premium: number;
  final_premium: number;
  frequency_relativity: number;
  severity_relativity: number;
  risk_score: number;
  risk_category: RiskCategory;
}

/** Response for a single-policy prediction. */
export interface SinglePredictionResponse {
  policy: ScoredPolicy;
}

/** Response for a batch prediction. */
export interface BatchPredictionResponse {
  policies: ScoredPolicy[];
  summary: {
    total: number;
    risk_counts: Record<RiskCategory, number>;
    avg_premium: number;
    min_premium: number;
    max_premium: number;
  };
}

/** Model metadata surfaced by the backend (subset used by the UI). */
export interface ModelMetadata {
  random_seed?: number;
  numeric_defaults?: Record<string, number>;
  numeric_ranges?: Record<string, { min: number; max: number }>;
  categorical_options?: Record<string, string[]>;
  dataset_summary?: Record<string, number>;
  data_quality?: Record<string, number>;
  pricing_config?: Record<string, unknown>;
}

export interface ModelInfoResponse {
  metadata: ModelMetadata;
  metrics: {
    frequency?: Record<string, number>;
    severity?: Record<string, number>;
  };
}

export interface ApiError {
  error: string;
  detail?: string;
}