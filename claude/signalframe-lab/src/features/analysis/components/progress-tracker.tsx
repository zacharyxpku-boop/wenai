"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import { motion } from "motion/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AnalysisStage, ProductInput } from "@/lib/types/report";

export function ProgressTracker({
  input,
  stages,
  reportHref,
}: {
  input: ProductInput;
  stages: AnalysisStage[];
  reportHref: string;
}) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (complete) {
      const timer = window.setTimeout(() => {
        startTransition(() => {
          router.push(reportHref);
        });
      }, 900);

      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      setActiveIndex((current) => {
        if (current >= stages.length - 1) {
          setComplete(true);
          return current;
        }

        return current + 1;
      });
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [activeIndex, complete, reportHref, router, stages.length]);

  const progress = complete ? 100 : Math.round(((activeIndex + 1) / stages.length) * 100);
  const currentStage = stages[activeIndex] ?? stages[stages.length - 1];

  const notes = useMemo(
    () => [
      `Target: ${input.target}`,
      input.focus ? `Focus: ${input.focus.replace("-", " ")}` : "Focus: general first-use review",
      input.audience ? `Audience hint: ${input.audience}` : "Audience hint: inferred from product surface",
      "Mode: public signals + synthetic persona simulation",
    ],
    [input.audience, input.focus, input.target],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
        className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-sm md:p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge tone="accent">{complete ? "Report ready" : "Analysis in progress"}</Badge>
            <h1 className="mt-4 max-w-2xl text-balance text-3xl font-semibold text-[var(--foreground)] md:text-4xl">
              Building a synthetic UX readout for {input.target}
            </h1>
          </div>
          <div className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm font-medium tabular-nums text-[var(--foreground)]">
            {progress}% complete
          </div>
        </div>

        <div className="mt-8 rounded-full bg-[var(--surface)] p-1">
          <div
            className="h-2 rounded-full bg-[var(--accent)] transition-[width] duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-8 space-y-4">
          {stages.map((stage, index) => {
            const status =
              index < activeIndex || complete ? "done" : index === activeIndex ? "active" : "pending";

            return (
              <div
                key={stage.id}
                className="flex gap-4 rounded-[1.5rem] border border-[var(--line)] p-4 md:items-center md:p-5"
              >
                <div
                  className={
                    status === "done" ?
                      "flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                    : status === "active" ?
                      "flex size-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                    : "flex size-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--surface)] text-[var(--muted-foreground)]"
                  }
                >
                  {status === "done" ? (
                    <Check className="size-4" />
                  ) : status === "active" ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[var(--foreground)]">{stage.label}</p>
                  <p className="text-pretty text-sm leading-7 text-[var(--muted-foreground)]">
                    {stage.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      <motion.aside
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: "easeOut", delay: 0.04 }}
        className="space-y-6"
      >
        <section className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Current stage</p>
          <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">{currentStage.label}</h2>
          <p className="mt-3 text-pretty text-sm leading-7 text-[var(--muted-foreground)]">
            {currentStage.detail}
          </p>
        </section>

        <section className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6">
          <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Run context</p>
          <div className="mt-4 space-y-3">
            {notes.map((note) => (
              <div key={note} className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--foreground)]">
                {note}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Next</p>
          <p className="mt-3 text-pretty text-sm leading-7 text-[var(--muted-foreground)]">
            The report will open automatically as soon as synthesis is complete. You can also jump there manually.
          </p>
          <Button onClick={() => router.push(reportHref)} className="mt-5 w-full">
            Open report now
            <ArrowRight className="size-4" />
          </Button>
        </section>
      </motion.aside>
    </div>
  );
}
