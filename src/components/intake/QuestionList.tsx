"use client";

import { useAppDispatch, useAppState } from "@/lib/store";
import { CATEGORY_CONFIG } from "@/types";
import { Trash2 } from "lucide-react";

export default function QuestionList() {
  const { questions } = useAppState();
  const dispatch = useAppDispatch();

  if (questions.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-[var(--text4)]">
        No questions added yet. Paste text or upload a file above.
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[1.5px] text-[var(--text3)]">
          Question List ({questions.length})
        </span>
        <button
          onClick={() => dispatch({ type: "CLEAR_QUESTIONS" })}
          className="text-[10px] text-[var(--text4)] hover:text-[var(--neg)] font-mono uppercase tracking-wide transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-[6px] max-h-[320px] overflow-y-auto">
        {questions.map((q) => {
          const cat = CATEGORY_CONFIG[q.category];
          return (
            <div
              key={q.id}
              className="flex items-start gap-3 px-3 py-[10px] bg-[var(--surface)] border border-[var(--border)] rounded-lg group transition-all hover:shadow-[var(--sh-sm)]"
              style={{ borderLeftWidth: 3, borderLeftColor: cat.color }}
            >
              <span className="font-mono text-[10px] font-semibold text-[var(--text4)] mt-[2px] w-6 text-center flex-shrink-0">
                {q.number}
              </span>
              <span className="text-[12px] text-[var(--text)] leading-[1.5] flex-1">
                {q.text}
              </span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <select
                  value={q.category}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_QUESTION",
                      id: q.id,
                      updates: { category: e.target.value as typeof q.category },
                    })
                  }
                  className="font-mono text-[8px] font-semibold uppercase px-2 py-[3px] rounded-full border-none cursor-pointer appearance-none text-center"
                  style={{
                    background: `${cat.color}18`,
                    color: cat.color,
                    width: "80px",
                  }}
                >
                  {Object.entries(CATEGORY_CONFIG).map(([key, c]) => (
                    <option key={key} value={key}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => dispatch({ type: "DELETE_QUESTION", id: q.id })}
                  className="text-[var(--text4)] hover:text-[var(--neg)] opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
