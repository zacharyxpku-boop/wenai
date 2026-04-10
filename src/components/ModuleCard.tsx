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
}

export default function ModuleCard({ id, name, nameEn, description, category, categoryLabel }: ModuleCardProps) {
  return (
    <Link href={`/modules/${id}`} className="group block">
      <div className={`
        relative bg-bg-surface border border-border-subtle border-l-2 ${catColorMap[category] || 'border-l-text-tertiary'}
        rounded-md p-4 transition-all duration-200
        hover:bg-bg-raised hover:border-border-default hover:translate-x-0.5
      `}>
        {/* Header */}
        <div className="flex items-start justify-between mb-2.5">
          <div>
            <h3 className="text-[13px] font-medium text-text-primary group-hover:text-accent transition-colors">
              {name}
            </h3>
            <p className="text-[10px] font-mono text-text-tertiary mt-0.5 uppercase tracking-wide">
              {nameEn}
            </p>
          </div>
          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${catBgMap[category] || 'bg-text-tertiary'}`} />
        </div>

        {/* Description */}
        <p className="text-[12px] text-text-secondary leading-relaxed line-clamp-2">
          {description}
        </p>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[9px] font-mono text-text-tertiary uppercase tracking-widest">
            {categoryLabel}
          </span>
          <span className="text-[11px] text-text-tertiary group-hover:text-accent transition-colors opacity-0 group-hover:opacity-100">
            &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
