import { Check } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  short?: string;
}

interface Props {
  steps: Step[];
  current: number; // 0-indexed
  completed?: boolean[]; // per-step done flag
  onJump?: (idx: number) => void;
}

export default function Stepper({ steps, current, completed = [], onJump }: Props) {
  return (
    <div className="bg-white rounded-3xl border border-ink-100 p-4 sm:p-5 shadow-soft">
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
        {steps.map((step, i) => {
          const isActive = i === current;
          const isDone = completed[i] ?? i < current;
          const clickable = !!onJump && (isDone || i <= current);
          return (
            <div key={step.id} className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => clickable && onJump?.(i)}
                disabled={!clickable}
                className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-bold transition-all
                  ${isActive ? 'bg-ink-900 text-white shadow-soft' : ''}
                  ${!isActive && isDone ? 'bg-saffron/10 text-saffron' : ''}
                  ${!isActive && !isDone ? 'bg-ink-50 text-ink-400' : ''}
                  ${clickable ? 'cursor-pointer hover:opacity-90' : 'cursor-default'}`}
              >
                <span
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold
                    ${isActive ? 'bg-saffron text-white' : ''}
                    ${!isActive && isDone ? 'bg-saffron text-white' : ''}
                    ${!isActive && !isDone ? 'bg-white border border-ink-200 text-ink-400' : ''}`}
                >
                  {isDone && !isActive ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : i + 1}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{step.short ?? step.label}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={`hidden sm:block h-0.5 w-6 rounded-full ${isDone ? 'bg-saffron' : 'bg-ink-100'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
