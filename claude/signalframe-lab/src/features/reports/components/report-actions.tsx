"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, FileOutput } from "lucide-react";

import { Button, buttonStyles } from "@/components/ui/button";

export function ReportActions({ jsonHref }: { jsonHref: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="secondary" onClick={() => window.print()}>
        <FileOutput className="size-4" />
        Export PDF
      </Button>
      <Link href={jsonHref} className={buttonStyles({ variant: "secondary", size: "default" })}>
        Export JSON
      </Link>
      <Button variant="secondary" onClick={copyLink}>
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? "Link copied" : "Share report"}
      </Button>
    </div>
  );
}
