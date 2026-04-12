"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";

import { Button, buttonStyles } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn, slugify } from "@/lib/utils";

const EXAMPLES = ["Linear", "Figma", "Notion", "https://stripe.com"];

const FOCUS_OPTIONS = [
  { value: "", label: "General first-use review" },
  { value: "first-impression", label: "First impression" },
  { value: "onboarding", label: "Onboarding" },
  { value: "activation", label: "Activation" },
  { value: "trust", label: "Trust" },
  { value: "pricing", label: "Pricing" },
] as const;

export function AnalysisForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [target, setTarget] = useState("");
  const [focus, setFocus] = useState("");
  const [audience, setAudience] = useState("");
  const [notes, setNotes] = useState("");

  const canSubmit = target.trim().length > 0;

  const helperCopy = useMemo(() => {
    if (focus === "trust") {
      return "The report will give extra weight to trust, governance, and risk reassurance.";
    }

    if (focus === "activation") {
      return "The report will emphasize the first success path and where users stall before value.";
    }

    return "SignalFrame infers the product promise, simulates six first-time personas, and returns a structured UX report.";
  }, [focus]);

  function submit() {
    const params = new URLSearchParams();

    params.set("target", target.trim());

    if (focus) {
      params.set("focus", focus);
    }

    if (audience.trim()) {
      params.set("audience", audience.trim());
    }

    if (notes.trim()) {
      params.set("notes", notes.trim());
    }

    const jobId = `${slugify(target) || "report"}-${Date.now().toString().slice(-6)}`;

    startTransition(() => {
      router.push(`/analysis/${jobId}?${params.toString()}`);
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="rounded-[2rem] border border-[var(--line)] bg-white p-4 shadow-sm md:p-6"
    >
      <div className="grid gap-4 md:grid-cols-[1.35fr_0.95fr]">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]" htmlFor="target">
              Product URL or name
            </label>
            <Input
              id="target"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              placeholder="linear.app, figma.com, Notion, your demo URL"
              autoComplete="off"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]" htmlFor="focus">
                Optional focus
              </label>
              <select
                id="focus"
                value={focus}
                onChange={(event) => setFocus(event.target.value)}
                className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 text-sm text-[var(--foreground)] outline-none transition-colors duration-200 ease-out focus:border-[var(--accent)]"
              >
                {FOCUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]" htmlFor="audience">
                Optional audience
              </label>
              <Input
                id="audience"
                value={audience}
                onChange={(event) => setAudience(event.target.value)}
                placeholder="Founders, PMs, enterprise buyers"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]" htmlFor="notes">
              Optional notes
            </label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Anything the report should pay extra attention to."
            />
          </div>
        </div>

        <div className="flex flex-col rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)] p-5">
          <div className="space-y-3">
            <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
              <Sparkles className="size-5" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-[var(--foreground)]">What this run will produce</p>
              <p className="text-pretty text-sm leading-7 text-[var(--muted-foreground)]">{helperCopy}</p>
            </div>
          </div>

          <div className="mt-5 space-y-3 rounded-[1.5rem] border border-[var(--line)] bg-white p-4">
            <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Included in the report</p>
            <ul className="space-y-3 text-sm text-[var(--foreground)]">
              <li className="flex items-start gap-3">
                <span className="mt-1 size-2 rounded-full bg-[var(--accent)]" />
                Executive summary with activation, trust, and clarity signals
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 size-2 rounded-full bg-[var(--accent)]" />
                Six simulated personas with first-use journey breakdowns
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 size-2 rounded-full bg-[var(--accent)]" />
                Prioritized fixes you can take straight into product review
              </li>
            </ul>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setTarget(example)}
                className={cn(
                  "inline-flex items-center rounded-full border border-[var(--line)] px-3 py-2 text-xs font-medium text-[var(--muted-foreground)] transition-colors duration-200 ease-out hover:border-[var(--accent)] hover:text-[var(--foreground)]",
                )}
              >
                Try {example}
              </button>
            ))}
          </div>

          <div className="mt-auto flex flex-col gap-3 pt-6">
            <Button onClick={submit} disabled={!canSubmit || isPending} className="w-full">
              {isPending ? "Preparing analysis..." : "Analyze product"}
              <ArrowRight className="size-4" />
            </Button>
            <Link
              href="/reports/example?target=Linear"
              className={buttonStyles({ variant: "ghost", size: "default", className: "w-full" })}
            >
              Open example report
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
