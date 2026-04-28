import { Fragment } from 'react';

interface StepsProps {
  steps: string[];
  current: number; // 1-based
}

export function Steps({ steps, current }: StepsProps) {
  return (
    <div className="flex items-start">
      {steps.map((label, idx) => {
        const num = idx + 1;
        const isCompleted = num < current;
        const isCurrent = num === current;
        const isLast = idx === steps.length - 1;

        return (
          <Fragment key={label}>
            {/* Circle + label */}
            <div className="flex shrink-0 flex-col items-center gap-1">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  isCompleted
                    ? 'bg-accent text-white'
                    : isCurrent
                    ? 'border-2 border-accent text-accent'
                    : 'border-2 border-card-border text-muted'
                }`}
              >
                {isCompleted ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  num
                )}
              </div>
              <span
                className={`text-[10px] font-medium whitespace-nowrap ${
                  isCurrent ? 'text-accent' : isCompleted ? 'text-foreground' : 'text-muted'
                }`}
              >
                {label}
              </span>
            </div>

            {/* Connector line — between circles, flex-1 so both gaps are equal */}
            {!isLast && (
              <div
                className={`mt-3.5 h-px flex-1 mx-2 transition-colors ${
                  isCompleted ? 'bg-accent' : 'bg-card-border'
                }`}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
