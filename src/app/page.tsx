"use client";

import { useCallback, useMemo } from "react";
import { useAppState, useAppDispatch, getSectionSummaries, getCompletionPercent } from "@/lib/store";
import IntakePage from "@/components/intake/IntakePage";
import OutlinePanel from "@/components/layout/OutlinePanel";
import EditorPanel from "@/components/layout/EditorPanel";
import ContextPanel from "@/components/layout/ContextPanel";
import { mockKbMatches, mockPastProposals } from "@/data/mock-project";
import type { ProposalProject } from "@/types";

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

  // Route between views
  if (state.currentView === "intake") {
    return <IntakePage />;
  }

  return (
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
        kbMatches={mockKbMatches}
        pastProposals={mockPastProposals}
      />
    </div>
  );
}
