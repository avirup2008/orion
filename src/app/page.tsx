"use client";

import { useState, useCallback, useMemo } from "react";
import OutlinePanel from "@/components/layout/OutlinePanel";
import EditorPanel from "@/components/layout/EditorPanel";
import ContextPanel from "@/components/layout/ContextPanel";
import { mockProject, mockKbMatches, mockPastProposals } from "@/data/mock-project";

export default function ProposalStudio() {
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>("q2");

  const activeQuestion = useMemo(
    () => mockProject.questions.find((q) => q.id === activeQuestionId) ?? null,
    [activeQuestionId]
  );

  const activeIndex = useMemo(
    () => mockProject.questions.findIndex((q) => q.id === activeQuestionId),
    [activeQuestionId]
  );

  const handlePrev = useCallback(() => {
    if (activeIndex > 0) {
      setActiveQuestionId(mockProject.questions[activeIndex - 1].id);
    }
  }, [activeIndex]);

  const handleNext = useCallback(() => {
    if (activeIndex < mockProject.questions.length - 1) {
      setActiveQuestionId(mockProject.questions[activeIndex + 1].id);
    }
  }, [activeIndex]);

  return (
    <div className="h-full flex overflow-hidden">
      <OutlinePanel
        project={mockProject}
        activeQuestionId={activeQuestionId}
        onSelectQuestion={setActiveQuestionId}
      />
      <EditorPanel
        question={activeQuestion}
        onPrev={handlePrev}
        onNext={handleNext}
        hasPrev={activeIndex > 0}
        hasNext={activeIndex < mockProject.questions.length - 1}
      />
      <ContextPanel
        kbMatches={mockKbMatches}
        pastProposals={mockPastProposals}
      />
    </div>
  );
}
