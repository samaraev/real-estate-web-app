import React from 'react';

export default function PageHeader({ eyebrow, title, subtitle, actions, compact = false }) {
  return (
    <div className={`mx-auto w-full max-w-content px-4 sm:px-6 ${compact ? 'pt-6 pb-4' : 'pt-8 pb-6 sm:pt-12'}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? <p className="label-xs mb-2">{eyebrow}</p> : null}
          <h1 className="font-display text-2xl leading-tight sm:text-4xl">{title}</h1>
          {subtitle ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}