// ═══════════════════════════════════════════════════════════════════
// ANAPLAN KNOWLEDGE BASE — Ported from artifact Section 6
// Full Anaplan domain knowledge for RFP response generation
// ═══════════════════════════════════════════════════════════════════

// ── Types ──

export type AnaplanModule = keyof typeof ANAPLAN_KB.platform.modules;
export type MethodologyPhase = typeof ANAPLAN_KB.methodology.anaplanWay.phases[number]["name"];
export type IndustryKey = keyof typeof ANAPLAN_KB.metrics.roi.byIndustry;
export type RiskProbability = "low" | "medium" | "high";
export type RiskImpact = "low" | "medium" | "high" | "critical";
export type Complexity = "standard" | "complex" | "enterprise";

export interface KBMatch {
  title: string;
  source: "Built-in KB" | "Company Profile" | "User Docs";
  score: number;
  snippet: string;
  category: string;
}

// ── Meta ──

export const KB_META = {
  version: "1.0.0",
  lastUpdated: "2026-05-24",
  platformVersion: "Anaplan 2026.1",
  moduleCount: 6,
  description: "Embedded Anaplan domain knowledge base for Orion Proposal Engine",
} as const;

// ── EyeOn Company Profile ──

export const EYEON_PROFILE = {
  name: "EyeOn",
  fullName: "EyeOn B.V.",
  tagline: "Supply Chain Planning Experts",
  headquarters: "Breda, Netherlands",
  founded: 2004,
  specialization: "Supply chain planning consulting and Anaplan implementation",
  anaplanPartnerTier: "Platinum Partner",
  certifications: [
    "Anaplan Platinum Partner",
    "ISO 27001 Certified",
    "All consultants Level 3 Master Anaplanner certified",
  ],
  teamSize: "50+ planning professionals",
  industries: [
    "Consumer Goods (CPG/FMCG)",
    "Manufacturing",
    "Retail",
    "Life Sciences & Healthcare",
    "Energy & Utilities",
    "Technology",
  ],
  keyClients: [
    "Unilever", "FrieslandCampina", "Heineken",
    "Philips", "AkzoNobel", "DSM-Firmenich",
    "Shell", "Vanderlande", "Boskalis",
  ],
  differentiators: [
    "Dutch precision meets global scale — proven methodology across 100+ implementations",
    "ETO App: proprietary engagement tracking and optimization platform",
    "Deep supply chain DNA — we understand the business before we build the model",
    "Independent: not a Big 4 subsidiary, not a body shop — pure Anaplan expertise",
    "Knowledge transfer focus: your team owns the model within 90 days",
  ],
  etoApp: {
    name: "ETO App",
    description: "EyeOn's proprietary Engagement Tracking & Optimization platform for managing Anaplan implementation projects",
    features: [
      "Real-time implementation progress dashboards",
      "Sprint velocity and burndown tracking",
      "Resource allocation and utilization monitoring",
      "Risk register with automated early warning alerts",
      "Client satisfaction pulse surveys",
      "Knowledge base integration for accelerator deployment",
    ],
  },
  methodology: {
    name: "EyeOn Accelerated Delivery",
    phases: ["Assess", "Design", "Build", "Validate", "Launch", "Sustain"],
    avgDeliveryWeeks: 12,
    description: "Our accelerated delivery methodology combines Anaplan Way best practices with EyeOn-specific accelerators, templates, and governance frameworks refined across 100+ implementations",
  },
} as const;

// ═══════════════════════════════════════════════════════════════════
// ANAPLAN KB — Full Knowledge Base
// ═══════════════════════════════════════════════════════════════════

export const ANAPLAN_KB = {
  // ── PLATFORM MODULES ──
  platform: {
    modules: {
      fpa: {
        name: "Financial Planning and Analysis",
        shortName: "FP&A",
        capabilities: [
          "Driver-based planning models that link operational KPIs to financial outcomes, enabling dynamic what-if analysis across revenue, cost, and margin assumptions",
          "Rolling forecast automation that replaces static annual budgets with continuously updated 12-18 month horizons, reducing forecast cycle time by up to 70%",
          "Multi-scenario analysis allowing finance teams to model best-case, worst-case, and most-likely scenarios simultaneously with instant P&L, balance sheet, and cash flow impact visibility",
          "Variance analysis with automated actual-vs-budget-vs-forecast comparisons, drill-down by cost center, department, or business unit with configurable threshold alerts",
          "Multi-entity consolidation supporting intercompany eliminations, currency translation, and minority interest calculations across complex legal entity structures",
          "Allocation engine for distributing shared costs (IT, facilities, corporate overhead) across business units using activity-based, headcount-based, or revenue-based drivers",
          "Workforce-integrated planning that connects headcount plans directly to compensation models, enabling real-time labor cost impact analysis as hiring plans change",
          "Revenue modeling with support for subscription, usage-based, project-based, and hybrid revenue recognition patterns including ASC 606 compliance",
          "Cash flow forecasting that aggregates AR/AP aging, capital expenditure schedules, debt service, and working capital requirements into a 13-week or rolling monthly view",
          "Board-ready reporting with automated executive dashboards, management packs, and presentation-quality outputs that refresh in real time as underlying data changes",
        ],
        typicalDuration: { min: 8, max: 16, unit: "weeks" as const },
        complexity: "standard" as const,
        commonIntegrations: ["SAP ECC/S4HANA GL", "Oracle Financials", "Workday Financial Management", "NetSuite", "Power BI/Tableau"],
        keyMetrics: [
          "Forecast accuracy improvement (avg 35-45%)",
          "Planning cycle reduction (avg 70%)",
          "Scenario generation time (minutes vs days)",
          "FTE hours saved per cycle (avg 40-60 hours)",
        ],
        implementationPhases: [
          { name: "Discovery", durationWeeks: 2, activities: ["Requirements gathering", "Current state assessment", "Stakeholder interviews", "Data source inventory"] },
          { name: "Design", durationWeeks: 3, activities: ["Model architecture design", "Data flow mapping", "Dashboard wireframes", "Integration specification"] },
          { name: "Build", durationWeeks: 5, activities: ["Model construction", "Formula development", "Dashboard creation", "Data connection setup", "Unit testing"] },
          { name: "Test", durationWeeks: 2, activities: ["User acceptance testing", "Data validation", "Performance benchmarking", "Parallel run with legacy system"] },
          { name: "Deploy & Hypercare", durationWeeks: 3, activities: ["Production migration", "End-user training", "Admin training", "Hypercare support", "Knowledge transfer"] },
        ],
      },
      supplyChain: {
        name: "Supply Chain Planning",
        shortName: "SCP",
        capabilities: [
          "Statistical demand planning with automated baseline generation using multiple forecasting algorithms (exponential smoothing, ARIMA, machine learning ensembles) and intelligent model selection",
          "Collaborative supply planning that connects procurement, manufacturing, and logistics teams on a single platform with real-time visibility into supplier capacity, lead times, and constraints",
          "Integrated Sales and Operations Planning (S&OP) process with automated workflow, consensus demand generation, supply-demand balancing, and executive review dashboards",
          "Inventory optimization using multi-echelon modeling to determine optimal safety stock levels, reorder points, and replenishment strategies across the distribution network",
          "Capacity planning that models production lines, labor availability, equipment utilization, and outsourcing options to identify bottlenecks before they impact delivery commitments",
          "Supplier collaboration portals enabling real-time PO visibility, delivery confirmations, quality metrics, and collaborative forecast sharing with key suppliers",
          "Logistics optimization for route planning, warehouse allocation, and transportation mode selection that minimizes cost while meeting service level agreements",
          "Demand sensing capabilities that incorporate real-time POS data, weather patterns, social media signals, and economic indicators to improve short-term forecast accuracy",
          "Production scheduling with finite capacity modeling, changeover optimization, and batch size optimization that maximizes throughput while minimizing waste",
          "Multi-echelon planning across raw materials, work-in-progress, and finished goods inventory tiers with network-wide optimization and automatic rebalancing triggers",
        ],
        typicalDuration: { min: 12, max: 24, unit: "weeks" as const },
        complexity: "complex" as const,
        commonIntegrations: ["SAP APO/IBP", "Oracle SCM Cloud", "Kinaxis RapidResponse", "Blue Yonder", "Manhattan Associates", "E2open"],
        keyMetrics: [
          "Demand forecast accuracy improvement (avg 20-30%)",
          "Inventory reduction while maintaining service levels (avg 15-25%)",
          "Service level improvement (avg 5-10 percentage points)",
          "S&OP planning cycle reduction from weeks to days",
        ],
        implementationPhases: [
          { name: "Discovery", durationWeeks: 3, activities: ["Supply chain process mapping", "Data source assessment", "Integration complexity analysis", "Stakeholder alignment"] },
          { name: "Design", durationWeeks: 4, activities: ["Planning hierarchy design", "Model architecture", "Algorithm selection", "Integration blueprints", "Dashboard design"] },
          { name: "Build - Demand", durationWeeks: 4, activities: ["Demand model construction", "Statistical engine configuration", "Consensus workflow setup", "Demand dashboards"] },
          { name: "Build - Supply", durationWeeks: 4, activities: ["Supply model construction", "Capacity modeling", "Inventory optimization rules", "S&OP process automation"] },
          { name: "Test", durationWeeks: 3, activities: ["End-to-end data validation", "Algorithm accuracy testing", "Integration testing", "Performance benchmarking", "UAT"] },
          { name: "Deploy & Hypercare", durationWeeks: 4, activities: ["Phased rollout by region/BU", "Change management", "Training program execution", "Hypercare support", "Continuous improvement roadmap"] },
        ],
      },
      salesPerformance: {
        name: "Sales Performance Management",
        shortName: "SPM",
        capabilities: [
          "Quota planning and allocation with top-down, bottom-up, and hybrid methodologies that distribute targets across geographies, product lines, and individual reps with automated what-if modeling",
          "Territory design and optimization using geographic, account-based, and industry-based segmentation with workload balancing, travel time minimization, and coverage gap analysis",
          "Incentive compensation modeling with support for tiered commissions, accelerators, decelerators, SPIFs, bonuses, MBOs, and multi-component plans with real-time earnings visibility",
          "Crediting rules engine that handles split credits, overlay credits, roll-up credits, and manual adjustments with full audit trail and dispute resolution workflow",
          "Real-time attainment tracking with individual, team, and organizational dashboards showing pacing indicators, rank-and-stack views, and projected year-end performance",
          "Plan modeling and simulation allowing sales operations to test the financial impact of plan design changes before deployment, including total cost of compensation analysis",
          "Exception management workflow for handling disputes, manual adjustments, draw advances, guarantees, and non-standard payment scenarios with approval routing",
          "Payment calculation engine that processes payroll-ready outputs with support for monthly, quarterly, and annual payment cycles including true-up calculations",
          "Analytics dashboards combining CRM pipeline data with compensation data to show the relationship between incentive design and selling behavior",
          "What-if scenario modeling that lets individual reps and managers explore earnings potential under different deal and quota attainment scenarios",
        ],
        typicalDuration: { min: 10, max: 18, unit: "weeks" as const },
        complexity: "complex" as const,
        commonIntegrations: ["Salesforce CRM", "SAP Commissions", "Xactly", "Microsoft Dynamics 365", "HubSpot"],
        keyMetrics: [
          "Commission calculation accuracy improvement (target 99.5%+)",
          "Quota-to-close ratio improvement (avg 10-15%)",
          "Time to deploy plan changes (days to hours)",
          "Sales operations FTE reduction for comp administration (avg 30-40%)",
        ],
        implementationPhases: [
          { name: "Discovery", durationWeeks: 2, activities: ["Plan document review", "Crediting rules documentation", "Data source mapping", "Stakeholder interviews"] },
          { name: "Design", durationWeeks: 3, activities: ["Compensation model architecture", "Crediting logic design", "Payment workflow design", "Dashboard specifications"] },
          { name: "Build", durationWeeks: 5, activities: ["Plan model construction", "Crediting engine build", "Payment calculation setup", "Dashboard development", "Approval workflows"] },
          { name: "Test", durationWeeks: 3, activities: ["Parallel calculation testing", "Historical data validation", "Edge case testing", "Performance testing", "UAT with sales ops"] },
          { name: "Deploy & Hypercare", durationWeeks: 3, activities: ["Production cutover", "Rep-facing portal launch", "Training for sales ops and finance", "First payment cycle support", "Dispute resolution process setup"] },
        ],
      },
      workforce: {
        name: "Workforce Planning",
        shortName: "WFP",
        capabilities: [
          "Headcount planning with position-level detail including start dates, fill rates, vacancy assumptions, and contractor-to-FTE conversion modeling across departments and locations",
          "Total compensation modeling that combines base salary, bonus targets, equity grants, benefits costs, payroll taxes, and employer contributions into fully-loaded cost per employee",
          "Skills gap analysis that maps current workforce capabilities against future requirements, identifying critical skill shortages and informing targeted hiring and L&D investment decisions",
          "Attrition modeling using historical turnover patterns, tenure curves, and predictive indicators to forecast voluntary and involuntary separations by department, role, and risk level",
          "Workforce cost forecasting that projects total people spend across budget periods with scenario-based sensitivity analysis",
          "Hiring pipeline planning that connects approved requisitions to recruiter capacity, sourcing channels, time-to-fill benchmarks, and offer acceptance rates",
          "Organization design scenarios that model restructuring options including reductions in force, team consolidations, and new team creation with full cost impact",
          "DEI metrics tracking and target modeling that measures representation across dimensions by level, function, and location with goal-setting dashboards",
        ],
        typicalDuration: { min: 8, max: 14, unit: "weeks" as const },
        complexity: "standard" as const,
        commonIntegrations: ["Workday HCM", "SAP SuccessFactors", "Oracle HCM Cloud", "ADP", "BambooHR"],
        keyMetrics: [
          "Headcount forecast accuracy (avg improvement 25-35%)",
          "Time to produce workforce plan (reduction from weeks to days)",
          "Labor cost variance vs budget (avg improvement 15-20%)",
          "Scenario modeling speed (minutes vs days for org design options)",
        ],
        implementationPhases: [
          { name: "Discovery", durationWeeks: 2, activities: ["HR data landscape assessment", "Planning process mapping", "Integration requirements", "Stakeholder alignment"] },
          { name: "Design", durationWeeks: 2, activities: ["Position hierarchy design", "Compensation model structure", "Scenario framework", "Dashboard wireframes"] },
          { name: "Build", durationWeeks: 5, activities: ["Headcount model construction", "Compensation calculations", "Attrition modeling", "Dashboard development", "HCM integration"] },
          { name: "Deploy & Hypercare", durationWeeks: 3, activities: ["Production deployment", "HR business partner training", "First planning cycle support", "Ongoing optimization"] },
        ],
      },
      territoryQuota: {
        name: "Territory and Quota Planning",
        shortName: "TQP",
        capabilities: [
          "Territory carving with multi-dimensional segmentation by geography, industry vertical, company size, and named accounts with drag-and-drop rebalancing",
          "Quota allocation using historical performance, market potential, pipeline data, and seasonality patterns with support for top-down, bottom-up, and hybrid approaches",
          "Balance optimization algorithms that equalize territory potential across the sales force while respecting constraints like account relationships and rep location",
          "Coverage analysis with heat maps and white-space identification showing under-served market segments and overlapping territories",
          "Account assignment rules engine with hierarchical logic for parent-child relationships, named account exceptions, and multi-product overlay structures",
          "Overlay management for specialist roles with shared credit rules and collaboration metrics tracking",
          "Ramp modeling for new hires and territory changes that adjusts quota expectations based on tenure and historical ramp curves",
          "Fairness scoring with Gini coefficient analysis, territory potential variance metrics, and automated alerts when assignments create imbalanced distributions",
        ],
        typicalDuration: { min: 6, max: 12, unit: "weeks" as const },
        complexity: "standard" as const,
        commonIntegrations: ["Salesforce", "Microsoft Dynamics", "Gong", "Clari", "Domo"],
        keyMetrics: [
          "Territory balance improvement (Gini coefficient reduction avg 20-30%)",
          "Quota attainment distribution improvement (more reps in 80-120% band)",
          "Annual territory planning cycle time reduction (avg 60-70%)",
          "Sales coverage gap reduction (avg 15-25% more addressable market covered)",
        ],
        implementationPhases: [
          { name: "Discovery", durationWeeks: 2, activities: ["Current territory structure analysis", "Data quality assessment", "Rule documentation", "Stakeholder interviews"] },
          { name: "Design", durationWeeks: 2, activities: ["Segmentation model design", "Allocation methodology selection", "Fairness metrics definition", "Workflow design"] },
          { name: "Build", durationWeeks: 4, activities: ["Territory model construction", "Quota allocation engine", "Optimization algorithms", "Dashboard development", "CRM integration"] },
          { name: "Deploy & Hypercare", durationWeeks: 2, activities: ["Annual planning cycle execution", "Manager review and approval workflow", "Rep communication", "Mid-year rebalancing process setup"] },
        ],
      },
      custom: {
        name: "Custom Solutions / Connected Planning",
        shortName: "Custom",
        capabilities: [
          "Cross-functional planning models that break down silos between finance, sales, supply chain, and HR by connecting shared dimensions across departmental models",
          "Custom workflow engines with configurable approval chains, notification rules, escalation paths, and SLA tracking for bespoke business processes",
          "Data hub integration patterns that centralize master data management, handle data quality rules, and orchestrate ETL/ELT pipelines across source systems",
          "Multi-model orchestration that coordinates calculation sequences, data dependencies, and refresh schedules across interconnected Anaplan models",
          "API-driven automation using Anaplan's REST APIs and CloudWorks connectors to schedule imports, trigger calculations, and export results",
          "Custom executive dashboards combining data from multiple Anaplan models into unified views with role-based access and drill-through navigation",
          "Embedded analytics with real-time KPI monitoring, anomaly detection alerts, trend analysis, and natural language summaries",
          "External data feed integration connecting market data, weather data, IoT sensor data, and social media signals into planning models",
          "Conditional logic engines with complex business rule processing including nested if-then-else trees and time-variant rule application",
          "Approval and sign-off workflows with digital signatures, version control, change tracking, and audit trail generation for SOX compliance",
        ],
        typicalDuration: { min: 10, max: 20, unit: "weeks" as const },
        complexity: "enterprise" as const,
        commonIntegrations: ["REST APIs", "Anaplan Data Hub", "CloudWorks", "MuleSoft", "Informatica", "Boomi"],
        keyMetrics: [
          "Planning cycle reduction across connected functions (avg 40-60%)",
          "Data reconciliation effort reduction (avg 70-80%)",
          "Cross-functional visibility improvement (single source of truth adoption)",
          "Automation of manual data transfers (avg 90%+ of scheduled jobs automated)",
        ],
        implementationPhases: [
          { name: "Discovery", durationWeeks: 3, activities: ["Cross-functional process mapping", "Integration architecture assessment", "Data governance review", "Stakeholder alignment across BUs"] },
          { name: "Design", durationWeeks: 3, activities: ["Connected model architecture", "Data hub design", "API integration blueprints", "Custom workflow specifications", "Security model design"] },
          { name: "Build", durationWeeks: 6, activities: ["Model construction", "Integration development", "Custom dashboard build", "Workflow automation", "API endpoint development", "Unit testing"] },
          { name: "Test", durationWeeks: 3, activities: ["Integration testing", "End-to-end workflow validation", "Performance and scale testing", "Security review", "UAT across all business units"] },
          { name: "Deploy & Hypercare", durationWeeks: 4, activities: ["Phased deployment by business unit", "Admin training and certification", "Run book creation", "Hypercare with dedicated support team", "Continuous improvement backlog"] },
        ],
      },
    },
  },

  // ── METHODOLOGY ──
  methodology: {
    anaplanWay: {
      phases: [
        {
          name: "Discovery",
          description: "Initial scoping and alignment phase where we assess current state, define success criteria, identify stakeholders, and build the project charter.",
          durationRange: { min: 1, max: 3, unit: "weeks" as const },
          deliverables: ["Project Charter", "Stakeholder Map", "Requirements Document", "Current State Assessment", "Success Criteria"],
          roles: ["Solution Architect", "Project Manager"],
        },
        {
          name: "Design",
          description: "Model architecture and UX design phase where we translate business requirements into technical specifications, data flow diagrams, and UX wireframes.",
          durationRange: { min: 2, max: 4, unit: "weeks" as const },
          deliverables: ["Functional Design Document", "Data Flow Diagrams", "Model Blueprints", "UX Wireframes", "Integration Specifications"],
          roles: ["Solution Architect", "Model Builder", "Business Analyst"],
        },
        {
          name: "Build",
          description: "Model construction phase where Anaplan models are built, tested iteratively, and connected to source systems with working dashboards.",
          durationRange: { min: 4, max: 8, unit: "weeks" as const },
          deliverables: ["Working Models", "Unit Tests", "Data Connections", "User Dashboards", "Admin Guide"],
          roles: ["Model Builder", "Solution Architect"],
        },
        {
          name: "Test",
          description: "User acceptance testing and performance validation where business users verify calculations, data accuracy, and usability.",
          durationRange: { min: 2, max: 3, unit: "weeks" as const },
          deliverables: ["Test Plan", "UAT Sign-off", "Performance Benchmarks", "Defect Resolution Log"],
          roles: ["Model Builder", "Business Analyst", "End Users"],
        },
        {
          name: "Deploy",
          description: "Production cutover including final data migration, user provisioning, go-live execution, and post-launch monitoring.",
          durationRange: { min: 1, max: 2, unit: "weeks" as const },
          deliverables: ["Deployment Runbook", "Training Materials", "Go-Live Checklist", "Rollback Plan"],
          roles: ["Solution Architect", "Project Manager"],
        },
        {
          name: "Hypercare",
          description: "Post-go-live support providing dedicated assistance during first planning cycles, resolving issues, and ensuring knowledge transfer.",
          durationRange: { min: 2, max: 4, unit: "weeks" as const },
          deliverables: ["Support Ticket Log", "Enhancement Backlog", "Knowledge Transfer Docs", "Lessons Learned"],
          roles: ["Model Builder", "Solution Architect"],
        },
      ],
      deliverables: [
        "Project Charter", "Functional Design Document", "Data Flow Diagrams", "Model Blueprints",
        "Working Models", "Test Plan", "UAT Sign-off", "Deployment Runbook",
        "Training Materials", "Admin Guide", "Knowledge Transfer Docs", "Lessons Learned",
      ],
      roles: ["Solution Architect", "Model Builder", "Project Manager", "Business Analyst", "Change Manager", "Data Engineer", "End Users"],
    },
    fourCornerstones: {
      process: {
        name: "Process",
        description: "Business process alignment ensures the Anaplan model faithfully represents how the organization actually plans.",
        principles: [
          "Map the business process before designing the model",
          "Automate existing manual handoffs and approval steps within the Anaplan workflow",
          "Design for the future state process, not just a digital replica of the current spreadsheet",
          "Validate process assumptions with end users before locking model architecture",
        ],
        commonPitfalls: [
          "Skipping process discovery and jumping straight to model building",
          "Automating a broken process instead of improving it",
          "Designing for power users while ignoring the 80% who need simplicity",
        ],
      },
      data: {
        name: "Data",
        description: "Data governance and quality form the foundation of trustworthy planning.",
        principles: [
          "Establish a single source of truth for each data element",
          "Automate data loads with validation rules, reconciliation checks, and error alerting",
          "Design for data freshness requirements — real-time, daily, weekly, or monthly refresh cadences",
          "Plan for data volume growth — today's hundreds of rows become tomorrow's millions",
        ],
        commonPitfalls: [
          "Manual data entry as a permanent workflow instead of a temporary workaround",
          "No data validation rules, allowing bad data to silently corrupt downstream calculations",
          "Ignoring master data governance, leading to mismatched hierarchies across models",
        ],
      },
      model: {
        name: "Model",
        description: "Model architecture determines performance, maintainability, and scalability.",
        principles: [
          "Follow PLANS standards (Purpose, Levels, Architecture, Naming, Sparsity) for every module",
          "Separate data entry, calculation, and reporting into distinct modules",
          "Minimize model size through sparse data handling, summary modules, and selective dimensionality",
          "Design for auditability — every number should be traceable back to its source",
        ],
        commonPitfalls: [
          "Flat models with too many dimensions, causing exponential cell count growth",
          "Copy-pasting logic across modules instead of using shared reference data",
          "Not planning for versioning",
        ],
      },
      deployment: {
        name: "Deployment",
        description: "Successful deployment encompasses change management, training, adoption tracking, and continuous improvement.",
        principles: [
          "Train end users on the 'why' (business process) before the 'how' (button clicks)",
          "Deploy in phases — start with core functionality, then layer on complexity",
          "Establish a center of excellence (CoE) with designated model owners and governance",
          "Measure adoption quantitatively — track login frequency, feature usage, and data submission timeliness",
        ],
        commonPitfalls: [
          "Big bang deployment with no phased rollout",
          "Training only super-users and hoping they cascade knowledge",
          "No post-go-live governance — model drifts from best practices",
        ],
      },
    },
    plansStandard: {
      purpose: {
        name: "Purpose",
        description: "Every Anaplan module must have a clear, documented purpose.",
        examples: [
          "Revenue planning module: 'Calculate monthly revenue by product line, region, and customer segment using volume x price x mix drivers'",
          "Headcount module: 'Track approved positions, vacancies, and projected fill dates to produce fully-loaded labor cost forecasts'",
        ],
      },
      levels: {
        name: "Levels",
        description: "Organize model data into clear hierarchical levels — summary, detail, input. Never mix levels in a single module.",
        examples: [
          "Summary level: Regional revenue totals for executive dashboard",
          "Detail level: SKU-level demand forecast by week for operational planning",
          "Input level: Rep-entered deal forecasts with customer, product, and close date fields",
        ],
      },
      architecture: {
        name: "Architecture",
        description: "Model architecture separates concerns: input modules collect, calculation modules process, reporting modules present.",
        examples: [
          "Input hub: Central module receiving data from ERP, CRM, and HCM systems with validation rules",
          "Calculation engine: Driver-based P&L model with formulas referencing shared assumption modules",
          "Reporting layer: Pre-aggregated summary modules feeding dashboards with sub-second response times",
        ],
      },
      naming: {
        name: "Naming",
        description: "Consistent naming conventions make models self-documenting.",
        examples: [
          "Modules: 'FPA01 Revenue Drivers', 'FPA02 Cost Allocation' (prefix + sequence + description)",
          "Line items: 'Revenue_Gross', 'Revenue_Net', 'COGS_Materials' (category_descriptor format)",
          "Lists: 'L_Product', 'L_Region', 'L_TimeRange' (L_ prefix indicates a list dimension)",
        ],
      },
      sparsity: {
        name: "Sparsity",
        description: "Anaplan models grow multiplicatively across dimensions. Managing sparsity avoids combinatorial explosions.",
        examples: [
          "1000 products x 50 regions x 52 weeks = 2.6M cells, but only 100K combinations have data — use subsidiary views to target the 4% that matters",
          "Time-based sparsity: Historical data needs monthly, future forecasts can use quarterly aggregates beyond 6 months",
          "Conditional DCA: Hide cells where specific product-region combinations are not applicable",
        ],
      },
    },
  },

  // ── METRICS & ROI ──
  metrics: {
    roi: {
      byIndustry: {
        financialServices: [
          "Reduced forecast cycle time from 3 weeks to 2 days",
          "Improved forecast accuracy by 40-50% through driver-based models",
          "Automated regulatory reporting saving 200+ analyst hours per cycle",
          "Real-time scenario modeling for interest rate changes — impact analysis in minutes",
          "Reduced audit preparation time by 60%",
        ],
        manufacturing: [
          "Inventory reduction of 15-25% while maintaining service levels",
          "Demand forecast accuracy improvement of 20-35%",
          "Production efficiency gains of 10-15% through optimized scheduling",
          "S&OP cycle compressed from 4 weeks to 5 business days",
          "Raw material waste reduction of 8-12%",
        ],
        cpg: [
          "Trade spend optimization yielding 5-8% improvement in promotional ROI",
          "Demand forecast accuracy improvement of 25-35% for new product launches",
          "New product launch planning cycle reduced from 6 months to 6 weeks",
          "Promotion effectiveness analysis in real-time — lift measurement and cannibalization tracking",
          "Supply disruption response time reduced from weeks to hours",
        ],
        healthcare: [
          "Budget variance reduced from +/-15% to +/-3% through rolling forecasts",
          "Staffing cost optimization saving $2-5M annually through predictive scheduling",
          "Capital planning cycle reduced by 40%",
          "Patient volume forecasting accuracy improved 30%",
          "Regulatory compliance reporting automation saving 150+ hours per quarter",
        ],
        technology: [
          "Revenue forecast accuracy improved 35-45% through pipeline-weighted models",
          "Headcount planning cycle reduced from 8 weeks to 2 weeks",
          "ARR/MRR modeling with cohort-based expansion, contraction, and churn analysis",
          "Scenario planning for M&A integration — model combined entity financials in days",
          "Cash flow forecasting accuracy improved 40%",
        ],
        retail: [
          "Inventory turns improved 20-30%",
          "Markdown optimization yielding 3-5% margin improvement",
          "Store-level planning accuracy improved 25%",
          "Omnichannel inventory allocation optimized across stores and DC",
          "Demand sensing reduced out-of-stock rates by 15-20%",
        ],
        energyUtilities: [
          "Integrated resource planning accuracy improved 30-40%",
          "Regulatory rate case preparation time reduced by 50%",
          "Capital program optimization yielding 10-15% improvement in risk-adjusted ROI",
          "Outage workforce deployment efficiency improved 20-25%",
          "Renewable energy integration planning cycle reduced from months to weeks",
        ],
        telecoms: [
          "Network capacity planning accuracy improved 25-35%",
          "Subscriber acquisition cost optimization yielding 8-12% improvement in CLV",
          "5G rollout planning cycle compressed by 40%",
          "Revenue assurance gap reduced by 15-20%",
          "Wholesale settlement forecasting accuracy improved 30%",
        ],
      },
      byModule: {
        fpa: [
          "35-45% improvement in forecast accuracy",
          "70% reduction in planning cycle time",
          "40-60 FTE hours saved per planning cycle",
          "90%+ reduction in manual data errors",
        ],
        supplyChain: [
          "20-30% improvement in demand forecast accuracy",
          "15-25% inventory reduction while maintaining service levels",
          "S&OP cycle compressed from 4+ weeks to under 1 week",
          "50-70% reduction in manual data reconciliation",
        ],
        salesPerformance: [
          "99.5%+ commission calculation accuracy",
          "30-40% reduction in sales operations FTE hours",
          "10-15% improvement in quota attainment",
          "Plan deployment time reduced from weeks to hours",
        ],
        workforce: [
          "25-35% improvement in headcount forecast accuracy",
          "15-20% reduction in labor cost variance vs budget",
          "Workforce planning cycle reduced from weeks to days",
          "80%+ faster org design scenario analysis",
        ],
        territoryQuota: [
          "20-30% improvement in territory balance (Gini coefficient reduction)",
          "60-70% reduction in annual territory planning cycle time",
          "15-25% improvement in sales coverage",
          "10-15% more reps hitting quota",
        ],
        custom: [
          "40-60% reduction in cross-functional planning cycle time",
          "70-80% reduction in data reconciliation effort",
          "90%+ automation of manual data transfers",
          "30-50% faster executive decision-making",
        ],
      },
    },
    benchmarks: {
      implementationTimelines: {
        fpa: { typical: "12 weeks", accelerated: "8 weeks", enterprise: "20 weeks" },
        supplyChain: { typical: "18 weeks", accelerated: "12 weeks", enterprise: "30 weeks" },
        salesPerformance: { typical: "14 weeks", accelerated: "10 weeks", enterprise: "22 weeks" },
        workforce: { typical: "10 weeks", accelerated: "8 weeks", enterprise: "16 weeks" },
        territoryQuota: { typical: "8 weeks", accelerated: "6 weeks", enterprise: "14 weeks" },
        custom: { typical: "16 weeks", accelerated: "10 weeks", enterprise: "24 weeks" },
      },
      adoptionRates: {
        week1: "30-40% active users",
        month1: "60-70% active users",
        month3: "80-90% active users",
        month6: "95%+ active users",
      },
    },
  },

  // ── COMPETITIVE POSITIONING ──
  competitive: {
    vsBig4: {
      differentiators: [
        { point: "Anaplan-native expertise", detail: "Every consultant is dedicated to Anaplan — not splitting time between SAP BPC, Oracle PBCS, and Adaptive." },
        { point: "Implementation speed", detail: "Our focused methodology delivers results in 8-16 weeks for standard modules, compared to 6-12 months typical of Big 4." },
        { point: "Cost efficiency", detail: "Without the partner/manager/associate pyramid structure, we deliver same quality at 40-60% lower total project cost." },
        { point: "Dedicated focus", detail: "Your project gets our A-team from day one. No bait-and-switch with senior architects presenting and junior associates delivering." },
        { point: "Ongoing partnership", detail: "We build for your independence — comprehensive knowledge transfer so your team can maintain and extend models." },
      ],
      messaging: [
        "Purpose-built Anaplan team with deeper platform expertise than generalist consultancies",
        "Half the timeline at a fraction of the cost — proven methodology and pre-built accelerators",
        "Your partner, not your vendor — we build for your independence and long-term success",
      ],
    },
    vsDIY: {
      risks: [
        { risk: "Extended timeline", consequence: "Internal teams without Anaplan experience typically take 3-5x longer to deliver." },
        { risk: "Technical debt", consequence: "Models built without PLANS methodology accumulate performance issues and scalability limitations." },
        { risk: "Knowledge concentration", consequence: "When one or two internal champions build the models, turnover creates existential risk." },
        { risk: "Opportunity cost", consequence: "Internal resources diverted to Anaplan model building are not performing their primary roles." },
        { risk: "Suboptimal model architecture", consequence: "Without deep experience, teams build flat models with excessive dimensionality." },
      ],
      costComparison: {
        diy: "18-24 months to first production model",
        partner: "8-16 weeks to production with proven methodology",
        savings: "60-70% time reduction, faster ROI realization, lower risk of rework",
      },
      messaging: [
        "The question is not whether to invest — it is whether to invest once with a partner or twice by rebuilding after a failed internal attempt",
        "Our fastest engagements deliver production-ready models in 8 weeks",
        "We build for your independence: your team owns the models within 90 days",
      ],
    },
    vsOtherPartners: {
      positioning: [
        { claim: "Certification depth", evidence: "All consultants hold Anaplan Level 3 (Master Anaplanner) certification with 4+ years experience." },
        { claim: "Methodology maturity", evidence: "Implementation methodology refined across 50+ engagements with documented playbooks." },
        { claim: "Industry-specific templates", evidence: "Pre-built templates reduce build time by 30-40%." },
        { claim: "Long-term value orientation", evidence: "We measure success by client self-sufficiency, not billing hours." },
      ],
      proofPoints: [
        "50+ successful Anaplan implementations across 6 industries",
        "95% client satisfaction rating with 80% repeat engagement rate",
        "Average 12-week delivery for standard FP&A implementations",
        "Zero failed go-lives — every engagement delivered to production",
      ],
    },
  },

  // ── MODULE KEYWORDS (for matching) ──
  moduleKeywords: {
    fpa: [
      "budget", "forecast", "p&l", "revenue", "consolidation", "variance",
      "financial", "planning cycle", "reporting", "actuals", "cost center",
      "profit center", "chart of accounts", "general ledger", "close process",
      "reforecast", "allocation", "driver-based", "scenario analysis",
      "cash flow", "balance sheet", "income statement", "capex", "opex",
      "intercompany", "elimination",
    ],
    supplyChain: [
      "demand", "supply", "inventory", "s&op", "forecast accuracy", "logistics",
      "procurement", "warehouse", "distribution", "lead time", "safety stock",
      "reorder point", "production planning", "capacity", "supplier",
      "demand sensing", "replenishment", "sku", "fill rate", "service level",
      "bill of materials", "batch size", "transportation", "fulfillment",
    ],
    salesPerformance: [
      "commission", "quota", "incentive", "territory", "compensation", "attainment",
      "sales ops", "comp plan", "accelerator", "decelerator", "spif", "bonus",
      "crediting", "split credit", "overlay", "payout", "earnings",
      "on-target earnings", "ote", "variable pay", "sales incentive",
      "payment calculation", "dispute", "clawback",
    ],
    workforce: [
      "headcount", "hiring", "attrition", "compensation", "workforce", "talent",
      "hr", "fte", "contractor", "position", "vacancy", "benefits",
      "total cost of workforce", "turnover", "retention", "skills gap",
      "succession planning", "org design", "restructuring", "dei",
      "people analytics", "labor cost", "backfill", "onboarding",
    ],
    territoryQuota: [
      "territory", "quota", "coverage", "assignment", "balance", "carving",
      "alignment", "geo", "segmentation", "account assignment", "workload",
      "gini coefficient", "fairness", "quota allocation", "ramp",
      "named accounts", "overlay", "white space", "market potential",
      "territory optimization", "sales coverage", "rebalancing",
    ],
    custom: [
      "connected planning", "cross-functional", "automation", "api", "workflow",
      "data hub", "orchestration", "integration", "master data", "etl",
      "dashboard", "multi-model", "cloudworks", "rest api", "bulk api",
      "custom action", "approval workflow", "notification", "scheduled process",
      "data governance", "single source of truth", "center of excellence",
    ],
  },

  // ── ACCELERATORS ──
  accelerators: {
    byModule: {
      fpa: [
        { name: "Revenue Waterfall Accelerator", description: "Pre-built pipeline-to-revenue conversion model with stage probabilities and bridge analysis", timeReductionPercent: 35, components: ["Revenue bridge module", "Pipeline conversion rates", "Monthly/quarterly rollup", "Variance dashboard"] },
        { name: "Rolling Forecast Template", description: "12+3 month rolling forecast framework with automated reforecast triggers", timeReductionPercent: 40, components: ["Rolling time dimension", "Driver assumption module", "Actual-vs-forecast comparison", "Reforecast workflow"] },
        { name: "Consolidation Starter Kit", description: "Multi-entity consolidation with intercompany eliminations and currency translation", timeReductionPercent: 30, components: ["Entity hierarchy", "Elimination rules engine", "FX translation module", "Consolidated P&L/BS/CF"] },
        { name: "Cash Flow Forecasting Accelerator", description: "13-week and rolling monthly cash flow model integrating AR, AP, debt service, and working capital", timeReductionPercent: 35, components: ["AR aging waterfall", "AP payment scheduler", "Debt service calendar", "Cash position dashboard"] },
      ],
      supplyChain: [
        { name: "Demand Sensing Accelerator", description: "Statistical baseline generation with exponential smoothing and seasonality", timeReductionPercent: 30, components: ["Baseline forecast engine", "Seasonal index module", "Override workflow", "Accuracy scorecard"] },
        { name: "S&OP Process Template", description: "End-to-end S&OP workflow from demand review through executive reconciliation", timeReductionPercent: 35, components: ["Demand review dashboard", "Supply feasibility check", "Gap analysis module", "Executive summary view"] },
        { name: "Inventory Optimization Kit", description: "Safety stock and reorder point calculations with ABC/XYZ classification", timeReductionPercent: 25, components: ["ABC/XYZ classifier", "Safety stock calculator", "Reorder point engine", "Excess/obsolete tracker"] },
      ],
      salesPerformance: [
        { name: "Commission Plan Builder", description: "Configurable comp plan framework with tiered rates and multi-component structures", timeReductionPercent: 40, components: ["Plan configuration module", "Tiered rate engine", "Attainment calculator", "Payment summary dashboard"] },
        { name: "Crediting Rules Engine", description: "Pre-built crediting for direct, overlay, split, and roll-up credit scenarios", timeReductionPercent: 30, components: ["Credit assignment rules", "Split credit calculator", "Dispute log module", "Audit trail dashboard"] },
      ],
      workforce: [
        { name: "Headcount Planning Accelerator", description: "Position-level workforce model with vacancy tracking and fully-loaded cost calculations", timeReductionPercent: 35, components: ["Position master list", "Vacancy/fill tracker", "Compensation calculator", "Departmental rollup"] },
        { name: "Attrition Modeling Template", description: "Tenure-based attrition curves with voluntary/involuntary split and cost impact", timeReductionPercent: 25, components: ["Attrition rate module", "Tenure curve engine", "Backfill planning", "Cost impact dashboard"] },
      ],
      territoryQuota: [
        { name: "Territory Carving Accelerator", description: "Geo-based territory builder with workload balancing and coverage scoring", timeReductionPercent: 35, components: ["Geography hierarchy", "Account assignment engine", "Balance scorecard", "Coverage heat map"] },
        { name: "Quota Allocation Template", description: "Top-down/bottom-up quota waterfall with seasonality and ramp factors", timeReductionPercent: 30, components: ["Waterfall allocation module", "Seasonality index", "Ramp adjustment rules", "What-if simulator"] },
      ],
      custom: [
        { name: "Data Hub Starter Kit", description: "Central data hub with import validation rules and master data management", timeReductionPercent: 30, components: ["Import staging module", "Validation rules engine", "Master data lists", "Distribution workflow"] },
        { name: "API Integration Framework", description: "Pre-configured REST API patterns for CRUD operations with error handling", timeReductionPercent: 25, components: ["API endpoint templates", "Error handling module", "Retry/queue logic", "Integration dashboard"] },
      ],
    },
  },

  // ── CONFIGURATIONS ──
  configurations: {
    common: {
      security: {
        roleBased: [
          "Workspace Admin — full model and user management",
          "Model Admin — model configuration and list management",
          "Power User — data entry, actions, and dashboard access",
          "End User — dashboard view and limited data entry",
          "Read Only — view dashboards and exports only",
        ],
      },
    },
    compliance: {
      soc2: {
        name: "SOC 2 Type II",
        relevance: "Anaplan maintains SOC 2 Type II certification covering security, availability, and confidentiality trust service criteria for the cloud platform",
        deliverables: ["Access control matrix", "Audit trail configuration", "Data classification schema", "Credential management procedures"],
      },
      gdpr: {
        name: "GDPR",
        relevance: "Anaplan processes personal data in workforce planning, sales compensation, and customer-facing models for EU/EEA individuals requiring GDPR compliance",
        deliverables: ["Data processing impact assessment (DPIA)", "Personal data inventory", "Data retention schedule", "Subject access request procedure"],
      },
      hipaa: {
        name: "HIPAA",
        relevance: "Healthcare organizations using Anaplan must ensure PHI is handled in compliance with HIPAA — avoid loading PHI directly into Anaplan models",
        deliverables: ["PHI boundary documentation", "De-identification methodology", "Access control policy", "HIPAA compliance checklist"],
      },
      iso27001: {
        name: "ISO 27001",
        relevance: "Anaplan holds ISO 27001 certification for its cloud platform. Encryption in transit (TLS 1.2+) and at rest (AES-256) is provided by the platform",
        deliverables: ["Risk assessment addendum", "Statement of Applicability mapping", "Change management procedure", "Business continuity plan"],
      },
    },
  },

  // ── INTEGRATION PATTERNS ──
  integrations: {
    architectureRecipes: [
      { name: "Hub and Spoke", description: "Central Anaplan Data Hub receives all source data, cleanses and transforms it, then distributes to spoke planning models", bestFor: "Multi-module deployments with shared master data", pros: ["Single source of truth", "Centralized data governance"], cons: ["Hub can become bottleneck"] },
      { name: "Data Lake Staging", description: "Cloud data warehouse serves as staging layer — data transformed in SQL then pushed to Anaplan via CloudWorks", bestFor: "Enterprises with existing cloud data infrastructure", pros: ["Leverages existing data team skills", "Complex transformations in SQL"], cons: ["Additional infrastructure cost"] },
      { name: "Direct Connect", description: "Point-to-point integrations from source systems directly into the consuming Anaplan model", bestFor: "Single-module deployments or POCs with 1-2 source systems", pros: ["Fastest to implement", "Simple architecture"], cons: ["Does not scale well"] },
      { name: "API-First", description: "Anaplan REST APIs called from orchestration platform for event-driven real-time data flows", bestFor: "Real-time use cases like commission calculations triggered by CRM deal close", pros: ["Real-time capability", "Maximum flexibility"], cons: ["Highest development effort"] },
    ],
  },

  // ── SIZING ──
  sizing: {
    tiers: {
      small: { criteria: "Single department, straightforward planning", userCount: "10-30 users", estimatedCellCount: "Under 10M cells" },
      medium: { criteria: "Multi-department, moderate integration needs", userCount: "30-150 users", estimatedCellCount: "10M-100M cells" },
      large: { criteria: "Enterprise-wide planning, complex integrations", userCount: "150-500 users", estimatedCellCount: "100M-1B cells" },
      enterprise: { criteria: "Global deployment, multi-cloud, connected planning", userCount: "500+ users", estimatedCellCount: "1B+ cells" },
    },
  },
} as const;

// ═══════════════════════════════════════════════════════════════════
// KB MATCHING ALGORITHM
// ═══════════════════════════════════════════════════════════════════

/** Find top-N knowledge base entries relevant to a question */
export function findRelevantKB(questionText: string, topN = 3): KBMatch[] {
  const text = questionText.toLowerCase();
  const matches: KBMatch[] = [];

  // Check module keywords
  const moduleEntries = Object.entries(ANAPLAN_KB.moduleKeywords) as [string, readonly string[]][];
  for (const [moduleKey, keywords] of moduleEntries) {
    const mod = ANAPLAN_KB.platform.modules[moduleKey as AnaplanModule];
    if (!mod) continue;
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) {
        score += kw.includes(" ") ? 15 : 10;
      }
    }
    if (score > 0) {
      matches.push({
        title: mod.name,
        source: "Built-in KB",
        score: Math.min(score, 100),
        snippet: mod.capabilities[0].substring(0, 120) + "...",
        category: moduleKey,
      });
    }
  }

  // Check methodology keywords
  const methodKeywords = ["methodology", "anaplan way", "implementation", "phases", "cornerstones", "plans standard", "deployment", "governance"];
  let methodScore = 0;
  for (const kw of methodKeywords) {
    if (text.includes(kw)) methodScore += 12;
  }
  if (methodScore > 0) {
    matches.push({
      title: "Anaplan Way Methodology",
      source: "Built-in KB",
      score: Math.min(methodScore, 100),
      snippet: "Structured implementation methodology: Discovery → Design → Build → Test → Deploy → Hypercare",
      category: "methodology",
    });
  }

  // Check compliance/security keywords
  const complianceMap: Record<string, { title: string; snippet: string }> = {
    "soc 2": { title: "Anaplan Security Architecture", snippet: "SOC 2 Type II, ISO 27001, AES-256 encryption, SAML 2.0 SSO, role-based access control..." },
    "gdpr": { title: "GDPR Data Processing", snippet: "EU data residency, Data Processing Addendum, right to erasure support..." },
    "data protection": { title: "GDPR Data Processing", snippet: "EU data residency, Data Processing Addendum, right to erasure support..." },
    "hipaa": { title: "HIPAA Compliance", snippet: "De-identified data patterns, PHI boundary documentation, audit trail retention..." },
    "iso 27001": { title: "EyeOn ISO 27001 Certification", snippet: "EyeOn maintains ISO 27001 certification, ensuring information security management..." },
    "security": { title: "Anaplan Security Architecture", snippet: "SOC 2 Type II, ISO 27001, AES-256 encryption, SAML 2.0 SSO, role-based access control..." },
    "compliance": { title: "Compliance Framework", snippet: "SOC 2, GDPR, HIPAA, ISO 27001 compliance controls and governance frameworks..." },
    "encryption": { title: "Anaplan Security Architecture", snippet: "AES-256 encryption at rest, TLS 1.2+ in transit, SAML 2.0 SSO integration..." },
  };
  for (const [kw, info] of Object.entries(complianceMap)) {
    if (text.includes(kw)) {
      // Avoid duplicate titles
      if (!matches.some((m) => m.title === info.title)) {
        matches.push({
          title: info.title,
          source: "Built-in KB",
          score: 85,
          snippet: info.snippet,
          category: "compliance",
        });
      }
    }
  }

  // Check competitive keywords
  if (text.includes("big 4") || text.includes("deloitte") || text.includes("accenture") || text.includes("kpmg") || text.includes("pwc") || text.includes("competitor")) {
    matches.push({
      title: "Competitive Positioning vs Big 4",
      source: "Company Profile",
      score: 90,
      snippet: ANAPLAN_KB.competitive.vsBig4.messaging[0].substring(0, 120) + "...",
      category: "competitive",
    });
  }

  // Check EyeOn/team keywords
  if (text.includes("team") || text.includes("experience") || text.includes("qualification") || text.includes("certification") || text.includes("partner") || text.includes("about") || text.includes("who") || text.includes("cv") || text.includes("resource")) {
    matches.push({
      title: "EyeOn Company Profile",
      source: "Company Profile",
      score: 82,
      snippet: `${EYEON_PROFILE.name}: ${EYEON_PROFILE.specialization}. ${EYEON_PROFILE.teamSize}, ${EYEON_PROFILE.anaplanPartnerTier}.`,
      category: "company",
    });
  }

  // Check pricing/cost keywords
  if (text.includes("pricing") || text.includes("cost") || text.includes("rate") || text.includes("licensing") || text.includes("fee") || text.includes("investment")) {
    matches.push({
      title: "Anaplan Licensing & Pricing",
      source: "Built-in KB",
      score: 78,
      snippet: "Anaplan platform licensing tiers: Model Builder, End User, Admin. Workspace sizing by cell count and user volume.",
      category: "pricing",
    });
  }

  // Check integration keywords
  if (text.includes("integration") || text.includes("sap") || text.includes("salesforce") || text.includes("workday") || text.includes("api") || text.includes("data") || text.includes("erp") || text.includes("connect")) {
    matches.push({
      title: "Integration Architecture Patterns",
      source: "Built-in KB",
      score: 80,
      snippet: "Hub and Spoke, Data Lake Staging, Direct Connect, API-First — proven integration patterns for enterprise systems.",
      category: "integration",
    });
  }

  // Check case study / reference keywords
  if (text.includes("case study") || text.includes("reference") || text.includes("example") || text.includes("similar") || text.includes("proof") || text.includes("track record")) {
    matches.push({
      title: "Implementation Track Record",
      source: "Company Profile",
      score: 75,
      snippet: `${EYEON_PROFILE.differentiators[0]}. Key clients include ${EYEON_PROFILE.keyClients.slice(0, 4).join(", ")}.`,
      category: "references",
    });
  }

  // Sort by score descending, deduplicate by title, take topN
  const seen = new Set<string>();
  return matches
    .sort((a, b) => b.score - a.score)
    .filter((m) => {
      if (seen.has(m.title)) return false;
      seen.add(m.title);
      return true;
    })
    .slice(0, topN);
}

/** Match an industry string to a known industry key */
export function matchIndustryKey(industry: string): IndustryKey | null {
  const lower = (industry || "").toLowerCase();
  const mapping: [string[], IndustryKey][] = [
    [["financial", "banking", "insurance", "fintech", "capital markets"], "financialServices"],
    [["manufactur", "industrial", "automotive", "aerospace"], "manufacturing"],
    [["consumer", "cpg", "fmcg", "food", "beverage", "packaged goods"], "cpg"],
    [["health", "pharma", "medical", "hospital", "biotech", "life science"], "healthcare"],
    [["tech", "software", "saas", "cloud", "digital", "it services"], "technology"],
    [["retail", "ecommerce", "e-commerce", "fashion", "apparel", "store"], "retail"],
    [["energy", "utility", "utilities", "oil", "gas", "power", "renewable"], "energyUtilities"],
    [["telecom", "telco", "mobile", "wireless", "carrier", "5g"], "telecoms"],
  ];
  for (const [keywords, key] of mapping) {
    if (keywords.some((k) => lower.includes(k))) return key;
  }
  return null;
}
