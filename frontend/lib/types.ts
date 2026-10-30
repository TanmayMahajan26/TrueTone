/**
 * TypeScript interfaces mirroring backend Pydantic schemas.
 * These types ensure type safety across the frontend and establish
 * contracts with the backend API.
 */

/**
 * Aspect-level sentiment analysis result.
 */
export interface AspectSentiment {
  aspect: string;
  sentiment: 0 | 1;
  confidence: number;
}

/**
 * Model ids the backend can serve. "transformer" is only present when the
 * deployment has the fine-tuned model configured; ask GET /models.
 */
export type ModelId = "lr" | "nb" | "transformer";

/**
 * One entry of GET /models.
 */
export interface ModelInfo {
  id: ModelId;
  name: string;
  is_default: boolean;
  /** True when confidence is a temperature-scaled probability. */
  calibrated: boolean;
  temperature?: number | null;
  base_model?: string | null;
}

export interface ModelsResponse {
  models: ModelInfo[];
}

/**
 * Request body for POST /predict endpoint.
 */
export interface PredictRequest {
  review: string;
  model?: ModelId;
}

/**
 * One piece of the original review text and how much it pushed the verdict.
 * weight > 0 pushes toward positive, < 0 toward negative, scaled to [-1, 1].
 */
export interface TokenWeight {
  text: string;
  weight: number;
}

export interface TermWeight {
  term: string;
  weight: number;
}

/** Word-level explanation; only the TF-IDF models provide one. */
export interface Explanation {
  segments: TokenWeight[];
  top_positive: TermWeight[];
  top_negative: TermWeight[];
}

/**
 * Response from POST /predict endpoint.
 * Contains overall sentiment, aspects, trust score, and reliability flags.
 */
export interface PredictResponse {
  sentiment: 0 | 1;
  confidence: number;
  reliability: "HIGH" | "MEDIUM" | "LOW";
  aspects: AspectSentiment[];
  trust_score: number;
  flags: string[];
  model_used: ModelId;
  explanation?: Explanation | null;
}

/**
 * Summary statistics about the training dataset.
 */
export interface DatasetSummary {
  total_reviews: number;
  positive_count: number;
  negative_count: number;
  positive_percentage: number;
  negative_percentage: number;
  source: string;
}

/**
 * Performance metrics for a single ML model.
 */
export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  auc: number;
  name: string;
  is_default: boolean;
}

/**
 * Distribution of prediction confidence levels across the dataset.
 */
export interface ReliabilitySummary {
  high_confidence_percentage: number;
  medium_confidence_percentage: number;
  low_confidence_percentage: number;
}

/**
 * Response from GET /stats endpoint.
 * Contains dataset summary, model metrics, and reliability breakdowns.
 */
export interface StatsResponse {
  dataset_summary: DatasetSummary;
  models: Record<string, ModelMetrics>;
  reliability_summary: ReliabilitySummary;
  failure_modes: Record<string, number>;
  total_reviews: number;
  avg_confidence: number;
}

/**
 * Derived data used by the dashboard components.
 */
export interface DashboardStats {
  totalReviews: number;
  positivePercentage: number;
  negativePercentage: number;
  datasetSource: string;
  positiveCount: number;
  negativeCount: number;
  models: Array<{
    name: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1: number;
    is_default: boolean;
  }>;
  reliability: {
    high: number;
    medium: number;
    low: number;
  };
  failureTypes: Record<string, number>;
}

/**
 * A single review item in batch processing results.
 */
export interface BatchReviewItem {
  review: string;
  confidence: number;
}

/**
 * Response from POST /batch endpoint.
 * Contains batch processing statistics and identified concerns/praised items.
 */
export interface BatchResponse {
  total: number;
  processed: number;
  skipped: number;
  sentiment_distribution: Record<string, number>;
  avg_confidence: number;
  top_complaints: BatchReviewItem[];
  top_praised: BatchReviewItem[];
  suspicious_count: number;
  reliability_breakdown: Record<string, number>;
  model_used?: string;
  results?: BatchRowResult[];
}

/** One analyzed CSV row, used for exporting batch results. */
export interface BatchRowResult {
  row: number;
  review: string;
  sentiment: 0 | 1;
  confidence: number;
  reliability: "HIGH" | "MEDIUM" | "LOW";
  trust_score: number;
  flags: string[];
}
