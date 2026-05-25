import type { QuestionCategory } from "@/types";

// ── Types ──

export interface LibrarySnippet {
  id: string;
  title: string;
  content: string;
  category: QuestionCategory;
  tags: string[];
  sourceQuestion: string;
  sourceClient: string;
  wordCount: number;
  qualityScore?: number;
  createdAt: string;
  usedCount: number;
}

// ── Constants ──

const STORAGE_KEY = "orion_response_library";

// ── Internal helpers ──

function isServer(): boolean {
  return typeof window === "undefined";
}

function readLibrary(): LibrarySnippet[] {
  if (isServer()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as LibrarySnippet[];
  } catch {
    return [];
  }
}

function writeLibrary(snippets: LibrarySnippet[]): void {
  if (isServer()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
  } catch {
    // localStorage may be full or unavailable — silently fail
  }
}

// ── Public API ──

/** Return all saved snippets, sorted by most recently created first. */
export function listSnippets(): LibrarySnippet[] {
  const snippets = readLibrary();
  return snippets.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/** Add a new snippet or update an existing one (matched by id). */
export function saveSnippet(snippet: LibrarySnippet): void {
  const snippets = readLibrary();
  const idx = snippets.findIndex((s) => s.id === snippet.id);
  if (idx >= 0) {
    snippets[idx] = snippet;
  } else {
    snippets.push(snippet);
  }
  writeLibrary(snippets);
}

/** Remove a snippet by id. No-op if the id doesn't exist. */
export function deleteSnippet(id: string): void {
  const snippets = readLibrary();
  writeLibrary(snippets.filter((s) => s.id !== id));
}

/**
 * Search snippets by case-insensitive substring match across content,
 * title, tags, and sourceQuestion. Optionally filter by category.
 */
export function searchSnippets(
  query: string,
  category?: QuestionCategory
): LibrarySnippet[] {
  let snippets = readLibrary();

  if (category) {
    snippets = snippets.filter((s) => s.category === category);
  }

  if (!query.trim()) {
    return snippets.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  const q = query.toLowerCase();

  return snippets
    .filter((s) => {
      if (s.title.toLowerCase().includes(q)) return true;
      if (s.content.toLowerCase().includes(q)) return true;
      if (s.sourceQuestion.toLowerCase().includes(q)) return true;
      if (s.tags.some((t) => t.toLowerCase().includes(q))) return true;
      return false;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

/** Generate a unique snippet ID: `snip-{timestamp}-{random}` */
export function createSnippetId(): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `snip-${ts}-${rand}`;
}

/** Increment the usedCount for a snippet. No-op if the id doesn't exist. */
export function incrementUsedCount(id: string): void {
  const snippets = readLibrary();
  const snippet = snippets.find((s) => s.id === id);
  if (snippet) {
    snippet.usedCount += 1;
    writeLibrary(snippets);
  }
}

/** Summary stats for the response library. */
export function getSnippetStats(): {
  total: number;
  byCategory: Record<string, number>;
  avgQuality: number;
} {
  const snippets = readLibrary();

  const byCategory: Record<string, number> = {};
  let qualitySum = 0;
  let qualityCount = 0;

  for (const s of snippets) {
    byCategory[s.category] = (byCategory[s.category] ?? 0) + 1;
    if (s.qualityScore != null) {
      qualitySum += s.qualityScore;
      qualityCount += 1;
    }
  }

  return {
    total: snippets.length,
    byCategory,
    avgQuality: qualityCount > 0 ? qualitySum / qualityCount : 0,
  };
}
