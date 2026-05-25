"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, BookOpen, Trash2, Copy, Tag } from "lucide-react";
import {
  listSnippets,
  searchSnippets,
  deleteSnippet,
  getSnippetStats,
  incrementUsedCount,
} from "@/lib/response-library";
import type { LibrarySnippet } from "@/lib/response-library";
import { CATEGORY_CONFIG } from "@/types";
import type { QuestionCategory } from "@/types";

interface ResponseLibraryPanelProps {
  onInsert?: (content: string) => void;
}

const CATEGORIES = Object.keys(CATEGORY_CONFIG) as QuestionCategory[];

export default function ResponseLibraryPanel({
  onInsert,
}: ResponseLibraryPanelProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<QuestionCategory | null>(
    null
  );
  const [snippets, setSnippets] = useState<LibrarySnippet[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    byCategory: Record<string, number>;
    avgQuality: number;
  }>({ total: 0, byCategory: {}, avgQuality: 0 });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // ── Load snippets and stats ──
  const refresh = useCallback(() => {
    setStats(getSnippetStats());
    if (query || activeCategory) {
      setSnippets(searchSnippets(query, activeCategory ?? undefined));
    } else {
      setSnippets(listSnippets());
    }
  }, [query, activeCategory]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // ── Filtered snippets (already filtered by searchSnippets, just memoize) ──
  const filteredSnippets = useMemo(() => snippets, [snippets]);

  // ── Handlers ──
  const handleInsert = useCallback(
    (snippet: LibrarySnippet) => {
      incrementUsedCount(snippet.id);
      onInsert?.(snippet.content);
      refresh();
    },
    [onInsert, refresh]
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (confirmDeleteId === id) {
        deleteSnippet(id);
        setConfirmDeleteId(null);
        refresh();
      } else {
        setConfirmDeleteId(id);
      }
    },
    [confirmDeleteId, refresh]
  );

  const toggleCategory = useCallback(
    (cat: QuestionCategory) => {
      setActiveCategory((prev) => (prev === cat ? null : cat));
    },
    []
  );

  // Clear delete confirmation when clicking elsewhere
  useEffect(() => {
    if (!confirmDeleteId) return;
    const timer = setTimeout(() => setConfirmDeleteId(null), 3000);
    return () => clearTimeout(timer);
  }, [confirmDeleteId]);

  return (
    <div className="flex flex-col h-full">
      {/* ── Stats header ── */}
      <div className="px-[18px] pt-4 pb-2">
        {stats.total === 0 ? (
          <div className="text-[11px] text-[var(--text4)] leading-[1.5]">
            No saved snippets yet — save responses from the editor to build your
            library
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BookOpen size={11} className="text-[var(--accent)]" />
              <span className="font-mono text-[9px] font-semibold uppercase tracking-[1.2px] text-[var(--text3)]">
                Library: {stats.total} snippet{stats.total !== 1 ? "s" : ""}
              </span>
            </div>
            {stats.avgQuality > 0 && (
              <span className="font-mono text-[9px] text-[var(--text4)]">
                Avg quality:{" "}
                <span className="font-semibold text-[var(--text2)]">
                  {stats.avgQuality.toFixed(1)}
                </span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Search bar ── */}
      <div className="px-[18px] pb-2">
        <div className="relative">
          <Search
            size={12}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text4)]"
          />
          <input
            type="text"
            placeholder="Search snippets..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg pl-7 pr-3 py-2 text-xs text-[var(--text)] placeholder:text-[var(--text4)] outline-none focus:border-[var(--accent-bd)] transition-colors"
          />
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-1 mt-2">
          {CATEGORIES.map((cat) => {
            const cfg = CATEGORY_CONFIG[cat];
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[9px] font-medium transition-all ${
                  isActive
                    ? "text-white"
                    : "text-[var(--text4)] hover:text-[var(--text2)] bg-[var(--surface)]"
                }`}
                style={
                  isActive
                    ? { backgroundColor: cfg.color }
                    : { borderColor: "var(--border)", borderWidth: "1px" }
                }
              >
                <span
                  className="w-[5px] h-[5px] rounded-full shrink-0"
                  style={{ backgroundColor: cfg.color }}
                />
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Snippet list ── */}
      <div className="flex-1 overflow-y-auto px-[18px] pb-4">
        {filteredSnippets.length === 0 ? (
          <div className="text-[11px] text-[var(--text4)] text-center py-6">
            {stats.total === 0
              ? "Your library is empty"
              : "No snippets match your search"}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSnippets.map((snippet) => {
              const catCfg = CATEGORY_CONFIG[snippet.category];
              const isConfirmingDelete = confirmDeleteId === snippet.id;

              return (
                <div
                  key={snippet.id}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3 shadow-[var(--sh-sm)] transition-all hover:border-[var(--accent-bd)]"
                >
                  {/* Title */}
                  <div className="text-xs font-semibold text-[var(--text)] truncate mb-1">
                    {snippet.title}
                  </div>

                  {/* Category badge + quality score */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1 text-[9px] text-[var(--text3)]">
                      <span
                        className="w-[6px] h-[6px] rounded-full shrink-0"
                        style={{ backgroundColor: catCfg.color }}
                      />
                      {catCfg.label}
                    </span>
                    {snippet.qualityScore != null && (
                      <span className="font-mono text-[9px] text-[var(--text4)]">
                        Q: {snippet.qualityScore.toFixed(1)}
                      </span>
                    )}
                  </div>

                  {/* Source */}
                  {snippet.sourceClient && (
                    <div className="text-[9px] text-[var(--text4)] mb-1">
                      From: {snippet.sourceClient}
                    </div>
                  )}

                  {/* Word count + used count */}
                  <div className="flex items-center gap-2 text-[9px] text-[var(--text4)] mb-1.5">
                    <span>{snippet.wordCount} words</span>
                    {snippet.usedCount > 0 && (
                      <>
                        <span className="text-[var(--border)]">&middot;</span>
                        <span>Used {snippet.usedCount}x</span>
                      </>
                    )}
                  </div>

                  {/* Content preview */}
                  <div className="text-[10px] text-[var(--text3)] leading-[1.5] line-clamp-3 mb-2">
                    {snippet.content}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleInsert(snippet)}
                      className="inline-flex items-center gap-1 text-[9px] font-semibold px-2.5 py-[4px] rounded-md bg-[var(--accent)] text-white hover:bg-[var(--accent2)] transition-colors"
                    >
                      <Copy size={10} />
                      Insert
                    </button>
                    <button
                      onClick={() => handleDelete(snippet.id)}
                      className={`inline-flex items-center gap-1 text-[9px] font-medium px-2 py-[4px] rounded-md transition-colors ${
                        isConfirmingDelete
                          ? "bg-[var(--neg-pale)] text-[var(--neg)] border border-[var(--neg)]"
                          : "text-[var(--text4)] hover:text-[var(--neg)] hover:bg-[var(--neg-pale)]"
                      }`}
                    >
                      <Trash2 size={10} />
                      {isConfirmingDelete ? "Sure?" : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
