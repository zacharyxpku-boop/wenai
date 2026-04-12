import type { ConfidenceLevel, RiskLevel, Verdict } from "@/lib/types/report";

export function riskLabel(level: RiskLevel) {
  switch (level) {
    case "critical":
      return "Critical";
    case "high":
      return "High";
    case "medium":
      return "Moderate";
    case "low":
    default:
      return "Low";
  }
}

export function verdictLabel(verdict: Verdict) {
  switch (verdict) {
    case "champion":
      return "Would advocate";
    case "proceed":
      return "Would continue";
    case "hesitant":
      return "Proceeds with doubt";
    case "drop":
    default:
      return "Likely to drop";
  }
}

export function confidenceLabel(level: ConfidenceLevel) {
  switch (level) {
    case "high":
      return "High confidence";
    case "medium":
      return "Moderate confidence";
    case "directional":
    default:
      return "Directional";
  }
}

export function metricTone(value: number) {
  if (value >= 72) {
    return "positive";
  }

  if (value >= 48) {
    return "caution";
  }

  return "risk";
}
