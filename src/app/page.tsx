"use client";

import { useCallback, useMemo } from "react";
import { useAppState, useAppDispatch, getSectionSummaries, getCompletionPercent } from "@/lib/store";
import IntakePage from "@/components/intake/IntakePage";
import OutlinePanel from "@/components/layout/OutlinePanel";
import EditorPanel from "@/components/layout/EditorPanel";
import ContextPanel from "@/components/layout/ContextPanel";
import ClarificationPanel from "@/components/clarification/ClarificationPanel";
import CostDashboard from "@/components/costing/CostDashboard";
import DifferentiatorsPanel from "@/components/differentiators/DifferentiatorsPanel";
import ProposalDashboard from "@/components/proposals/ProposalDashboard";
import { mockPastProposals } from "@/data/mock-project";
import { findRelevantKB } from "@/data/knowledge-base";
import type { ProposalProject, KbMatch } from "@/types";

export default function Home() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  // Build project object from live state
  const project: ProposalProject = useMemo(() => ({
    clientName: state.client.companyName || "Untitled Client",
    rfpTitle: state.client.industry
      ? `${state.client.companyName || "Client"} — ${state.client.industry} RFP`
      : `${state.client.companyName || "New"} Proposal`,
    sections: getSectionSummaries(state.questions),
    questions: state.questions,
    completionPercent: getCompletionPercent(state.questions),
  }), [state.client, state.questions]);

  const activeQuestion = useMemo(
    () => state.questions.find((q) => q.id === state.activeQuestionId) ?? null,
    [state.questions, state.activeQuestionId]
  );

  const activeIndex = useMemo(
    () => state.questions.findIndex((q) => q.id === state.activeQuestionId),
    [state.questions, state.activeQuestionId]
  );

  // Live KB matches based on active question
  const liveKbMatches: KbMatch[] = useMemo(() => {
    if (!activeQuestion) return [];
    const matches = findRelevantKB(activeQuestion.text, 5);
    return matches.map((m, i) => ({
      id: `kb-${i}`,
      title: m.title,
      source: m.source,
      matchScore: m.score,
      preview: m.snippet,
    }));
  }, [activeQuestion]);

  const handlePrev = useCallback(() => {
    if (activeIndex > 0) {
      dispatch({ type: "SET_ACTIVE_QUESTION", id: state.questions[activeIndex - 1].id });
    }
  }, [activeIndex, state.questions, dispatch]);

  const handleNext = useCallback(() => {
    if (activeIndex < state.questions.length - 1) {
      dispatch({ type: "SET_ACTIVE_QUESTION", id: state.questions[activeIndex + 1].id });
    }
  }, [activeIndex, state.questions, dispatch]);

  const handleSelectQuestion = useCallback(
    (id: string | null) => {
      dispatch({ type: "SET_ACTIVE_QUESTION", id });
    },
    [dispatch]
  );

  const handleBackToStudio = useCallback(() => {
    dispatch({ type: "SET_VIEW", view: "studio" });
  }, [dispatch]);

  // Route between views
  if (state.currentView === "intake") {
    return <IntakePage />;
  }

  if (state.currentView === "costing") {
    return <CostDashboard onBack={handleBackToStudio} />;
  }

  if (state.currentView === "differentiators") {
    return <DifferentiatorsPanel onBack={handleBackToStudio} />;
  }

  if (state.currentView === "proposals") {
    return <ProposalDashboard onBack={handleBackToStudio} />;
  }

  return (
    <>
      <div className="h-full flex overflow-hidden">
        <OutlinePanel
          project={project}
          activeQuestionId={state.activeQuestionId}
          onSelectQuestion={handleSelectQuestion}
        />
        <EditorPanel
          question={activeQuestion}
          onPrev={handlePrev}
          onNext={handleNext}
          hasPrev={activeIndex > 0}
          hasNext={activeIndex < state.questions.length - 1}
        />
        <ContextPanel
          kbMatches={liveKbMatches}
          pastProposals={mockPastProposals}
        />
      </div>
      {state.showClarification && <ClarificationPanel />}
    </>
  );
}
