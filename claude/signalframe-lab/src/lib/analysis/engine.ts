import { buildMockReport, createAnalysisJob } from "@/lib/mock/report-factory";
import type { FocusArea, ProductInput } from "@/lib/types/report";

function firstOf(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function normalizeInput(input: Partial<ProductInput>): ProductInput {
  return {
    target: input.target?.trim() || "Linear",
    focus: input.focus,
    audience: input.audience?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
  };
}

export function inputFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): ProductInput {
  return normalizeInput({
    target: firstOf(searchParams.target),
    focus: firstOf(searchParams.focus) as FocusArea | undefined,
    audience: firstOf(searchParams.audience),
    notes: firstOf(searchParams.notes),
  });
}

export function createAnalysisArtifacts(input: Partial<ProductInput>) {
  const normalized = normalizeInput(input);

  return {
    input: normalized,
    job: createAnalysisJob(normalized),
    report: buildMockReport(normalized),
  };
}
