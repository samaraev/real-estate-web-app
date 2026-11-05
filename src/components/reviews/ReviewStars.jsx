import React from 'react';
import { Star } from 'lucide-react';

export default function ReviewStars({ value = 0, showValue = true, className = '' }) {
  const score = Number(value) || 0;
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((step) => (
          <Star
            key={step}
            className={`h-3.5 w-3.5 ${step <= Math.round(score) ? 'fill-accent text-accent' : 'text-border'}`}
          />
        ))}
      </span>
      {showValue ? <span className="text-xs font-medium">{score.toFixed(1)}</span> : null}
    </span>
  );
}