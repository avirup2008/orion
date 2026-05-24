"use client";

import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import React from "react";
import type { RfpQuestion, QuestionCategory, SectionSummary, ProjectCost } from "@/types";
import { CATEGORY_CONFIG } from "@/types";

// ── Client context ──

export interface ClientContext {
  companyName: string;
  industry: string;
  size: "" | "SMB" | "Mid-Market" | "Enterprise";
  painPoints: string;
}

// ── Clarification state ──

export interface ClarificationState {
  isComplete: boolean;
  detectedModules: string[];
  answers: Record<string, string>; // questionId -> answer
}

// ── App state ──

export interface AppState {
  // Workflow
  currentView: "intake" | "studio" | "costing" | "differentiators";
  showClarification: boolean;

  // Intake data
  client: ClientContext;
  questions: RfpQuestion[];
  activeQuestionId: string | null;

  // Clarification
  clarification: ClarificationState;

  // Upload state
  referenceDocNames: string[];
}

// ── Actions ──

export type AppAction =
  | { type: "SET_VIEW"; view: "intake" | "studio" | "costing" | "differentiators" }
  | { type: "SET_CLIENT"; client: Partial<ClientContext> }
  | { type: "ADD_QUESTIONS"; questions: RfpQuestion[] }
  | { type: "CLEAR_QUESTIONS" }
  | { type: "SET_ACTIVE_QUESTION"; id: string | null }
  | { type: "UPDATE_QUESTION"; id: string; updates: Partial<RfpQuestion> }
  | { type: "DELETE_QUESTION"; id: string }
  | { type: "REORDER_QUESTIONS"; questions: RfpQuestion[] }
  | { type: "ADD_REFERENCE_DOC"; name: string }
  | { type: "REMOVE_REFERENCE_DOC"; name: string }
  | { type: "SHOW_CLARIFICATION"; show: boolean }
  | { type: "SET_DETECTED_MODULES"; modules: string[] }
  | { type: "SET_CLARIFICATION_ANSWER"; questionId: string; answer: string }
  | { type: "COMPLETE_CLARIFICATION" };

// ── Initial state ──

export const initialState: AppState = {
  currentView: "intake",
  showClarification: false,
  client: {
    companyName: "",
    industry: "",
    size: "",
    painPoints: "",
  },
  questions: [],
  activeQuestionId: null,
  clarification: {
    isComplete: false,
    detectedModules: [],
    answers: {},
  },
  referenceDocNames: [],
};

// ── Reducer ──

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_VIEW":
      return { ...state, currentView: action.view };

    case "SET_CLIENT":
      return { ...state, client: { ...state.client, ...action.client } };

    case "ADD_QUESTIONS": {
      const renumbered = action.questions.map((q, i) => ({
        ...q,
        number: state.questions.length + i + 1,
      }));
      return { ...state, questions: [...state.questions, ...renumbered] };
    }

    case "CLEAR_QUESTIONS":
      return { ...state, questions: [], activeQuestionId: null };

    case "SET_ACTIVE_QUESTION":
      return { ...state, activeQuestionId: action.id };

    case "UPDATE_QUESTION":
      return {
        ...state,
        questions: state.questions.map((q) =>
          q.id === action.id ? { ...q, ...action.updates } : q
        ),
      };

    case "DELETE_QUESTION":
      return {
        ...state,
        questions: state.questions
          .filter((q) => q.id !== action.id)
          .map((q, i) => ({ ...q, number: i + 1 })),
        activeQuestionId:
          state.activeQuestionId === action.id ? null : state.activeQuestionId,
      };

    case "REORDER_QUESTIONS":
      return { ...state, questions: action.questions };

    case "ADD_REFERENCE_DOC":
      return {
        ...state,
        referenceDocNames: [...state.referenceDocNames, action.name],
      };

    case "REMOVE_REFERENCE_DOC":
      return {
        ...state,
        referenceDocNames: state.referenceDocNames.filter(
          (n) => n !== action.name
        ),
      };

    case "SHOW_CLARIFICATION":
      return { ...state, showClarification: action.show };

    case "SET_DETECTED_MODULES":
      return {
        ...state,
        clarification: { ...state.clarification, detectedModules: action.modules },
      };

    case "SET_CLARIFICATION_ANSWER":
      return {
        ...state,
        clarification: {
          ...state.clarification,
          answers: { ...state.clarification.answers, [action.questionId]: action.answer },
        },
      };

    case "COMPLETE_CLARIFICATION":
      return {
        ...state,
        showClarification: false,
        clarification: { ...state.clarification, isComplete: true },
      };

    default:
      return state;
  }
}

// ── Selectors ──

export function getSectionSummaries(questions: RfpQuestion[]): SectionSummary[] {
  const categories: QuestionCategory[] = [
    "technical", "functional", "methodology", "team", "pricing", "references",
  ];
  return categories.map((cat) => {
    const section = questions.filter((q) => q.category === cat);
    return {
      category: cat,
      total: section.length,
      completed: section.filter((q) => q.status === "final" || q.status === "review").length,
      color: CATEGORY_CONFIG[cat].color,
    };
  }).filter((s) => s.total > 0);
}

export function getCompletionPercent(questions: RfpQuestion[]): number {
  if (questions.length === 0) return 0;
  const done = questions.filter((q) => q.status === "final").length;
  return Math.round((done / questions.length) * 100);
}

// ── Context ──

const AppStateContext = createContext<AppState>(initialState);
const AppDispatchContext = createContext<Dispatch<AppAction>>(() => {});

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return React.createElement(
    AppStateContext.Provider,
    { value: state },
    React.createElement(
      AppDispatchContext.Provider,
      { value: dispatch },
      children
    )
  );
}

export function useAppState() {
  return useContext(AppStateContext);
}

export function useAppDispatch() {
  return useContext(AppDispatchContext);
}
