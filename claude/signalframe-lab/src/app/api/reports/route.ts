import { NextResponse } from "next/server";

import { createAnalysisArtifacts, normalizeInput } from "@/lib/analysis/engine";
import { slugify } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") ?? "report";
  const download = searchParams.get("download") === "1";

  const artifacts = createAnalysisArtifacts({
    target: searchParams.get("target") ?? undefined,
    focus: (searchParams.get("focus") ?? undefined) as
      | "first-impression"
      | "onboarding"
      | "activation"
      | "trust"
      | "pricing"
      | undefined,
    audience: searchParams.get("audience") ?? undefined,
    notes: searchParams.get("notes") ?? undefined,
  });

  const payload = mode === "job" ? artifacts.job : artifacts.report;

  if (!download) {
    return NextResponse.json(payload);
  }

  const filename =
    mode === "job" ?
      `${slugify(artifacts.input.target)}-analysis-job.json`
    : `${slugify(artifacts.report.productName)}-ux-report.json`;

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, string | undefined>;
  const input = normalizeInput({
    target: body.target,
    focus: body.focus as
      | "first-impression"
      | "onboarding"
      | "activation"
      | "trust"
      | "pricing"
      | undefined,
    audience: body.audience,
    notes: body.notes,
  });

  const artifacts = createAnalysisArtifacts(input);

  return NextResponse.json(artifacts);
}
