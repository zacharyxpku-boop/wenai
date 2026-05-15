import { ReactNode } from 'react';

/**
 * Marketing 全站统一容器 · max-w 1200 居中, 左右 padding 自适应
 *
 * 用法:
 *   <Section>
 *     <Container>
 *       <h2>...</h2>
 *     </Container>
 *   </Section>
 */
export function Container({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Section 标准包装 · 控制上下间距
 */
export function Section({
  children,
  className = '',
  spacing = 'normal',
  as: Tag = 'section',
  id,
}: {
  children: ReactNode;
  className?: string;
  spacing?: 'tight' | 'normal' | 'loose';
  as?: 'section' | 'div' | 'header' | 'footer';
  id?: string;
}) {
  const pad =
    spacing === 'tight' ? 'py-10 lg:py-14' :
    spacing === 'loose' ? 'py-20 lg:py-28' :
    'py-14 lg:py-20';
  return <Tag id={id} className={`${pad} ${className}`}>{children}</Tag>;
}

/**
 * 主 CTA 按钮 · 琥珀实心
 */
export function PrimaryButton({
  href,
  children,
  className = '',
  size = 'md',
}: {
  href: string;
  children: ReactNode;
  className?: string;
  size?: 'md' | 'lg';
}) {
  const sz = size === 'lg' ? 'px-7 py-3.5 text-[15px]' : 'px-5 py-2.5 text-[13px]';
  return (
    <a
      href={href}
      className={`inline-flex min-w-0 items-center justify-center gap-2 text-center ${sz} font-semibold rounded-md bg-accent text-bg-root hover:bg-accent-hover transition-colors ${className}`}
    >
      {children}
    </a>
  );
}

/**
 * 次 CTA · 描边
 */
export function SecondaryButton({
  href,
  children,
  className = '',
  size = 'md',
}: {
  href: string;
  children: ReactNode;
  className?: string;
  size?: 'md' | 'lg';
}) {
  const sz = size === 'lg' ? 'px-7 py-3.5 text-[15px]' : 'px-5 py-2.5 text-[13px]';
  return (
    <a
      href={href}
      className={`inline-flex min-w-0 items-center justify-center gap-2 text-center ${sz} font-semibold rounded-md border border-border-default text-text-primary hover:border-accent hover:text-accent transition-colors ${className}`}
    >
      {children}
    </a>
  );
}
