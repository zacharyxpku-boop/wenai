"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import type { RecentReportSummary } from "@/lib/types/report";
import { formatDate } from "@/lib/utils";

const STORAGE_KEY = "signalframe-recent-reports";

function readStoredReports() {
  try {
    if (typeof window === "undefined") {
      return [];
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentReportSummary[]) : [];
  } catch {
    return [];
  }
}

export function RecentAnalyses() {
  const items = useSyncExternalStore(
    () => () => undefined,
    readStoredReports,
    () => [],
  );

  if (items.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-[var(--line)] bg-[var(--surface)] p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl border border-[var(--line)] bg-white">
            <Clock3 className="size-4 text-[var(--muted-foreground)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">No recent analyses yet</p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Run one report and it will appear here for quick re-entry.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {items.map((item) => (
        <article key={item.href} className="rounded-[2rem] border border-[var(--line)] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge tone="neutral">{item.focus ? item.focus.replace("-", " ") : "general review"}</Badge>
            <Badge tone="accent">{item.readinessScore}/100</Badge>
          </div>
          <h3 className="mt-4 text-xl font-semibold text-[var(--foreground)]">{item.productName}</h3>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">Source: {item.target}</p>
          <p className="mt-4 text-pretty text-sm leading-7 text-[var(--muted-foreground)]">
            {item.readinessLabel}. Last opened {formatDate(item.createdAt)}.
          </p>
          <Link href={item.href} className={buttonStyles({ variant: "secondary", size: "default", className: "mt-5 w-full" })}>
            Reopen report
          </Link>
        </article>
      ))}
    </div>
  );
}
