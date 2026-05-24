"use client";

import { useAppDispatch, useAppState } from "@/lib/store";

export default function ClientContextForm() {
  const dispatch = useAppDispatch();
  const { client } = useAppState();

  const update = (fields: Partial<typeof client>) => {
    dispatch({ type: "SET_CLIENT", client: fields });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-mono text-[9px] font-semibold uppercase tracking-[1.5px] text-[var(--text3)] mb-[6px]">
          Company Name
        </label>
        <input
          type="text"
          value={client.companyName}
          onChange={(e) => update({ companyName: e.target.value })}
          placeholder="e.g. Thales Group"
          className="w-full px-3 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r)] text-[var(--text)] placeholder:text-[var(--text4)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
        />
      </div>

      <div>
        <label className="block font-mono text-[9px] font-semibold uppercase tracking-[1.5px] text-[var(--text3)] mb-[6px]">
          Industry
        </label>
        <input
          type="text"
          value={client.industry}
          onChange={(e) => update({ industry: e.target.value })}
          placeholder="e.g. Aerospace & Defence"
          className="w-full px-3 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r)] text-[var(--text)] placeholder:text-[var(--text4)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
        />
      </div>

      <div>
        <label className="block font-mono text-[9px] font-semibold uppercase tracking-[1.5px] text-[var(--text3)] mb-[6px]">
          Company Size
        </label>
        <select
          value={client.size}
          onChange={(e) => update({ size: e.target.value as typeof client.size })}
          className="w-full px-3 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
        >
          <option value="">Select...</option>
          <option value="SMB">SMB (&lt;500 employees)</option>
          <option value="Mid-Market">Mid-Market (500-5,000)</option>
          <option value="Enterprise">Enterprise (5,000+)</option>
        </select>
      </div>

      <div>
        <label className="block font-mono text-[9px] font-semibold uppercase tracking-[1.5px] text-[var(--text3)] mb-[6px]">
          Key Pain Points
        </label>
        <textarea
          value={client.painPoints}
          onChange={(e) => update({ painPoints: e.target.value })}
          placeholder={"e.g.\nManual Excel-based planning\nNo real-time visibility\nIPO readiness concerns"}
          rows={3}
          className="w-full px-3 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r)] text-[var(--text)] placeholder:text-[var(--text4)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] resize-none"
        />
      </div>
    </div>
  );
}
