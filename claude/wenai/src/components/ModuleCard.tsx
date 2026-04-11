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
        rounded-md p-3.5 transition-all duration-200
        hover:bg-bg-raised hover:border-border-default hover:shadow-[0_0_0_1px_rgba(200,151,90,0.08)]
      `}>
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-[13px] font-medium text-text-primary group-hover:text-accent transition-colors leading-tight truncate">
              {name}
            </h3>
            <p className="text-[9px] font-mono text-text-tertiary mt-1 uppercase tracking-wider">
              {nameEn}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
            {tier === 1 && (
              <span className="text-[7px] font-mono bg-accent/15 text-accent px-1.5 py-0.5 rounded tracking-wider">T1</span>
            )}
            {assistOnly && (
              <span className="text-[7px] font-mono bg-bg-raised text-text-tertiary px-1.5 py-0.5 rounded tracking-wider">辅助</span>
            )}
            <div className={`w-1.5 h-1.5 rounded-full ${catBgMap[category] || 'bg-text-tertiary'} group-hover:scale-125 transition-transform`} />
          </div>
        </div>

        {/* Description */}
        <p className="text-[11px] text-text-secondary/90 leading-[1.6] line-clamp-2 mb-2.5">
          {description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border-subtle/40">
          <span className="text-[8px] font-mono text-text-tertiary uppercase tracking-[0.1em]">
            {categoryLabel}
          </span>
          <span className="text-[11px] text-text-tertiary group-hover:text-accent transition-all duration-200 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
