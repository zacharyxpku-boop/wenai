'use client';

import Link from 'next/link';

const catColorMap: Record<string, string> = {
  execute: 'border-l-cat-execute',
  content: 'border-l-cat-content',
  intel: 'border-l-cat-intel',
  service: 'border-l-cat-service',
};

const catBgMap: Record<string, string> = {
  execute: 'bg-cat-execute',
  content: 'bg-cat-content',
  intel: 'bg-cat-intel',
  service: 'bg-cat-service',
};

interface ModuleCardProps {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  icon: string;
  category: string;
  categoryColor: string;
  categoryLabel: string;
  tier?: number;
  assistOnly?: boolean;
}

export default function ModuleCard({ id, name, nameEn, description, category, categoryLabel, tier, assistOnly }: ModuleCardProps) {
  return (
    <Link href={`/modules/${id}`} className="group block">
      <div className={`
        relative bg-bg-surface border border-border-subtle border-l-[3px] ${catColorMap[category] || 'border-l-text-tertiary'}
        rounded-md p-4 transition-all duration-200
        hover:bg-bg-raised hover:border-border-default hover:shadow-[0_2px_12px_rgba(0,0,0,0.3)]
        hover:translate-y-[-1px]
      `}>
        {/* T1 badge - absolute positioned for prominence */}
        {tier === 1 && (
          <div className="absolute top-[-6px] right-3 bg-accent text-bg-root px-2 py-0.5 rounded-md shadow-[0_2px_8px_rgba(200,151,90,0.4)] group-hover:shadow-[0_2px_12px_rgba(200,151,90,0.6)] transition-all">
            <span className="text-[9px] font-mono font-semibold tracking-wider">T1</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-2.5">
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-semibold text-text-primary group-hover:text-accent transition-colors leading-tight truncate font-[family-name:var(--font-outfit)]">
              {name}
            </h3>
            <p className="text-[9px] font-mono text-text-tertiary mt-1.5 uppercase tracking-[0.12em]">
              {nameEn}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
            {assistOnly && (
              <span className="text-[7px] font-mono bg-bg-raised/80 text-text-tertiary/90 px-1.5 py-0.5 rounded border border-border-subtle tracking-wider">辅助</span>
            )}
            <div className={`w-2 h-2 rounded-full ${catBgMap[category] || 'bg-text-tertiary'} group-hover:scale-125 group-hover:shadow-[0_0_6px_currentColor] transition-all duration-200`} style={{ color: `var(--color-cat-${category})` }} />
          </div>
        </div>

        {/* Description */}
        <p className="text-[11px] text-text-secondary/95 leading-[1.65] line-clamp-2 mb-3">
          {description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2.5 border-t border-border-subtle/50">
          <span className="text-[8px] font-mono text-text-tertiary/80 uppercase tracking-[0.12em]">
            {categoryLabel}
          </span>
          <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-3 h-px bg-accent" />
            <span className="text-[11px] text-accent font-mono">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
