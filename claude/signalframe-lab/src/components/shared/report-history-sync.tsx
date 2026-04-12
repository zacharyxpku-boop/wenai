"use client";

import { useEffect } from "react";

import type { RecentReportSummary, Report } from "@/lib/types/report";

const STORAGE_KEY = "signalframe-recent-reports";

export function ReportHistorySync({
  report,
  href,
}: {
  report: Report;
  href: string;
}) {
  useEffect(() => {
    const summary: RecentReportSummary = {
      id: report.id,
      target: report.input.target,
      productName: report.productName,
      readinessScore: report.readinessScore,
      readinessLabel: report.readinessLabel,
      focus: report.input.focus,
      createdAt: report.createdAt,
      href,
    };

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as RecentReportSummary[]) : [];
      const deduped = [summary, ...parsed.filter((item) => item.href !== href)].slice(0, 6);

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped));
    } catch {
      return;
    }
  }, [href, report]);

  return null;
}
