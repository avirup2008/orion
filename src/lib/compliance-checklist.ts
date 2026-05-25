/**
 * Response Compliance Checklist Generator.
 * Analyzes all RFP questions and their responses to produce a compliance report
 * showing whether each requirement has been properly addressed.
 */

import type { RfpQuestion, QuestionCategory } from "@/types";
import { CATEGORY_CONFIG } from "@/types";

// ── Types ──

export type ChecklistItemStatus = "complete" | "partial" | "missing" | "needs-review";

export interface ChecklistItem {
  questionId: string;
  questionNumber: number;
  questionText: string;
  category: QuestionCategory;
  status: ChecklistItemStatus;
  responseWordCount: number;
  qualityScore?: number;
  issues: string[];
  suggestions: string[];
}

export interface ComplianceReport {
  totalQuestions: number;
  complete: number;
  partial: number;
  missing: number;
  needsReview: number;
  overallScore: number;
  items: ChecklistItem[];
  generatedAt: string;
}

// ── Category-specific suggestion templates ──

const CATEGORY_SUGGESTIONS: Record<QuestionCategory, string[]> = {
  technical: [
    "Reference specific Anaplan capabilities (e.g., DCA, versions, dashboards)",
    "Include architecture diagrams or data-flow descriptions where applicable",
    "Mention integration approaches (API, Anaplan Connect, CloudWorks)",
  ],
  functional: [
    "Map requirements to Anaplan modules and line items",
    "Describe how the business process translates into the Anaplan model",
    "Include references to UX builder and end-user experience",
  ],
  methodology: [
    "Outline the phased delivery approach (Discover, Design, Build, Test, Deploy)",
    "Reference Anaplan Way or equivalent delivery methodology",
    "Include governance, risk management, and change control details",
  ],
  team: [
    "List team members with roles, certifications, and relevant experience",
    "Highlight Anaplan Master Anaplanner or equivalent certifications",
    "Describe the RACI model for key project activities",
  ],
  pricing: [
    "Include ROI metrics and expected business value",
    "Break down costs by phase, role, or deliverable",
    "Provide licensing cost estimates alongside implementation costs",
  ],
  references: [
    "Include client industry, project scope, and measurable outcomes",
    "Provide timelines and team sizes for comparable engagements",
    "Highlight lessons learned that are relevant to this RFP",
  ],
};

// ── Thresholds ──

const MIN_WORD_COUNT = 100;
const MIN_QUALITY_SCORE = 70;

// ── Status determination ──

function determineStatus(question: RfpQuestion): ChecklistItemStatus {
  const { response, status } = question;

  // No response at all
  if (!response || !response.content || response.content.trim().length === 0) {
    return "missing";
  }

  // Response exists but question is still in draft or generating state
  if (status === "draft" || status === "generating") {
    return "needs-review";
  }

  // Response exists — check quality thresholds
  const wordsBelowMin = response.wordCount < MIN_WORD_COUNT;
  const qualityBelowMin =
    response.qualityScore !== undefined && response.qualityScore < MIN_QUALITY_SCORE;

  if (wordsBelowMin || qualityBelowMin) {
    return "partial";
  }

  return "complete";
}

// ── Issue detection ──

function detectIssues(question: RfpQuestion, status: ChecklistItemStatus): string[] {
  const issues: string[] = [];
  const { response, priority } = question;

  if (status === "missing") {
    issues.push("No response has been generated");
    if (priority === "high") {
      issues.push("High-priority question is unanswered");
    }
    return issues;
  }

  if (status === "needs-review") {
    issues.push(
      question.status === "generating"
        ? "Response is still being generated"
        : "Response is in draft status and needs review",
    );
  }

  if (response) {
    if (response.wordCount < MIN_WORD_COUNT) {
      issues.push(
        `Response is too short (${response.wordCount} words; minimum ${MIN_WORD_COUNT})`,
      );
    }

    if (response.qualityScore === undefined) {
      issues.push("Quality score has not been calculated");
    } else if (response.qualityScore < MIN_QUALITY_SCORE) {
      issues.push(
        `Quality score is below threshold (${response.qualityScore}/100; minimum ${MIN_QUALITY_SCORE})`,
      );
    }

    if (response.kbSourcesUsed.length === 0) {
      issues.push("Response does not reference any knowledge base sources");
    }

    if (priority === "high" && response.wordCount < MIN_WORD_COUNT) {
      issues.push("High-priority question has an insufficient response");
    }
  }

  return issues;
}

// ── Suggestion generation ──

function generateSuggestions(
  question: RfpQuestion,
  status: ChecklistItemStatus,
): string[] {
  const suggestions: string[] = [];

  if (status === "missing") {
    suggestions.push("Generate a response for this question");
    if (question.priority === "high") {
      suggestions.push("Prioritize this question due to its high weight");
    }
    return suggestions;
  }

  if (status === "needs-review") {
    suggestions.push("Review and finalize the response before export");
  }

  if (question.response && question.response.wordCount < MIN_WORD_COUNT) {
    suggestions.push("Expand the response with more detail and supporting evidence");
  }

  if (
    question.response &&
    question.response.qualityScore !== undefined &&
    question.response.qualityScore < MIN_QUALITY_SCORE
  ) {
    suggestions.push("Regenerate or manually edit to improve quality score");
  }

  // Add category-specific suggestions for non-complete items
  if (status !== "complete") {
    const categorySuggestions = CATEGORY_SUGGESTIONS[question.category];
    if (categorySuggestions.length > 0) {
      // Pick the first suggestion that is most relevant
      suggestions.push(categorySuggestions[0]);
    }
  }

  return suggestions;
}

// ── Build a single checklist item ──

function buildChecklistItem(question: RfpQuestion): ChecklistItem {
  const status = determineStatus(question);
  const issues = detectIssues(question, status);
  const suggestions = generateSuggestions(question, status);

  return {
    questionId: question.id,
    questionNumber: question.number,
    questionText: question.text,
    category: question.category,
    status,
    responseWordCount: question.response?.wordCount ?? 0,
    qualityScore: question.response?.qualityScore,
    issues,
    suggestions,
  };
}

// ── Overall score calculation ──

/**
 * Calculates a weighted overall compliance score (0-100).
 *
 * Weighting:
 * - Completion (40%): fraction of questions with any response
 * - Quality (30%): average quality score across scored responses
 * - Coverage (30%): fraction of questions that are fully complete
 */
function calculateOverallScore(items: ChecklistItem[], questions: RfpQuestion[]): number {
  if (items.length === 0) return 0;

  // Completion: fraction of questions that have a response (not missing)
  const withResponse = items.filter((i) => i.status !== "missing").length;
  const completionRatio = withResponse / items.length;

  // Quality: average quality score across questions that have one
  const scoredItems = items.filter((i) => i.qualityScore !== undefined);
  const avgQuality =
    scoredItems.length > 0
      ? scoredItems.reduce((sum, i) => sum + (i.qualityScore ?? 0), 0) / scoredItems.length
      : 0;
  const qualityRatio = avgQuality / 100;

  // Coverage: fraction fully complete
  const completeCount = items.filter((i) => i.status === "complete").length;
  const coverageRatio = completeCount / items.length;

  // Apply priority weighting: high-priority questions count double
  let weightedComplete = 0;
  let totalWeight = 0;
  for (let i = 0; i < items.length; i++) {
    const q = questions[i];
    const weight = q.priority === "high" ? 2 : q.priority === "medium" ? 1.5 : 1;
    totalWeight += weight;
    if (items[i].status === "complete") {
      weightedComplete += weight;
    }
  }
  const weightedCoverageRatio = totalWeight > 0 ? weightedComplete / totalWeight : 0;

  // Blend the coverage ratio with the priority-weighted version
  const blendedCoverage = (coverageRatio + weightedCoverageRatio) / 2;

  const score = Math.round(
    completionRatio * 40 + qualityRatio * 30 + blendedCoverage * 30,
  );

  return Math.max(0, Math.min(100, score));
}

// ── Public API ──

/**
 * Analyze all questions and their responses to produce a compliance report.
 */
export function generateChecklist(questions: RfpQuestion[]): ComplianceReport {
  const items = questions.map(buildChecklistItem);

  const complete = items.filter((i) => i.status === "complete").length;
  const partial = items.filter((i) => i.status === "partial").length;
  const missing = items.filter((i) => i.status === "missing").length;
  const needsReview = items.filter((i) => i.status === "needs-review").length;

  return {
    totalQuestions: items.length,
    complete,
    partial,
    missing,
    needsReview,
    overallScore: calculateOverallScore(items, questions),
    items,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Produce a human-readable summary paragraph suitable for exported documents.
 */
export function getChecklistSummaryText(report: ComplianceReport): string {
  const { totalQuestions, complete, partial, missing, needsReview, overallScore } = report;

  if (totalQuestions === 0) {
    return "No questions have been loaded for compliance review.";
  }

  const parts: string[] = [];

  parts.push(
    `This proposal addresses ${totalQuestions} RFP requirement${totalQuestions === 1 ? "" : "s"} ` +
      `with an overall compliance score of ${overallScore}%.`,
  );

  if (complete > 0) {
    parts.push(
      `${complete} question${complete === 1 ? " is" : "s are"} fully addressed.`,
    );
  }

  if (partial > 0) {
    parts.push(
      `${partial} question${partial === 1 ? " has" : "s have"} partial responses that may need further detail.`,
    );
  }

  if (missing > 0) {
    parts.push(
      `${missing} question${missing === 1 ? " remains" : "s remain"} unanswered.`,
    );
  }

  if (needsReview > 0) {
    parts.push(
      `${needsReview} response${needsReview === 1 ? "" : "s"} ${needsReview === 1 ? "is" : "are"} pending review before finalization.`,
    );
  }

  if (overallScore >= 90) {
    parts.push("The proposal is in strong shape for submission.");
  } else if (overallScore >= 70) {
    parts.push("The proposal is substantially complete but would benefit from targeted improvements.");
  } else if (overallScore >= 50) {
    parts.push("Significant gaps remain; additional work is recommended before submission.");
  } else {
    parts.push("The proposal requires substantial additional work before it is ready for submission.");
  }

  return parts.join(" ");
}

/**
 * Break down compliance metrics by question category.
 */
export function getCategoryCompliance(
  report: ComplianceReport,
): Array<{
  category: QuestionCategory;
  label: string;
  total: number;
  complete: number;
  score: number;
}> {
  const categories = Object.keys(CATEGORY_CONFIG) as QuestionCategory[];

  return categories
    .map((category) => {
      const categoryItems = report.items.filter((i) => i.category === category);
      const total = categoryItems.length;

      if (total === 0) {
        return { category, label: CATEGORY_CONFIG[category].label, total: 0, complete: 0, score: 0 };
      }

      const complete = categoryItems.filter((i) => i.status === "complete").length;

      // Score: blend completion ratio with average quality of scored items
      const completionRatio = complete / total;
      const scoredItems = categoryItems.filter((i) => i.qualityScore !== undefined);
      const avgQuality =
        scoredItems.length > 0
          ? scoredItems.reduce((sum, i) => sum + (i.qualityScore ?? 0), 0) / scoredItems.length
          : 0;
      const qualityRatio = avgQuality / 100;

      // 60% completion, 40% quality
      const score = Math.round(completionRatio * 60 + qualityRatio * 40);

      return {
        category,
        label: CATEGORY_CONFIG[category].label,
        total,
        complete,
        score: Math.max(0, Math.min(100, score)),
      };
    })
    .filter((entry) => entry.total > 0);
}
