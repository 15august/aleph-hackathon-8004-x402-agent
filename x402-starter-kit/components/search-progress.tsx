"use client";

interface Step {
  step: string;
  done: boolean;
  detail?: string;
}

const STEP_LABELS: Record<string, string> = {
  parsing: "Parsing query",
  scraping: "Scraping listings",
  enriching: "Enriching data",
  evaluating: "Evaluating matches",
  analyzing_photos: "Analyzing photos",
  saving: "Saving results",
};

interface SearchProgressProps {
  steps: Step[];
  status: string;
}

export function SearchProgress({ steps, status }: SearchProgressProps) {
  if (!steps || steps.length === 0) return null;

  const doneCount = steps.filter((s) => s.done).length;
  const pct = Math.round((doneCount / steps.length) * 100);

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">Searching...</p>
        <span className="text-xs text-muted-foreground">{pct}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div
          className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((s, i) => {
          const allPrevDone = steps.slice(0, i).every((p) => p.done);
          const isActive = !s.done && allPrevDone && status !== "completed";

          return (
            <div key={s.step} className="flex items-start gap-2.5">
              <div className="mt-0.5 shrink-0">
                {s.done ? (
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : isActive ? (
                  <svg className="w-4 h-4 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-200" />
                )}
              </div>
              <div>
                <p className={`text-sm ${s.done ? "text-gray-700" : isActive ? "text-blue-700 font-medium" : "text-gray-400"}`}>
                  {STEP_LABELS[s.step] || s.step}
                </p>
                {s.detail && (
                  <p className="text-xs text-muted-foreground">{s.detail}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
