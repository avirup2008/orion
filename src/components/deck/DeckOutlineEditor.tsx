"use client";

import { useCallback, useMemo, useState } from "react";
import type {
  DeckOutline,
  DeckSection,
  SlideOutline,
  PatternType,
} from "@/lib/export/deck/types";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Presentation,
  LayoutGrid,
  Columns,
  BarChart3,
  Triangle,
  Layers,
  Network,
  CreditCard,
  Table2,
  Clock,
  Gauge,
  Quote,
  Loader2,
  SeparatorHorizontal,
} from "lucide-react";

/* ── Pattern metadata ─────────────────────────────────────────────── */

interface PatternMeta {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
}

const PATTERN_META: Record<PatternType | "section-divider", PatternMeta> = {
  cover: {
    label: "Cover",
    icon: Presentation,
    description: "Title slide with client name and date",
  },
  waterfall: {
    label: "Waterfall",
    icon: BarChart3,
    description: "Descending bar chart with annotations",
  },
  "gated-flow": {
    label: "Gated Flow",
    icon: Columns,
    description: "Phased process with gates between stages",
  },
  pyramid: {
    label: "Pyramid",
    icon: Triangle,
    description: "Layered hierarchy from base to apex",
  },
  staircase: {
    label: "Staircase",
    icon: Layers,
    description: "Ascending steps showing maturity progression",
  },
  "architecture-flow": {
    label: "Architecture",
    icon: Network,
    description: "System diagram with connected components",
  },
  "content-cards": {
    label: "Content Cards",
    icon: CreditCard,
    description: "Grid of cards with metrics and body text",
  },
  "comparison-matrix": {
    label: "Comparison",
    icon: Table2,
    description: "Table comparing options or criteria",
  },
  timeline: {
    label: "Timeline",
    icon: Clock,
    description: "Horizontal milestone sequence",
  },
  "metrics-dashboard": {
    label: "Metrics",
    icon: Gauge,
    description: "KPI tiles with supporting bullets",
  },
  "quote-callout": {
    label: "Quote",
    icon: Quote,
    description: "Highlighted quote with attribution",
  },
  "section-divider": {
    label: "Section Divider",
    icon: SeparatorHorizontal,
    description: "Visual separator between major sections",
  },
};

const ALL_PATTERNS: (PatternType | "section-divider")[] = [
  "cover",
  "waterfall",
  "gated-flow",
  "pyramid",
  "staircase",
  "architecture-flow",
  "content-cards",
  "comparison-matrix",
  "timeline",
  "metrics-dashboard",
  "quote-callout",
  "section-divider",
];

/* ── Props ────────────────────────────────────────────────────────── */

interface DeckOutlineEditorProps {
  outline: DeckOutline;
  onApprove: (editedOutline: DeckOutline) => void;
  onCancel: () => void;
  isGenerating?: boolean;
}

/* ── Deep clone utility ───────────────────────────────────────────── */

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/* ── Component ────────────────────────────────────────────────────── */

export default function DeckOutlineEditor({
  outline,
  onApprove,
  onCancel,
  isGenerating = false,
}: DeckOutlineEditorProps) {
  const [editedOutline, setEditedOutline] = useState<DeckOutline>(() =>
    deepClone(outline),
  );
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(
    () => new Set(),
  );
  const [openPatternDropdown, setOpenPatternDropdown] = useState<string | null>(
    null,
  );

  /* ── Derived counts ── */

  const totalSlides = useMemo(
    () =>
      editedOutline.sections.reduce((sum, s) => sum + s.slides.length, 0),
    [editedOutline],
  );

  const hasChanges = useMemo(
    () => JSON.stringify(outline) !== JSON.stringify(editedOutline),
    [outline, editedOutline],
  );

  /* ── Section collapse ── */

  const toggleSection = useCallback((sectionIdx: number) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionIdx)) {
        next.delete(sectionIdx);
      } else {
        next.add(sectionIdx);
      }
      return next;
    });
  }, []);

  /* ── Slide field editors ── */

  const updateSlideField = useCallback(
    (
      sectionIdx: number,
      slideIdx: number,
      field: keyof SlideOutline,
      value: string,
    ) => {
      setEditedOutline((prev) => {
        const next = deepClone(prev);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (next.sections[sectionIdx].slides[slideIdx] as any)[field] = value;
        return next;
      });
    },
    [],
  );

  const updateSlidePattern = useCallback(
    (sectionIdx: number, slideIdx: number, pattern: PatternType) => {
      setEditedOutline((prev) => {
        const next = deepClone(prev);
        next.sections[sectionIdx].slides[slideIdx].pattern = pattern;
        return next;
      });
      setOpenPatternDropdown(null);
    },
    [],
  );

  /* ── Reorder ── */

  const moveSlide = useCallback(
    (sectionIdx: number, slideIdx: number, direction: "up" | "down") => {
      setEditedOutline((prev) => {
        const next = deepClone(prev);
        const slides = next.sections[sectionIdx].slides;
        const targetIdx = direction === "up" ? slideIdx - 1 : slideIdx + 1;
        if (targetIdx < 0 || targetIdx >= slides.length) return prev;
        [slides[slideIdx], slides[targetIdx]] = [
          slides[targetIdx],
          slides[slideIdx],
        ];
        return next;
      });
    },
    [],
  );

  /* ── Delete ── */

  const deleteSlide = useCallback(
    (sectionIdx: number, slideIdx: number) => {
      setEditedOutline((prev) => {
        const next = deepClone(prev);
        next.sections[sectionIdx].slides.splice(slideIdx, 1);
        // Remove empty sections
        if (next.sections[sectionIdx].slides.length === 0) {
          next.sections.splice(sectionIdx, 1);
        }
        next.totalSlides = next.sections.reduce(
          (sum, s) => sum + s.slides.length,
          0,
        );
        return next;
      });
    },
    [],
  );

  /* ── Approve ── */

  const handleApprove = useCallback(() => {
    const final = deepClone(editedOutline);
    final.totalSlides = final.sections.reduce(
      (sum: number, s: DeckSection) => sum + s.slides.length,
      0,
    );
    onApprove(final);
  }, [editedOutline, onApprove]);

  /* ── Close dropdown on outside click ── */

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onCancel();
      }
    },
    [onCancel],
  );

  /* ── Render ── */

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleOverlayClick}
      style={{ background: "rgba(10, 18, 30, 0.85)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="relative flex flex-col w-full max-w-[820px] max-h-[88vh] rounded-2xl overflow-hidden"
        style={{
          background: "var(--navy)",
          boxShadow: "0 32px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.06)",
        }}
        onClick={() => setOpenPatternDropdown(null)}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-7 py-5"
          style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "var(--accent)" }}
            >
              <Presentation size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-white tracking-wide">
                Deck Outline
              </h2>
              <p className="text-[11px] text-white/40 mt-0.5">
                {totalSlides} slides across {editedOutline.sections.length} sections
                {hasChanges && (
                  <span className="ml-2 text-[var(--accent2)]">
                    &bull; Modified
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Deck Title / Subtitle ── */}
        <div
          className="px-7 py-4 space-y-3"
          style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}
        >
          <div>
            <label className="font-mono text-[8px] text-white/25 uppercase tracking-[2px] block mb-1.5">
              Deck Title
            </label>
            <input
              type="text"
              value={editedOutline.title}
              onChange={(e) =>
                setEditedOutline((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3.5 py-2 text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-[var(--accent2)]/50 focus:bg-white/[0.06] transition-all"
            />
          </div>
          <div>
            <label className="font-mono text-[8px] text-white/25 uppercase tracking-[2px] block mb-1.5">
              Subtitle
            </label>
            <input
              type="text"
              value={editedOutline.subtitle}
              onChange={(e) =>
                setEditedOutline((prev) => ({
                  ...prev,
                  subtitle: e.target.value,
                }))
              }
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3.5 py-2 text-[13px] text-white/70 placeholder:text-white/20 focus:outline-none focus:border-[var(--accent2)]/50 focus:bg-white/[0.06] transition-all"
            />
          </div>
        </div>

        {/* ── Sections & Slides ── */}
        <div className="flex-1 overflow-y-auto px-7 py-4 dark-scroll">
          {editedOutline.sections.map((section, sIdx) => (
            <SectionBlock
              key={`section-${sIdx}`}
              section={section}
              sectionIdx={sIdx}
              isCollapsed={collapsedSections.has(sIdx)}
              onToggle={() => toggleSection(sIdx)}
              onUpdateField={updateSlideField}
              onUpdatePattern={updateSlidePattern}
              onMoveSlide={moveSlide}
              onDeleteSlide={deleteSlide}
              openPatternDropdown={openPatternDropdown}
              setOpenPatternDropdown={setOpenPatternDropdown}
            />
          ))}

          {editedOutline.sections.length === 0 && (
            <div className="text-center py-16 text-white/20 text-sm">
              No sections remaining. Cancel to restore the original outline.
            </div>
          )}
        </div>

        {/* ── Footer Actions ── */}
        <div
          className="flex items-center justify-between px-7 py-4"
          style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}
        >
          <div className="text-[11px] text-white/30">
            {totalSlides} slide{totalSlides !== 1 ? "s" : ""} total
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-medium text-white/50 hover:text-white/70 hover:bg-white/[0.06] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <X size={14} />
              Cancel
            </button>
            <button
              onClick={handleApprove}
              disabled={isGenerating || totalSlides === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[12px] font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background:
                  isGenerating || totalSlides === 0
                    ? "rgba(255,255,255,0.06)"
                    : "var(--accent)",
                boxShadow:
                  isGenerating || totalSlides === 0
                    ? "none"
                    : "0 4px 16px rgba(27, 77, 74, 0.3)",
              }}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Check size={14} />
                  Approve &amp; Generate
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Section Block ────────────────────────────────────────────────── */

interface SectionBlockProps {
  section: DeckSection;
  sectionIdx: number;
  isCollapsed: boolean;
  onToggle: () => void;
  onUpdateField: (
    sectionIdx: number,
    slideIdx: number,
    field: keyof SlideOutline,
    value: string,
  ) => void;
  onUpdatePattern: (
    sectionIdx: number,
    slideIdx: number,
    pattern: PatternType,
  ) => void;
  onMoveSlide: (
    sectionIdx: number,
    slideIdx: number,
    direction: "up" | "down",
  ) => void;
  onDeleteSlide: (sectionIdx: number, slideIdx: number) => void;
  openPatternDropdown: string | null;
  setOpenPatternDropdown: (id: string | null) => void;
}

function SectionBlock({
  section,
  sectionIdx,
  isCollapsed,
  onToggle,
  onUpdateField,
  onUpdatePattern,
  onMoveSlide,
  onDeleteSlide,
  openPatternDropdown,
  setOpenPatternDropdown,
}: SectionBlockProps) {
  return (
    <div className="mb-4">
      {/* Section header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] transition-all group"
      >
        <span className="text-white/30 group-hover:text-white/50 transition-colors">
          {isCollapsed ? (
            <ChevronRight size={14} />
          ) : (
            <ChevronDown size={14} />
          )}
        </span>
        <span className="font-mono text-[10px] font-semibold text-white/60 uppercase tracking-[1.5px]">
          {section.label}
        </span>
        <span className="ml-auto font-mono text-[9px] text-white/25">
          {section.slides.length} slide{section.slides.length !== 1 ? "s" : ""}
        </span>
      </button>

      {/* Slides */}
      {!isCollapsed && (
        <div className="ml-3 mt-1 space-y-2">
          {section.slides.map((slide, slideIdx) => (
            <SlideRow
              key={slide.id}
              slide={slide}
              sectionIdx={sectionIdx}
              slideIdx={slideIdx}
              totalInSection={section.slides.length}
              onUpdateField={onUpdateField}
              onUpdatePattern={onUpdatePattern}
              onMoveSlide={onMoveSlide}
              onDeleteSlide={onDeleteSlide}
              isDropdownOpen={
                openPatternDropdown === `${sectionIdx}-${slideIdx}`
              }
              onToggleDropdown={(e) => {
                e.stopPropagation();
                setOpenPatternDropdown(
                  openPatternDropdown === `${sectionIdx}-${slideIdx}`
                    ? null
                    : `${sectionIdx}-${slideIdx}`,
                );
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Slide Row ────────────────────────────────────────────────────── */

interface SlideRowProps {
  slide: SlideOutline;
  sectionIdx: number;
  slideIdx: number;
  totalInSection: number;
  onUpdateField: (
    sectionIdx: number,
    slideIdx: number,
    field: keyof SlideOutline,
    value: string,
  ) => void;
  onUpdatePattern: (
    sectionIdx: number,
    slideIdx: number,
    pattern: PatternType,
  ) => void;
  onMoveSlide: (
    sectionIdx: number,
    slideIdx: number,
    direction: "up" | "down",
  ) => void;
  onDeleteSlide: (sectionIdx: number, slideIdx: number) => void;
  isDropdownOpen: boolean;
  onToggleDropdown: (e: React.MouseEvent) => void;
}

function SlideRow({
  slide,
  sectionIdx,
  slideIdx,
  totalInSection,
  onUpdateField,
  onUpdatePattern,
  onMoveSlide,
  onDeleteSlide,
  isDropdownOpen,
  onToggleDropdown,
}: SlideRowProps) {
  const patternMeta =
    PATTERN_META[slide.pattern] ?? PATTERN_META["content-cards"];
  const PatternIcon = patternMeta.icon;

  return (
    <div
      className="relative rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}
    >
      <div className="flex items-start gap-3 p-3.5">
        {/* Drag hint + order controls */}
        <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
          <GripVertical size={12} className="text-white/10 mb-1" />
          <button
            onClick={() => onMoveSlide(sectionIdx, slideIdx, "up")}
            disabled={slideIdx === 0}
            className="w-5 h-5 rounded flex items-center justify-center text-white/15 hover:text-white/50 hover:bg-white/[0.08] transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            aria-label="Move up"
          >
            <ArrowUp size={11} />
          </button>
          <button
            onClick={() => onMoveSlide(sectionIdx, slideIdx, "down")}
            disabled={slideIdx === totalInSection - 1}
            className="w-5 h-5 rounded flex items-center justify-center text-white/15 hover:text-white/50 hover:bg-white/[0.08] transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            aria-label="Move down"
          >
            <ArrowDown size={11} />
          </button>
        </div>

        {/* Pattern icon */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: "rgba(42, 107, 103, 0.15)" }}
        >
          <PatternIcon size={15} className="text-[var(--accent2)]" />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Governing thought */}
          <input
            type="text"
            value={slide.governingThought}
            onChange={(e) =>
              onUpdateField(
                sectionIdx,
                slideIdx,
                "governingThought",
                e.target.value,
              )
            }
            placeholder="Governing thought..."
            className="w-full bg-transparent text-[13px] font-semibold text-white placeholder:text-white/15 focus:outline-none border-b border-transparent focus:border-white/[0.1] pb-0.5 transition-all"
          />

          {/* Subtitle */}
          <input
            type="text"
            value={slide.subtitle}
            onChange={(e) =>
              onUpdateField(sectionIdx, slideIdx, "subtitle", e.target.value)
            }
            placeholder="Subtitle..."
            className="w-full bg-transparent text-[11px] text-white/40 placeholder:text-white/15 focus:outline-none border-b border-transparent focus:border-white/[0.08] pb-0.5 transition-all italic"
          />

          {/* Pattern selector */}
          <div className="relative">
            <button
              onClick={onToggleDropdown}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-mono text-white/30 bg-white/[0.04] hover:bg-white/[0.08] hover:text-white/50 transition-all uppercase tracking-wider"
            >
              <PatternIcon size={10} />
              {patternMeta.label}
              <ChevronDown
                size={9}
                className={`ml-0.5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Pattern dropdown */}
            {isDropdownOpen && (
              <div
                className="absolute left-0 top-full mt-1 z-50 w-[260px] rounded-xl overflow-hidden"
                style={{
                  background: "var(--navy2)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow:
                    "0 16px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.04)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-1.5 max-h-[280px] overflow-y-auto dark-scroll">
                  {ALL_PATTERNS.map((p) => {
                    const meta = PATTERN_META[p];
                    const Icon = meta.icon;
                    const isActive = slide.pattern === p;
                    return (
                      <button
                        key={p}
                        onClick={() =>
                          onUpdatePattern(
                            sectionIdx,
                            slideIdx,
                            p as PatternType,
                          )
                        }
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${
                          isActive
                            ? "bg-[var(--accent)]/20 text-white"
                            : "text-white/50 hover:bg-white/[0.06] hover:text-white/70"
                        }`}
                      >
                        <Icon
                          size={13}
                          className={
                            isActive
                              ? "text-[var(--accent2)]"
                              : "text-white/25"
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-medium">
                            {meta.label}
                          </div>
                          <div className="text-[9px] text-white/25 truncate">
                            {meta.description}
                          </div>
                        </div>
                        {isActive && (
                          <Check size={11} className="text-[var(--accent2)] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={() => onDeleteSlide(sectionIdx, slideIdx)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white/10 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-400/10 transition-all shrink-0 mt-0.5"
          aria-label="Delete slide"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
