// ── Clarification questions per Anaplan module (CLR-04) ──
// Gathered during the clarification flow to enrich response generation

export interface ClarificationQuestion {
  id: string;
  question: string;
  type: "text" | "select" | "number";
  options?: string[];
  placeholder?: string;
  helpText?: string;
}

export interface ClarificationSection {
  id: string;
  title: string;
  description: string;
  questions: ClarificationQuestion[];
}

// ── Rate Card Questions (CLR-01) ──
export const RATE_CARD_QUESTIONS: ClarificationSection = {
  id: "rate-card",
  title: "Rate Card",
  description: "Configure daily rates by role for cost estimation",
  questions: [
    {
      id: "rc-currency",
      question: "Preferred currency?",
      type: "select",
      options: ["EUR", "USD", "GBP"],
    },
    {
      id: "rc-architect",
      question: "Solution Architect daily rate",
      type: "number",
      placeholder: "e.g. 2200",
      helpText: "EUR/day. Market range: €1,800–€2,500",
    },
    {
      id: "rc-model-builder",
      question: "Model Builder daily rate",
      type: "number",
      placeholder: "e.g. 1600",
      helpText: "EUR/day. Market range: €1,200–€1,800",
    },
    {
      id: "rc-pm",
      question: "Project Manager daily rate",
      type: "number",
      placeholder: "e.g. 1800",
      helpText: "EUR/day. Market range: €1,400–€2,000",
    },
    {
      id: "rc-analyst",
      question: "Business Analyst daily rate",
      type: "number",
      placeholder: "e.g. 1200",
      helpText: "EUR/day. Market range: €900–€1,400",
    },
    {
      id: "rc-change-mgr",
      question: "Change Manager daily rate",
      type: "number",
      placeholder: "e.g. 1500",
      helpText: "EUR/day. Market range: €1,200–€1,800",
    },
  ],
};

// ── Team Composition Questions (CLR-02) ──
export const TEAM_QUESTIONS: ClarificationSection = {
  id: "team",
  title: "Team Composition",
  description: "Define team structure and resource allocation",
  questions: [
    {
      id: "team-size",
      question: "Typical team size for this engagement?",
      type: "select",
      options: ["Small (2–3)", "Medium (4–6)", "Large (7–10)", "Enterprise (10+)"],
    },
    {
      id: "team-mix",
      question: "Onshore/offshore resource mix?",
      type: "select",
      options: [
        "100% onshore",
        "80/20 onshore/offshore",
        "60/40 onshore/offshore",
        "50/50 onshore/offshore",
      ],
    },
    {
      id: "team-seniority",
      question: "Seniority distribution?",
      type: "select",
      options: [
        "Senior-heavy (70% senior, 30% mid)",
        "Balanced (50% senior, 50% mid)",
        "Delivery-heavy (30% senior, 70% mid)",
      ],
    },
    {
      id: "team-dedicated",
      question: "Are team members dedicated full-time?",
      type: "select",
      options: ["Full-time dedicated", "Part-time / shared across projects"],
    },
  ],
};

// ── Engagement Assumptions (CLR-03) ──
export const ENGAGEMENT_QUESTIONS: ClarificationSection = {
  id: "engagement",
  title: "Engagement Assumptions",
  description: "Duration, cadence, travel, and other parameters",
  questions: [
    {
      id: "eng-duration",
      question: "Target engagement duration?",
      type: "select",
      options: [
        "8–12 weeks (accelerated)",
        "12–16 weeks (standard)",
        "16–24 weeks (enterprise)",
        "24+ weeks (multi-module)",
      ],
    },
    {
      id: "eng-sprint",
      question: "Sprint cadence?",
      type: "select",
      options: ["1-week sprints", "2-week sprints", "3-week sprints"],
    },
    {
      id: "eng-travel",
      question: "Travel requirements?",
      type: "select",
      options: [
        "No travel (fully remote)",
        "Quarterly onsite visits",
        "Monthly onsite visits",
        "Weekly onsite presence",
      ],
    },
    {
      id: "eng-hypercare",
      question: "Hypercare support duration?",
      type: "select",
      options: [
        "2 weeks",
        "4 weeks (standard)",
        "8 weeks (extended)",
        "12+ weeks (enterprise)",
      ],
    },
    {
      id: "eng-margin",
      question: "Target margin percentage?",
      type: "number",
      placeholder: "e.g. 35",
      helpText: "Typical range: 25%–40%",
    },
  ],
};

// ── Module-Specific Questions (CLR-04) ──
export const MODULE_QUESTIONS: Record<string, ClarificationSection> = {
  fpa: {
    id: "fpa",
    title: "FP&A",
    description: "Financial Planning & Analysis specifics",
    questions: [
      {
        id: "fpa-1",
        question: "Which planning processes are in scope?",
        type: "select",
        options: ["Budgeting", "Forecasting", "Reporting", "All of the above"],
      },
      {
        id: "fpa-2",
        question: "How many entities or cost centers?",
        type: "text",
        placeholder: "e.g. 50 entities across 12 countries",
      },
      {
        id: "fpa-3",
        question: "What is the current planning tool being replaced?",
        type: "text",
        placeholder: "e.g. Excel, Hyperion, Adaptive",
      },
      {
        id: "fpa-4",
        question: "Do you require multi-currency consolidation?",
        type: "select",
        options: ["Yes", "No", "Under evaluation"],
      },
    ],
  },
  supplyChain: {
    id: "supplyChain",
    title: "Supply Chain",
    description: "Supply Chain Planning specifics",
    questions: [
      {
        id: "scp-1",
        question: "What is your S&OP maturity level?",
        type: "select",
        options: [
          "No formal process",
          "Basic monthly meetings",
          "Structured S&OP",
          "Integrated IBP",
        ],
      },
      {
        id: "scp-2",
        question: "How many SKUs do you manage?",
        type: "text",
        placeholder: "e.g. 5,000 active SKUs",
      },
      {
        id: "scp-3",
        question: "What is your demand planning frequency?",
        type: "select",
        options: ["Weekly", "Monthly", "Quarterly"],
      },
      {
        id: "scp-4",
        question: "How many distribution centers or warehouses?",
        type: "text",
        placeholder: "e.g. 12 DCs across Europe",
      },
    ],
  },
  salesPerformance: {
    id: "salesPerformance",
    title: "Sales Performance",
    description: "Sales Performance Management specifics",
    questions: [
      {
        id: "spm-1",
        question: "How many compensation plans do you manage?",
        type: "text",
        placeholder: "e.g. 8 distinct plans",
      },
      {
        id: "spm-2",
        question: "What is your payment frequency?",
        type: "select",
        options: ["Monthly", "Quarterly", "Semi-annual", "Annual"],
      },
      {
        id: "spm-3",
        question: "How many sales reps are in scope?",
        type: "text",
        placeholder: "e.g. 500 sales reps globally",
      },
      {
        id: "spm-4",
        question: "Do you need crediting/split credit rules?",
        type: "select",
        options: ["Yes", "No", "Under evaluation"],
      },
    ],
  },
  workforce: {
    id: "workforce",
    title: "Workforce Planning",
    description: "Workforce Planning specifics",
    questions: [
      {
        id: "wfp-1",
        question: "How many employees/positions are in scope?",
        type: "text",
        placeholder: "e.g. 10,000 positions globally",
      },
      {
        id: "wfp-2",
        question: "What HCM system is the source of record?",
        type: "select",
        options: [
          "Workday",
          "SAP SuccessFactors",
          "Oracle HCM",
          "ADP",
          "BambooHR",
          "Other",
        ],
      },
      {
        id: "wfp-3",
        question: "Do you need attrition/turnover modeling?",
        type: "select",
        options: ["Yes", "No", "Nice to have"],
      },
      {
        id: "wfp-4",
        question: "Is DEI reporting a requirement?",
        type: "select",
        options: ["Yes", "No"],
      },
    ],
  },
  territoryQuota: {
    id: "territoryQuota",
    title: "Territory & Quota",
    description: "Territory & Quota Planning specifics",
    questions: [
      {
        id: "tqp-1",
        question: "How many territories do you currently manage?",
        type: "text",
        placeholder: "e.g. 200 territories",
      },
      {
        id: "tqp-2",
        question: "What is your quota allocation approach?",
        type: "select",
        options: ["Top-down", "Bottom-up", "Hybrid"],
      },
      {
        id: "tqp-3",
        question: "Do you need overlay/specialist territory support?",
        type: "select",
        options: ["Yes", "No"],
      },
    ],
  },
  custom: {
    id: "custom",
    title: "Custom / Connected Planning",
    description: "Custom solution specifics",
    questions: [
      {
        id: "cust-1",
        question: "What business functions need to be connected?",
        type: "text",
        placeholder: "e.g. Finance + Supply Chain + HR",
      },
      {
        id: "cust-2",
        question: "How many source systems require integration?",
        type: "text",
        placeholder: "e.g. 5 systems (SAP, Salesforce, Workday, etc.)",
      },
      {
        id: "cust-3",
        question: "Do you need custom approval workflows?",
        type: "select",
        options: ["Yes", "No", "Under evaluation"],
      },
    ],
  },
};

/** Detect which Anaplan modules are relevant based on question text */
export function detectModulesFromQuestions(
  questions: { text: string; category: string }[]
): string[] {
  const moduleKeywordMap: Record<string, string[]> = {
    fpa: [
      "budget", "forecast", "p&l", "revenue", "consolidation", "variance",
      "financial", "planning cycle", "reporting", "actuals", "cost center",
      "chart of accounts", "general ledger", "cash flow", "balance sheet",
    ],
    supplyChain: [
      "demand", "supply", "inventory", "s&op", "logistics", "procurement",
      "warehouse", "distribution", "safety stock", "production planning",
      "capacity", "demand sensing", "replenishment",
    ],
    salesPerformance: [
      "commission", "quota", "incentive", "compensation", "attainment",
      "comp plan", "accelerator", "crediting", "payout", "earnings",
    ],
    workforce: [
      "headcount", "hiring", "attrition", "workforce", "fte", "contractor",
      "benefits", "turnover", "retention", "skills gap", "labor cost",
    ],
    territoryQuota: [
      "territory", "coverage", "carving", "segmentation", "account assignment",
      "gini", "fairness", "quota allocation",
    ],
  };

  const scores: Record<string, number> = {};
  const allText = questions.map((q) => q.text.toLowerCase()).join(" ");

  for (const [mod, keywords] of Object.entries(moduleKeywordMap)) {
    let score = 0;
    for (const kw of keywords) {
      if (allText.includes(kw)) score += kw.includes(" ") ? 2 : 1;
    }
    if (score > 0) scores[mod] = score;
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0
    ? sorted.map(([mod]) => mod)
    : ["fpa"]; // default to FP&A if no matches
}

/** Get all relevant clarification sections based on detected modules */
export function getClarificationSections(
  detectedModules: string[]
): ClarificationSection[] {
  const sections: ClarificationSection[] = [
    RATE_CARD_QUESTIONS,
    TEAM_QUESTIONS,
    ENGAGEMENT_QUESTIONS,
  ];

  // Add module-specific questions for detected modules
  for (const mod of detectedModules) {
    if (MODULE_QUESTIONS[mod]) {
      sections.push(MODULE_QUESTIONS[mod]);
    }
  }

  return sections;
}
