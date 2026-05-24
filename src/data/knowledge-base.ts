// =============================================================================
// Anaplan RFP Responder — Knowledge Base
// =============================================================================
// Comprehensive Anaplan domain knowledge covering platform modules, methodology,
// metrics, competitive positioning, integrations, accelerators, configurations,
// sizing, troubleshooting, training programs, and risk catalog.
//
// Ported from artifact/rfp-responder.tsx ANAPLAN_KB constant (lines 5842-7063).
// =============================================================================

// ---------------------------------------------------------------------------
// KB Metadata
// ---------------------------------------------------------------------------

export const KB_META = {
  version: '1.0.0',
  lastUpdated: '2026-05-19',
  platformVersion: 'Anaplan 2026.1',
  moduleCount: 6,
  description: 'Embedded Anaplan domain knowledge base',
} as const;

// ---------------------------------------------------------------------------
// ANAPLAN_KB — Full Knowledge Base
// ---------------------------------------------------------------------------

export const ANAPLAN_KB = {
  // =========================================================================
  // PLATFORM MODULES
  // =========================================================================
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
        commonIntegrations: [
          "SAP ECC/S4HANA GL",
          "Oracle Financials",
          "Workday Financial Management",
          "NetSuite",
          "Power BI/Tableau",
        ],
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
        commonIntegrations: [
          "SAP APO/IBP",
          "Oracle SCM Cloud",
          "Kinaxis RapidResponse",
          "Blue Yonder",
          "Manhattan Associates",
          "E2open",
        ],
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
        commonIntegrations: [
          "Salesforce CRM",
          "SAP Commissions",
          "Xactly",
          "Microsoft Dynamics 365",
          "HubSpot",
        ],
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
          "Workforce cost forecasting that projects total people spend (compensation, benefits, recruitment, training, severance) across budget periods with scenario-based sensitivity analysis",
          "Hiring pipeline planning that connects approved requisitions to recruiter capacity, sourcing channels, time-to-fill benchmarks, and offer acceptance rates for realistic hiring projections",
          "Organization design scenarios that model restructuring options including reductions in force, team consolidations, new team creation, and reporting line changes with full cost impact",
          "DEI metrics tracking and target modeling that measures representation across dimensions (gender, ethnicity, age, disability) by level, function, and location with goal-setting and progress dashboards",
        ],
        typicalDuration: { min: 8, max: 14, unit: "weeks" as const },
        complexity: "standard" as const,
        commonIntegrations: [
          "Workday HCM",
          "SAP SuccessFactors",
          "Oracle HCM Cloud",
          "ADP",
          "BambooHR",
        ],
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
          "Territory carving with multi-dimensional segmentation by geography (zip/postal code, state, region), industry vertical, company size, and named accounts with drag-and-drop rebalancing",
          "Quota allocation using historical performance, market potential, pipeline data, and seasonality patterns with support for top-down waterfall, bottom-up aggregation, and hybrid approaches",
          "Balance optimization algorithms that equalize territory potential across the sales force while respecting constraints like account relationships, rep location, and language requirements",
          "Coverage analysis with heat maps and white-space identification showing under-served market segments, overlapping territories, and accounts without assigned coverage",
          "Account assignment rules engine with hierarchical logic for parent-child relationships, named account exceptions, vertical specialization, and multi-product overlay structures",
          "Overlay management for specialist roles (solutions engineers, industry experts, channel partners) with shared credit rules and collaboration metrics tracking",
          "Ramp modeling for new hires and territory changes that adjusts quota expectations based on tenure, onboarding timeline, territory maturity, and historical ramp curves",
          "Fairness scoring with Gini coefficient analysis, territory potential variance metrics, and automated alerts when assignment changes create imbalanced distributions",
        ],
        typicalDuration: { min: 6, max: 12, unit: "weeks" as const },
        complexity: "standard" as const,
        commonIntegrations: [
          "Salesforce",
          "Microsoft Dynamics",
          "Gong",
          "Clari",
          "Domo",
        ],
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
          "Cross-functional planning models that break down silos between finance, sales, supply chain, and HR by connecting shared dimensions (product, region, time) across departmental models",
          "Custom workflow engines with configurable approval chains, notification rules, escalation paths, and SLA tracking for bespoke business processes unique to the client organization",
          "Data hub integration patterns that centralize master data management, handle data quality rules, and orchestrate ETL/ELT pipelines across source systems with error handling and reconciliation",
          "Multi-model orchestration that coordinates calculation sequences, data dependencies, and refresh schedules across dozens of interconnected Anaplan models with dependency graph visualization",
          "API-driven automation using Anaplan's REST APIs and CloudWorks connectors to schedule imports, trigger calculations, export results, and integrate with CI/CD pipelines",
          "Custom executive dashboards combining data from multiple Anaplan models into unified views with role-based access, drill-through navigation, and embedded commentary workflows",
          "Embedded analytics with real-time KPI monitoring, anomaly detection alerts, trend analysis, and natural language summaries that surface insights without requiring users to navigate models",
          "External data feed integration connecting market data (commodity prices, exchange rates, economic indicators), weather data, IoT sensor data, and social media signals into planning models",
          "Conditional logic engines with complex business rule processing including nested if-then-else trees, lookup-based routing, and time-variant rule application for regulatory compliance scenarios",
          "Approval and sign-off workflows with digital signatures, version control, change tracking, and audit trail generation for SOX compliance and regulatory reporting requirements",
        ],
        typicalDuration: { min: 10, max: 20, unit: "weeks" as const },
        complexity: "enterprise" as const,
        commonIntegrations: [
          "REST APIs",
          "Anaplan Data Hub",
          "CloudWorks",
          "MuleSoft",
          "Informatica",
          "Boomi",
        ],
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

  // =========================================================================
  // METHODOLOGY
  // =========================================================================
  methodology: {
    anaplanWay: {
      phases: [
        {
          name: "Discovery",
          description: "Initial scoping and alignment phase where we assess current state, define success criteria, identify stakeholders, and build the project charter that governs the engagement.",
          durationRange: { min: 1, max: 3, unit: "weeks" as const },
          deliverables: ["Project Charter", "Stakeholder Map", "Requirements Document", "Current State Assessment", "Success Criteria"],
          roles: ["Solution Architect", "Project Manager"],
        },
        {
          name: "Design",
          description: "Model architecture and UX design phase where we translate business requirements into technical specifications, data flow diagrams, and user experience wireframes.",
          durationRange: { min: 2, max: 4, unit: "weeks" as const },
          deliverables: ["Functional Design Document", "Data Flow Diagrams", "Model Blueprints", "UX Wireframes", "Integration Specifications"],
          roles: ["Solution Architect", "Model Builder", "Business Analyst"],
        },
        {
          name: "Build",
          description: "Model construction phase where the Anaplan models are built, tested iteratively, and connected to source systems with working dashboards and user interfaces.",
          durationRange: { min: 4, max: 8, unit: "weeks" as const },
          deliverables: ["Working Models", "Unit Tests", "Data Connections", "User Dashboards", "Admin Guide"],
          roles: ["Model Builder", "Solution Architect"],
        },
        {
          name: "Test",
          description: "User acceptance testing and performance validation phase where business users verify calculations, data accuracy, and usability against defined acceptance criteria.",
          durationRange: { min: 2, max: 3, unit: "weeks" as const },
          deliverables: ["Test Plan", "UAT Sign-off", "Performance Benchmarks", "Defect Resolution Log"],
          roles: ["Model Builder", "Business Analyst", "End Users"],
        },
        {
          name: "Deploy",
          description: "Production cutover phase including final data migration, user provisioning, go-live execution, and immediate post-launch monitoring to ensure stable operation.",
          durationRange: { min: 1, max: 2, unit: "weeks" as const },
          deliverables: ["Deployment Runbook", "Training Materials", "Go-Live Checklist", "Rollback Plan"],
          roles: ["Solution Architect", "Project Manager"],
        },
        {
          name: "Hypercare",
          description: "Post-go-live support phase providing dedicated assistance during the first planning cycles, resolving issues, capturing enhancement requests, and ensuring knowledge transfer.",
          durationRange: { min: 2, max: 4, unit: "weeks" as const },
          deliverables: ["Support Ticket Log", "Enhancement Backlog", "Knowledge Transfer Docs", "Lessons Learned"],
          roles: ["Model Builder", "Solution Architect"],
        },
      ],
      deliverables: [
        "Project Charter",
        "Functional Design Document",
        "Data Flow Diagrams",
        "Model Blueprints",
        "Working Models",
        "Test Plan",
        "UAT Sign-off",
        "Deployment Runbook",
        "Training Materials",
        "Admin Guide",
        "Knowledge Transfer Docs",
        "Lessons Learned",
      ],
      roles: [
        "Solution Architect",
        "Model Builder",
        "Project Manager",
        "Business Analyst",
        "Change Manager",
        "Data Engineer",
        "End Users",
      ],
    },
    fourCornerstones: {
      process: {
        name: "Process",
        description: "Business process alignment ensures that the Anaplan model faithfully represents how the organization actually plans, not just how the spreadsheet was structured.",
        principles: [
          "Map the business process before designing the model — understand who does what, when, and why",
          "Automate existing manual handoffs and approval steps within the Anaplan workflow",
          "Design for the future state process, not just a digital replica of the current spreadsheet",
          "Validate process assumptions with end users before locking model architecture",
        ],
        commonPitfalls: [
          "Skipping process discovery and jumping straight to model building, resulting in a tool that nobody uses",
          "Automating a broken process instead of improving it — garbage in, garbage out at higher speed",
          "Designing for power users while ignoring the 80% of planners who need simplicity",
        ],
      },
      data: {
        name: "Data",
        description: "Data governance and quality form the foundation of trustworthy planning. Models are only as reliable as the data feeding them.",
        principles: [
          "Establish a single source of truth for each data element — no duplicate masters",
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
        description: "Model architecture determines performance, maintainability, and scalability. A well-designed model is fast, auditable, and adaptable to changing requirements.",
        principles: [
          "Follow PLANS standards (Purpose, Levels, Architecture, Naming, Sparsity) for every module",
          "Separate data entry, calculation, and reporting into distinct modules for maintainability",
          "Minimize model size through sparse data handling, summary modules, and selective dimensionality",
          "Design for auditability — every number should be traceable back to its source through clear formula chains",
        ],
        commonPitfalls: [
          "Flat models with too many dimensions, causing exponential cell count growth and slow calculations",
          "Copy-pasting logic across modules instead of using shared reference data and lookup formulas",
          "Not planning for versioning — no way to compare this year's plan to last year's or to track changes over time",
        ],
      },
      deployment: {
        name: "Deployment",
        description: "Successful deployment goes beyond technical go-live. It encompasses change management, training, adoption tracking, and continuous improvement.",
        principles: [
          "Train end users on the 'why' (business process) before the 'how' (button clicks)",
          "Deploy in phases — start with core functionality, then layer on complexity as users gain confidence",
          "Establish a center of excellence (CoE) with designated model owners, admin procedures, and governance",
          "Measure adoption quantitatively — track login frequency, feature usage, and data submission timeliness",
        ],
        commonPitfalls: [
          "Big bang deployment with no phased rollout — overwhelming users with everything at once",
          "Training only super-users and hoping they cascade knowledge (they rarely do)",
          "No post-go-live governance — model drifts from best practices as ad-hoc changes accumulate",
        ],
      },
    },
    plansStandard: {
      purpose: {
        name: "Purpose",
        description: "Every Anaplan module must have a clear, documented purpose. If you cannot state the module's purpose in one sentence, it is too complex or too vague.",
        examples: [
          "Revenue planning module: 'Calculate monthly revenue by product line, region, and customer segment using volume x price x mix drivers'",
          "Headcount module: 'Track approved positions, vacancies, and projected fill dates to produce fully-loaded labor cost forecasts'",
          "S&OP consensus module: 'Reconcile demand, supply, and financial plans into a single consensus view for executive review'",
        ],
      },
      levels: {
        name: "Levels",
        description: "Organize model data into clear hierarchical levels — summary for reporting, detail for calculation, input for data entry. Never mix levels in a single module.",
        examples: [
          "Summary level: Regional revenue totals for executive dashboard (no line-item detail)",
          "Detail level: SKU-level demand forecast by week for operational planning",
          "Input level: Rep-entered deal forecasts with customer, product, and close date fields",
        ],
      },
      architecture: {
        name: "Architecture",
        description: "Model architecture separates concerns: input modules collect data, calculation modules process it, reporting modules present it. This separation enables independent scaling and maintenance.",
        examples: [
          "Input hub: Central module receiving data from ERP, CRM, and HCM systems with validation rules",
          "Calculation engine: Driver-based P&L model with formulas referencing shared assumption modules",
          "Reporting layer: Pre-aggregated summary modules feeding dashboards with sub-second response times",
        ],
      },
      naming: {
        name: "Naming",
        description: "Consistent naming conventions make models self-documenting. Every list, module, line item, and dashboard should follow a predictable pattern that any team member can navigate.",
        examples: [
          "Modules: 'FPA01 Revenue Drivers', 'FPA02 Cost Allocation', 'FPA03 P&L Summary' (prefix + sequence + description)",
          "Line items: 'Revenue_Gross', 'Revenue_Net', 'COGS_Materials' (category_descriptor format)",
          "Lists: 'L_Product', 'L_Region', 'L_TimeRange' (L_ prefix indicates a list dimension)",
        ],
      },
      sparsity: {
        name: "Sparsity",
        description: "Anaplan models grow multiplicatively across dimensions. Managing sparsity means ensuring the model only allocates cells where data actually exists, avoiding combinatorial explosions.",
        examples: [
          "A model with 1000 products x 50 regions x 52 weeks = 2.6M cells, but only 100K combinations have data — use subsidiary views or filtered lists to target the 4% that matters",
          "Time-based sparsity: Historical data needs monthly granularity, but future forecasts can use quarterly aggregates beyond 6 months",
          "Conditional DCA (Dynamic Cell Access): Hide and exclude cells where specific product-region combinations are not applicable to prevent users from entering invalid data",
        ],
      },
    },
  },

  // =========================================================================
  // METRICS & ROI
  // =========================================================================
  metrics: {
    roi: {
      byIndustry: {
        financialServices: [
          "Reduced forecast cycle time from 3 weeks to 2 days, enabling faster response to market volatility and regulatory changes",
          "Improved forecast accuracy by 40-50% through driver-based models replacing spreadsheet-based guesswork",
          "Automated regulatory reporting (CCAR, DFAST, IFRS 9) saving 200+ analyst hours per reporting cycle",
          "Real-time scenario modeling for interest rate changes — impact analysis in minutes instead of days",
          "Reduced audit preparation time by 60% through complete traceability from assumptions to final numbers",
        ],
        manufacturing: [
          "Inventory reduction of 15-25% while maintaining or improving service levels through demand-driven planning",
          "Demand forecast accuracy improvement of 20-35% using statistical algorithms and sales intelligence integration",
          "Production efficiency gains of 10-15% through optimized scheduling, batch sizing, and changeover planning",
          "S&OP cycle compressed from 4 weeks to 5 business days with automated data aggregation and workflow",
          "Raw material waste reduction of 8-12% through better demand visibility and procurement planning",
        ],
        cpg: [
          "Trade spend optimization yielding 5-8% improvement in promotional ROI through scenario-based trade planning",
          "Demand forecast accuracy improvement of 25-35% for new product launches using analog-based modeling",
          "New product launch planning cycle reduced from 6 months to 6 weeks with integrated cross-functional models",
          "Promotion effectiveness analysis in real-time — lift measurement, cannibalization tracking, and post-event ROI",
          "Supply disruption response time reduced from weeks to hours with real-time alternative sourcing scenarios",
        ],
        healthcare: [
          "Budget variance reduced from +/-15% to +/-3% through rolling forecasts and driver-based departmental models",
          "Staffing cost optimization saving $2-5M annually through predictive scheduling aligned to patient volume forecasts",
          "Capital planning cycle reduced by 40% with scenario-based equipment and facility investment modeling",
          "Patient volume forecasting accuracy improved 30% enabling better resource allocation and revenue cycle planning",
          "Regulatory compliance reporting automation saving 150+ hours per quarter across finance and operations teams",
        ],
        technology: [
          "Revenue forecast accuracy improved 35-45% through pipeline-weighted models with stage probability and velocity analysis",
          "Headcount planning cycle reduced from 8 weeks to 2 weeks with real-time integration to HRIS and finance systems",
          "ARR/MRR modeling with cohort-based expansion, contraction, and churn analysis enabling accurate subscription revenue forecasting",
          "Scenario planning for M&A integration — model combined entity financials, headcount, and product portfolio in days not weeks",
          "Cash flow forecasting accuracy improved 40% with 13-week rolling view integrating AR collections, AP payments, and CapEx schedules",
        ],
        retail: [
          "Inventory turns improved 20-30% through connected demand planning and allocation optimization across channels",
          "Markdown optimization yielding 3-5% margin improvement through data-driven clearance timing and pricing decisions",
          "Store-level planning accuracy improved 25% with localized demand models incorporating demographics, weather, and events",
          "Omnichannel inventory allocation optimized across stores, DC, and ship-from-store with real-time demand signals",
          "Demand sensing capabilities reduced out-of-stock rates by 15-20% using POS data and external signal integration",
        ],
        energyUtilities: [
          "Integrated resource planning accuracy improved 30-40% through connected models linking demand forecasts, generation portfolios, and regulatory rate case assumptions across multi-year horizons",
          "Regulatory rate case preparation time reduced by 50% with automated cost-of-service models, test year adjustments, and revenue requirement calculations that respond instantly to commission staff data requests",
          "Capital program optimization yielding 10-15% improvement in risk-adjusted ROI through scenario-based prioritization of grid modernization, renewable integration, and reliability investments across asset classes",
          "Outage workforce deployment efficiency improved 20-25% through predictive staffing models that correlate weather forecasts, historical outage patterns, and crew availability to pre-position resources",
          "Renewable energy integration planning cycle reduced from months to weeks with connected models for PPA evaluation, intermittency impact analysis, battery storage optimization, and carbon reduction target tracking",
        ],
        telecoms: [
          "Network capacity planning accuracy improved 25-35% through subscriber growth models linked to spectrum allocation, tower loading, and fiber deployment schedules with real-time utilization data feeds",
          "Subscriber acquisition cost optimization yielding 8-12% improvement in customer lifetime value through connected models linking marketing spend, churn prediction, and ARPU cohort analysis across prepaid and postpaid segments",
          "5G rollout planning cycle compressed by 40% with integrated site selection models incorporating population density, competitive coverage, permitting timelines, and capital budget constraints",
          "Revenue assurance gap reduced by 15-20% through automated reconciliation models that compare billing system records against network usage, interconnect settlements, and roaming agreements",
          "Wholesale and interconnect settlement forecasting accuracy improved 30% with automated traffic volume models, rate deck management, and partner settlement reconciliation across domestic and international carriers",
        ],
      },
      byModule: {
        fpa: [
          "35-45% improvement in forecast accuracy through driver-based models replacing static spreadsheets",
          "70% reduction in planning cycle time — from weeks of spreadsheet consolidation to days of analysis",
          "40-60 FTE hours saved per planning cycle through automated data aggregation and report generation",
          "90%+ reduction in manual data errors through controlled inputs, validation rules, and audit trails",
        ],
        supplyChain: [
          "20-30% improvement in demand forecast accuracy through statistical algorithms and collaborative inputs",
          "15-25% inventory reduction while maintaining or improving customer service levels",
          "S&OP cycle compressed from 4+ weeks to under 1 week with full cross-functional alignment",
          "50-70% reduction in manual data reconciliation between demand, supply, and financial plans",
        ],
        salesPerformance: [
          "99.5%+ commission calculation accuracy replacing error-prone spreadsheet-based processing",
          "30-40% reduction in sales operations FTE hours spent on compensation administration",
          "10-15% improvement in quota attainment through better-designed, data-driven territories and targets",
          "Plan deployment time reduced from weeks to hours — mid-year changes implemented in a single day",
        ],
        workforce: [
          "25-35% improvement in headcount forecast accuracy through position-level modeling and attrition prediction",
          "15-20% reduction in labor cost variance vs budget through real-time compensation and benefits modeling",
          "Workforce planning cycle reduced from weeks to days with automated HCM data integration",
          "80%+ faster org design scenario analysis enabling agile response to restructuring decisions",
        ],
        territoryQuota: [
          "20-30% improvement in territory balance (measured by Gini coefficient reduction)",
          "60-70% reduction in annual territory planning cycle time through automated optimization",
          "15-25% improvement in sales coverage — fewer white spaces and reduced territory overlap",
          "10-15% more reps hitting quota through better-balanced territories and data-driven targets",
        ],
        custom: [
          "40-60% reduction in cross-functional planning cycle time through connected models and shared data",
          "70-80% reduction in data reconciliation effort — single source of truth across business functions",
          "90%+ automation of manual data transfers through CloudWorks, APIs, and scheduled integrations",
          "30-50% faster executive decision-making through unified dashboards with real-time cross-functional data",
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

  // =========================================================================
  // COMPETITIVE POSITIONING
  // =========================================================================
  competitive: {
    vsBig4: {
      differentiators: [
        {
          point: "Anaplan-native expertise",
          detail: "Every consultant on our team is dedicated to Anaplan — not splitting time between SAP BPC, Oracle PBCS, and Adaptive. We live in the platform daily and know its capabilities, limitations, and workarounds at a level generalist firms cannot match.",
        },
        {
          point: "Implementation speed",
          detail: "Our focused methodology delivers results in 8-16 weeks for standard modules, compared to 6-12 months typical of Big 4 engagements. We have pre-built accelerators, proven templates, and streamlined governance that eliminate overhead.",
        },
        {
          point: "Cost efficiency",
          detail: "Without the partner/manager/associate pyramid structure and office overhead, we deliver the same quality outcomes at 40-60% lower total project cost. Our rates reflect Anaplan expertise value, not brand premium.",
        },
        {
          point: "Dedicated focus",
          detail: "Your project gets our A-team from day one. No bait-and-switch with senior architects presenting and junior associates delivering. The people in the sales cycle are the people doing the work.",
        },
        {
          point: "Ongoing partnership",
          detail: "We build for your independence — comprehensive knowledge transfer, admin training, and documentation so your team can maintain and extend models. But we remain available for optimization sprints and new module deployments.",
        },
      ],
      messaging: [
        "Purpose-built Anaplan team with deeper platform expertise than generalist consultancies",
        "Half the timeline at a fraction of the cost — proven methodology and pre-built accelerators",
        "Your partner, not your vendor — we build for your independence and long-term success",
      ],
    },
    vsDIY: {
      risks: [
        {
          risk: "Extended timeline",
          consequence: "Internal teams without Anaplan experience typically take 3-5x longer to deliver, delaying time to value from months to over a year. Learning curve costs are hidden but substantial.",
        },
        {
          risk: "Technical debt",
          consequence: "Models built without PLANS methodology best practices accumulate performance issues, maintenance burden, and scalability limitations that become expensive to remediate later.",
        },
        {
          risk: "Knowledge concentration",
          consequence: "When one or two internal champions build the models, the organization becomes dependent on specific individuals. Turnover creates existential risk for business-critical planning processes.",
        },
        {
          risk: "Opportunity cost",
          consequence: "Internal resources diverted to Anaplan model building are not performing their primary planning, analysis, or operations roles. The hidden cost of distraction often exceeds the partner engagement fee.",
        },
        {
          risk: "Suboptimal model architecture",
          consequence: "Without deep Anaplan experience, internal teams frequently build flat models with excessive dimensionality, leading to exponential cell count growth. Remediation requires a near-complete rebuild — we have seen clients spend 2x the original build cost to fix architectural decisions made in the first sprint.",
        },
        {
          risk: "Integration blind spots",
          consequence: "Internal teams often underestimate the complexity of connecting Anaplan to ERP, CRM, and HCM systems. CloudWorks configuration, API rate limit management, and data transformation logic require specialized knowledge that general IT teams lack.",
        },
        {
          risk: "Missed platform capabilities",
          consequence: "Anaplan releases new features quarterly — optimizer, polaris calculation engine, new UX, API v2 enhancements. Internal teams building their first model will not know these features exist, leading to manual workarounds for problems the platform already solves natively.",
        },
      ],
      costComparison: {
        diy: "18-24 months to first production model with ongoing iteration",
        partner: "8-16 weeks to production with proven methodology and best practices",
        savings: "60-70% time reduction, faster ROI realization, lower risk of rework",
      },
      messaging: [
        "The question is not whether to invest — it is whether to invest once with a partner or twice by rebuilding after a failed internal attempt",
        "Our fastest engagements deliver production-ready models in 8 weeks — the same time most internal teams spend completing requirements gathering",
        "We build for your independence: comprehensive knowledge transfer means your team owns the models within 90 days, but they start from a best-practice foundation instead of learning by trial and error",
        "The true cost of DIY is not salary — it is the 12-18 months of delayed business value while your best planners learn to be model builders instead of doing the analysis your business needs",
        "Every accelerator we deploy has been refined across 50+ implementations — your internal team would need years to accumulate equivalent pattern recognition",
      ],
    },
    vsAdaptive: {
      differentiators: [
        {
          point: "Multi-dimensional modeling power",
          detail: "Anaplan's hyperblock architecture supports true multi-dimensional models with dozens of dimensions and billions of cells. Workday Adaptive Planning uses a matrix-style structure that becomes unwieldy beyond 5-6 dimensions, limiting its effectiveness for complex supply chain, territory, and connected planning use cases.",
        },
        {
          point: "Connected planning across functions",
          detail: "Anaplan is purpose-built for cross-functional connected planning — linking finance, sales, supply chain, and workforce on shared dimensions. Adaptive is primarily a financial planning tool that struggles when asked to extend into operational planning domains like demand forecasting, territory optimization, or incentive compensation.",
        },
        {
          point: "Enterprise scalability",
          detail: "Anaplan handles models with hundreds of millions to billions of cells with sub-second calculation performance. Adaptive performance degrades significantly beyond 100M cells and lacks the sparse data handling and calculation optimization that Anaplan provides natively.",
        },
        {
          point: "Integration flexibility",
          detail: "Anaplan offers CloudWorks with 50+ native connectors, a full REST API (Integration API v2), and middleware support via MuleSoft, Informatica, and Boomi. Adaptive's integration capabilities are more limited, primarily relying on flat-file imports and Workday-ecosystem connectors.",
        },
        {
          point: "Customization depth",
          detail: "Anaplan's formula language, custom actions, and workflow engine support highly customized business logic without coding. Adaptive provides configurable templates but less flexibility for bespoke calculation logic, custom approval workflows, and non-standard business rules.",
        },
        {
          point: "Non-Workday HCM ecosystems",
          detail: "Adaptive's strongest value proposition is tight integration with Workday HCM and Financials. Organizations running SAP, Oracle, or other ERP/HCM systems do not benefit from this ecosystem advantage and are better served by Anaplan's ERP-agnostic integration architecture.",
        },
      ],
      whenAdaptiveWins: [
        "Small to mid-market companies with straightforward FP&A needs and no complex operational planning requirements",
        "Organizations already running Workday HCM and Financials who want a tightly integrated financial planning tool within the Workday ecosystem",
        "Finance teams seeking a simpler user experience for basic budgeting, forecasting, and reporting without multi-dimensional modeling complexity",
        "Companies with fewer than 100 planning users and models under 50M cells that do not need connected planning across functions",
      ],
      messaging: [
        "Adaptive is a financial planning tool — Anaplan is a connected planning platform. If your needs extend beyond FP&A, Anaplan is the only choice that scales across supply chain, sales, and workforce planning.",
        "For organizations not running Workday, Adaptive's primary advantage disappears — and you are left with a less powerful planning engine and more limited integration options.",
        "Anaplan's hyperblock architecture was designed from the ground up for multi-dimensional planning at enterprise scale. Adaptive retrofitted financial planning templates onto a simpler architecture that hits walls at scale.",
      ],
    },
    vsOtherPartners: {
      positioning: [
        {
          claim: "Certification depth",
          evidence: "All consultants hold Anaplan Level 3 (Master Anaplanner) certification, with an average of 4+ years of hands-on Anaplan implementation experience across industries.",
        },
        {
          claim: "Methodology maturity",
          evidence: "Our implementation methodology has been refined across 50+ engagements, with documented playbooks, risk registers, and lessons learned that accelerate every new project.",
        },
        {
          claim: "Industry-specific templates",
          evidence: "Pre-built model templates for FP&A, supply chain, SPM, and workforce planning include industry-specific KPIs, hierarchies, and calculation patterns that reduce build time by 30-40%.",
        },
        {
          claim: "Long-term value orientation",
          evidence: "We measure success by client self-sufficiency, not billing hours. Our knowledge transfer program ensures your team can maintain, modify, and extend models independently within 90 days of go-live.",
        },
      ],
      proofPoints: [
        "50+ successful Anaplan implementations across 6 industries",
        "95% client satisfaction rating with 80% repeat engagement rate",
        "Average 12-week delivery for standard FP&A implementations",
        "Zero failed go-lives — every engagement delivered to production",
      ],
    },
  },

  // =========================================================================
  // INTEGRATION PATTERNS
  // =========================================================================
  integrations: {
    patterns: {
      erp: {
        sap: { system: "SAP ECC/S4HANA", connectionMethod: "CloudWorks BAPI/OData connector or flat-file SFTP extract", dataObjects: ["GL actuals", "cost center hierarchy", "profit center", "purchase orders", "sales orders"], refreshCadence: "daily or real-time via CPI", complexity: "high" as const },
        oracle: { system: "Oracle Financials Cloud", connectionMethod: "CloudWorks REST connector or BI Publisher scheduled extracts", dataObjects: ["GL balances", "budget journals", "AP/AR aging", "fixed assets"], refreshCadence: "daily", complexity: "medium" as const },
        workdayFin: { system: "Workday Financial Management", connectionMethod: "Workday RaaS (Reports-as-a-Service) via CloudWorks", dataObjects: ["ledger accounts", "cost centers", "spend categories", "revenue"], refreshCadence: "daily", complexity: "medium" as const },
        netsuite: { system: "NetSuite", connectionMethod: "SuiteAnalytics Connect (ODBC) or RESTlet via CloudWorks", dataObjects: ["GL transactions", "budgets", "department hierarchy", "project costs"], refreshCadence: "daily", complexity: "low" as const },
      },
      crm: {
        salesforce: { system: "Salesforce CRM", connectionMethod: "CloudWorks native Salesforce connector (bulk API)", dataObjects: ["opportunities", "pipeline stages", "accounts", "bookings", "quota attainment"], refreshCadence: "daily or near-real-time", complexity: "medium" as const },
        dynamics: { system: "Microsoft Dynamics 365", connectionMethod: "CloudWorks Dataverse connector or Azure Data Factory", dataObjects: ["opportunities", "accounts", "forecasts", "territory assignments"], refreshCadence: "daily", complexity: "medium" as const },
      },
      hcm: {
        workday: { system: "Workday HCM", connectionMethod: "Workday RaaS reports via CloudWorks", dataObjects: ["employee census", "compensation", "positions", "org hierarchy", "headcount"], refreshCadence: "daily or weekly", complexity: "medium" as const },
        successfactors: { system: "SAP SuccessFactors", connectionMethod: "OData API via CloudWorks or MuleSoft", dataObjects: ["employee master", "compensation", "positions", "org chart"], refreshCadence: "weekly", complexity: "medium" as const },
        adp: { system: "ADP Workforce Now", connectionMethod: "ADP API Gateway or scheduled flat-file export", dataObjects: ["payroll summary", "headcount", "benefits enrollment", "turnover data"], refreshCadence: "bi-weekly or monthly", complexity: "low" as const },
      },
      bi: {
        powerbi: { system: "Power BI", connectionMethod: "Anaplan connector for Power BI (read from Anaplan) or reverse ETL", dataObjects: ["model exports for visualization", "dashboard embedding"], refreshCadence: "on-demand or scheduled", complexity: "low" as const },
        tableau: { system: "Tableau", connectionMethod: "Anaplan Tableau connector (Hyper extract) or published data source", dataObjects: ["saved views", "module exports", "dashboard data feeds"], refreshCadence: "scheduled extract refresh", complexity: "low" as const },
      },
      etl: {
        cloudworks: { system: "Anaplan CloudWorks", connectionMethod: "Native orchestration — no middleware required", dataObjects: ["any Anaplan import/export action", "process triggers", "chained integrations"], refreshCadence: "scheduled or event-driven", complexity: "low" as const },
        informatica: { system: "Informatica IICS", connectionMethod: "Anaplan V2 connector with bulk API support", dataObjects: ["complex multi-source transformations", "data quality rules", "master data sync"], refreshCadence: "scheduled", complexity: "medium" as const },
        mulesoft: { system: "MuleSoft Anypoint", connectionMethod: "Anaplan REST API wrapped as MuleSoft connector", dataObjects: ["real-time event-driven integrations", "API-first orchestration", "composite services"], refreshCadence: "event-driven or scheduled", complexity: "high" as const },
      },
    },
    byModule: {
      fpa: ["erp.sap", "erp.oracle", "erp.netsuite", "bi.powerbi", "hcm.workday"],
      supplyChain: ["erp.sap", "erp.oracle", "etl.cloudworks", "etl.informatica"],
      salesPerformance: ["crm.salesforce", "crm.dynamics", "erp.sap", "etl.cloudworks"],
      workforce: ["hcm.workday", "hcm.successfactors", "hcm.adp", "erp.sap"],
      territoryQuota: ["crm.salesforce", "crm.dynamics", "bi.powerbi", "etl.cloudworks"],
      custom: ["etl.cloudworks", "etl.mulesoft", "etl.informatica", "crm.salesforce", "erp.sap"],
    },
    architectureRecipes: [
      { name: "Hub and Spoke", description: "Central Anaplan Data Hub model receives all source data, cleanses and transforms it, then distributes to spoke planning models via Anaplan-to-Anaplan imports", bestFor: "Multi-module deployments with shared master data across FP&A, workforce, and supply chain", pros: ["Single source of truth", "Centralized data governance", "Simplified troubleshooting"], cons: ["Hub can become bottleneck", "Requires careful sequencing of data flows"] },
      { name: "Data Lake Staging", description: "Cloud data warehouse (Snowflake, BigQuery, Databricks) serves as staging layer — data transformed in SQL then pushed to Anaplan via CloudWorks", bestFor: "Enterprises with existing cloud data infrastructure and complex transformation requirements", pros: ["Leverages existing data team skills", "Complex transformations in SQL", "Audit trail in warehouse"], cons: ["Additional infrastructure cost", "More moving parts to monitor"] },
      { name: "Direct Connect", description: "Point-to-point integrations from each source system directly into the consuming Anaplan model with minimal transformation", bestFor: "Single-module deployments or POCs with 1-2 source systems and simple data requirements", pros: ["Fastest to implement", "Fewest dependencies", "Simple architecture"], cons: ["Does not scale well", "Duplicate connections across models", "No central governance"] },
      { name: "API-First", description: "Anaplan REST APIs and Integration API v2 called from orchestration platform (MuleSoft, Workato, custom code) for event-driven real-time data flows", bestFor: "Real-time use cases like commission calculations triggered by CRM deal close or inventory alerts", pros: ["Real-time capability", "Event-driven architecture", "Maximum flexibility"], cons: ["Highest development effort", "Requires API expertise", "Rate limit management needed"] },
      { name: "SAP S/4HANA Real-Time Bridge", description: "SAP CPI (Cloud Platform Integration) middleware connects S/4HANA via OData services to Anaplan CloudWorks, with delta extraction for GL postings, cost center hierarchies, and purchase order commitments refreshed on a near-real-time schedule with full reconciliation controls", bestFor: "SAP-centric enterprises needing daily or intraday financial and operational data in Anaplan FP&A and supply chain models", pros: ["Leverages native SAP APIs (OData, BAPI)", "Delta extraction minimizes data volume", "CPI handles transformation and error routing", "Supports S/4HANA public and private cloud editions"], cons: ["Requires SAP CPI licensing", "OData service activation needs BASIS team involvement", "Custom CDS views may be needed for complex extracts"] },
      { name: "Workday Adaptive-to-Anaplan Migration Bridge", description: "Parallel-run integration pattern for organizations migrating from Workday Adaptive Planning to Anaplan, using Workday RaaS reports to feed both platforms during transition with automated reconciliation between the two systems", bestFor: "Enterprises replacing Workday Adaptive with Anaplan who need parallel operation during migration to validate results and train users", pros: ["Zero disruption during transition", "Side-by-side comparison validates Anaplan model accuracy", "RaaS reports serve both platforms from single extraction", "Phased cutover reduces risk"], cons: ["Dual licensing cost during parallel period", "Reconciliation logic adds implementation scope", "Workday RaaS report design may need optimization for Anaplan consumption"] },
      { name: "Salesforce CRM Revenue Intelligence", description: "Bi-directional integration between Salesforce CRM and Anaplan using CloudWorks native Salesforce connector for pipeline data ingestion and Anaplan-calculated quota and forecast data writeback to custom Salesforce objects for rep-facing visibility", bestFor: "Sales performance management and revenue planning deployments where sales reps need to see Anaplan-calculated quotas, earnings estimates, and territory assignments directly within Salesforce", pros: ["Native CloudWorks connector — no middleware required", "Bi-directional sync keeps both systems current", "Reps stay in Salesforce while consuming Anaplan intelligence", "Bulk API handles large opportunity datasets efficiently"], cons: ["Salesforce API call limits require careful batching", "Custom objects in Salesforce need admin configuration", "Field-level security must be coordinated across both platforms"] },
      { name: "ServiceNow ITSM Cost Allocation", description: "ServiceNow CMDB and incident data feeds into Anaplan for IT cost allocation, chargeback, and showback models using ServiceNow REST API via CloudWorks with automated reconciliation to IT financial management actuals", bestFor: "IT finance and shared services organizations needing to allocate technology costs based on actual consumption metrics from ServiceNow CMDB, incident volumes, and service catalog usage", pros: ["Consumption-based allocation using real ITSM data", "REST API is well-documented and stable", "Supports both chargeback and showback models", "Integrates with ServiceNow ITFM module data"], cons: ["ServiceNow API rate limits on non-enterprise tiers", "CMDB data quality directly impacts allocation accuracy", "Custom API scopes may need ServiceNow admin approval"] },
    ],
  },

  // =========================================================================
  // ACCELERATORS
  // =========================================================================
  accelerators: {
    byModule: {
      fpa: [
        { name: "Revenue Waterfall Accelerator", description: "Pre-built pipeline-to-revenue conversion model with stage probabilities, weighted forecasting, and bridge analysis", timeReductionPercent: 35, components: ["Revenue bridge module", "Pipeline conversion rates", "Monthly/quarterly rollup", "Variance dashboard"] },
        { name: "Rolling Forecast Template", description: "12+3 month rolling forecast framework with automated reforecast triggers and driver-based assumptions", timeReductionPercent: 40, components: ["Rolling time dimension", "Driver assumption module", "Actual-vs-forecast comparison", "Reforecast workflow"] },
        { name: "Consolidation Starter Kit", description: "Multi-entity consolidation with intercompany eliminations, currency translation, and minority interest", timeReductionPercent: 30, components: ["Entity hierarchy", "Elimination rules engine", "FX translation module", "Consolidated P&L/BS/CF"] },
        { name: "Cash Flow Forecasting Accelerator", description: "13-week and rolling monthly cash flow model integrating AR collections, AP payments, debt service, and working capital with automated bank reconciliation", timeReductionPercent: 35, components: ["AR aging waterfall", "AP payment scheduler", "Debt service calendar", "Working capital drivers", "Cash position dashboard"] },
        { name: "CapEx Planning and Tracking Kit", description: "Capital expenditure lifecycle management from request through approval, procurement, and capitalization with depreciation schedule generation", timeReductionPercent: 30, components: ["CapEx request workflow", "Approval routing engine", "Asset capitalization module", "Depreciation calculator", "CapEx vs budget variance dashboard"] },
        { name: "Cost Allocation Engine", description: "Multi-method cost allocation framework supporting activity-based, headcount-based, revenue-based, and square-footage-based allocation of shared services costs", timeReductionPercent: 25, components: ["Allocation driver configuration", "Shared services cost pool", "Recipient department mapping", "Multi-pass allocation sequencer", "Allocation audit trail"] },
      ],
      supplyChain: [
        { name: "Demand Sensing Accelerator", description: "Statistical baseline generation with exponential smoothing and trend/seasonality decomposition", timeReductionPercent: 30, components: ["Baseline forecast engine", "Seasonal index module", "Override workflow", "Accuracy scorecard"] },
        { name: "S&OP Process Template", description: "End-to-end S&OP workflow from demand review through executive reconciliation with automated snapshots", timeReductionPercent: 35, components: ["Demand review dashboard", "Supply feasibility check", "Gap analysis module", "Executive summary view"] },
        { name: "Inventory Optimization Kit", description: "Safety stock and reorder point calculations with service level targets and ABC/XYZ classification", timeReductionPercent: 25, components: ["ABC/XYZ classifier", "Safety stock calculator", "Reorder point engine", "Excess/obsolete tracker"] },
        { name: "Supply Constraint Modeler", description: "Finite capacity planning framework with production line constraints, labor availability, raw material lead times, and supplier allocation rules for supply-demand balancing", timeReductionPercent: 30, components: ["Capacity constraint matrix", "Supplier lead time tracker", "Material availability checker", "Allocation priority rules", "Constraint resolution dashboard"] },
        { name: "Demand Collaboration Portal", description: "Multi-stakeholder demand input framework enabling sales, marketing, and category teams to submit bottom-up demand signals with automated consensus reconciliation", timeReductionPercent: 25, components: ["Stakeholder input forms", "Consensus algorithm module", "Override justification tracker", "Forecast value-add scorecard", "Collaboration audit trail"] },
      ],
      salesPerformance: [
        { name: "Commission Plan Builder", description: "Configurable comp plan framework supporting tiered rates, accelerators, decelerators, and multi-component structures", timeReductionPercent: 40, components: ["Plan configuration module", "Tiered rate engine", "Attainment calculator", "Payment summary dashboard"] },
        { name: "Crediting Rules Engine", description: "Pre-built crediting framework for direct, overlay, split, and roll-up credit scenarios with dispute tracking", timeReductionPercent: 30, components: ["Credit assignment rules", "Split credit calculator", "Dispute log module", "Audit trail dashboard"] },
        { name: "Quota Deployment Workflow", description: "End-to-end quota deployment process from finance target through sales leadership review, manager allocation, and rep acknowledgment with automated approval routing", timeReductionPercent: 35, components: ["Finance target module", "Leadership allocation workspace", "Manager split tool", "Rep acknowledgment tracker", "Deployment status dashboard"] },
        { name: "Earnings Estimator Portal", description: "Self-service rep-facing earnings calculator that lets salespeople model potential commissions on in-flight deals with real-time attainment context and plan component breakdown", timeReductionPercent: 20, components: ["Deal earnings simulator", "Current attainment display", "Plan component breakdown", "Historical earnings comparison", "Tier progress tracker"] },
      ],
      workforce: [
        { name: "Headcount Planning Accelerator", description: "Position-level workforce model with vacancy tracking, fill rate assumptions, and fully-loaded cost calculations", timeReductionPercent: 35, components: ["Position master list", "Vacancy/fill tracker", "Compensation calculator", "Departmental rollup"] },
        { name: "Attrition Modeling Template", description: "Tenure-based attrition curves with voluntary/involuntary split, backfill automation, and cost impact analysis", timeReductionPercent: 25, components: ["Attrition rate module", "Tenure curve engine", "Backfill planning", "Cost impact dashboard"] },
        { name: "Total Rewards Benchmarking Kit", description: "Compensation benchmarking framework that compares internal pay bands against market data by role, level, and geography with compa-ratio analysis and equity adjustment recommendations", timeReductionPercent: 30, components: ["Market data import module", "Compa-ratio calculator", "Pay band range analyzer", "Equity adjustment simulator", "Compensation review workflow"] },
        { name: "Contractor-to-FTE Conversion Analyzer", description: "Decision support model for evaluating contractor conversion opportunities with fully-loaded cost comparison, benefits impact, and budget reallocation scenarios", timeReductionPercent: 20, components: ["Contractor census module", "Fully-loaded cost comparator", "Benefits enrollment estimator", "Budget impact calculator", "Conversion priority ranker"] },
      ],
      territoryQuota: [
        { name: "Territory Carving Accelerator", description: "Geo-based territory builder with workload balancing, coverage scoring, and drag-and-drop rebalancing", timeReductionPercent: 35, components: ["Geography hierarchy", "Account assignment engine", "Balance scorecard", "Coverage heat map"] },
        { name: "Quota Allocation Template", description: "Top-down/bottom-up quota waterfall with seasonality adjustments, ramp factors, and what-if modeling", timeReductionPercent: 30, components: ["Waterfall allocation module", "Seasonality index", "Ramp adjustment rules", "What-if simulator"] },
        { name: "Account Scoring and Prioritization Engine", description: "Data-driven account scoring model that combines firmographic data, historical revenue, whitespace opportunity, and propensity-to-buy signals to rank accounts for territory optimization", timeReductionPercent: 25, components: ["Account scoring algorithm", "Firmographic data module", "Whitespace calculator", "Priority tier classifier", "Account heat map dashboard"] },
      ],
      custom: [
        { name: "Data Hub Starter Kit", description: "Central data hub model with import validation rules, master data management, and downstream distribution", timeReductionPercent: 30, components: ["Import staging module", "Validation rules engine", "Master data lists", "Distribution workflow"] },
        { name: "API Integration Framework", description: "Pre-configured REST API patterns for common CRUD operations with error handling and retry logic", timeReductionPercent: 25, components: ["API endpoint templates", "Error handling module", "Retry/queue logic", "Integration dashboard"] },
        { name: "Multi-Model Orchestration Controller", description: "Cross-model dependency management framework with automated sequencing, completion monitoring, and error recovery for complex connected planning environments", timeReductionPercent: 35, components: ["Dependency graph module", "Execution sequencer", "Completion flag tracker", "Error recovery workflow", "Orchestration status dashboard"] },
        { name: "Change Management Dashboard Kit", description: "Model governance and change tracking framework with version comparison, audit logging, impact analysis, and stakeholder notification for production model changes", timeReductionPercent: 20, components: ["Change request workflow", "Version comparison module", "Impact analysis engine", "Stakeholder notification rules", "Audit log dashboard"] },
      ],
    },
  },

  // =========================================================================
  // CONFIGURATIONS
  // =========================================================================
  configurations: {
    common: {
      fiscalCalendar: {
        options: ["Calendar year (Jan-Dec)", "Fiscal year (any start month)", "4-4-5 retail calendar", "5-4-4 or 4-5-4 variants", "52/53 week year"],
        bestPractices: [
          "Align Anaplan time dimension to the client's fiscal calendar from day one — retrofitting is costly",
          "Build a separate calendar mapping module to translate between fiscal and calendar periods",
          "Use Anaplan native time settings for standard calendars; custom lists only for non-standard (4-4-5)",
          "Always include a 'Year Total' summary period for annual comparisons and board reporting",
        ],
      },
      currency: {
        multiCurrencySetup: ["Local currency input at entity level", "Central rate table with period-specific rates", "Reporting currency translation module", "Support for average rate (P&L) and closing rate (BS) methods"],
        rateTypes: ["Closing/spot rate for balance sheet items", "Average rate for income statement items", "Budget rate locked at plan approval", "Forecast rate updated monthly from treasury"],
      },
      security: {
        roleBased: ["Workspace Admin — full model and user management", "Model Admin — model configuration and list management", "Power User — data entry, actions, and dashboard access", "End User — dashboard view and limited data entry", "Read Only — view dashboards and exports only"],
        functionalAccess: ["Module-level read/write permissions", "Dashboard publish and share controls", "Action execution permissions", "Import/export restrictions"],
        dataLevel: ["Selective access by dimension (region, department, cost center)", "Dynamic filtering based on user role attributes", "Row-level security for sensitive compensation or deal data", "Time-based access restrictions (lock prior periods)"],
      },
      versions: {
        standard: ["Actuals — imported from source systems, read-only in Anaplan", "Budget — annual plan, locked after approval", "Forecast — rolling re-forecast, updated monthly or quarterly", "What-If — sandbox scenarios, not shared until promoted"],
        customVersionStrategies: ["Version waterfall: Budget -> Forecast 1 -> Forecast 2 -> ... -> Actuals", "Snapshot versions for S&OP consensus milestones", "Prior year version for YoY comparison dashboards", "Management adjustments overlay version for top-down tweaks"],
      },
      timeDimensions: {
        granularityOptions: ["Monthly — standard for financial planning, lowest admin overhead", "Weekly — required for demand planning, retail, and workforce scheduling", "Daily — rare in Anaplan, used for cash positioning and short-term demand sensing", "Quarterly — summary-only, used for executive reporting and long-range strategic plans"],
        tradeoffs: [
          "Weekly granularity multiplies cell count by ~4.3x vs monthly — impacts model performance",
          "Daily models require aggressive data archival strategies to manage model size",
          "Mixed granularity (weekly near-term, monthly outer periods) is common in supply chain but adds formula complexity",
          "Time hierarchy must be designed upfront — changing granularity post-build requires significant rework",
        ],
      },
    },
    compliance: {
      soc2: {
        name: "SOC 2 Type II",
        relevance: "Anaplan maintains SOC 2 Type II certification covering security, availability, and confidentiality trust service criteria for the cloud platform",
        implementationConsiderations: [
          "Anaplan's SOC 2 report covers platform-level controls — customer-side access controls, data handling, and integration security remain the customer's responsibility",
          "Model-level audit trails in Anaplan record all data changes, formula modifications, and user actions with timestamps and user attribution supporting SOC 2 evidence requirements",
          "Role-based access control (RBAC) must be configured following least-privilege principles, with quarterly access reviews documented for auditor evidence",
          "Integration credentials stored in CloudWorks use encrypted credential vaults — never embed credentials in model formulas or import definitions",
          "Data retention and archival policies should be documented and enforced through Anaplan model lifecycle management processes",
        ],
        deliverables: ["Access control matrix", "Audit trail configuration", "Data classification schema", "Credential management procedures", "Quarterly access review schedule"],
      },
      gdpr: {
        name: "General Data Protection Regulation (GDPR)",
        relevance: "Anaplan processes personal data in workforce planning, sales compensation, and customer-facing models for EU/EEA individuals requiring GDPR compliance measures",
        implementationConsiderations: [
          "Identify all personal data elements flowing into Anaplan models — employee names, compensation figures, performance ratings, customer contact details — and document lawful basis for processing",
          "Anaplan's EU data residency option ensures data-at-rest stays within EU data centers — confirm workspace region assignment during provisioning for GDPR-scoped models",
          "Implement data minimization by importing only the personal data fields necessary for planning calculations — avoid pulling full employee or customer records when only aggregates are needed",
          "Configure data retention periods in Anaplan to align with GDPR storage limitation principle — automate archival of personal data beyond retention period using scheduled processes",
          "Right to erasure (Article 17) requires ability to identify and remove individual data subjects from Anaplan models — design list structures and import processes to support targeted deletion",
          "Data processing agreements (DPAs) with Anaplan as data processor should be reviewed and executed before personal data enters the platform",
        ],
        deliverables: ["Data processing impact assessment (DPIA)", "Personal data inventory for Anaplan models", "Data retention schedule", "Subject access request procedure", "DPA execution checklist"],
      },
      hipaa: {
        name: "Health Insurance Portability and Accountability Act (HIPAA)",
        relevance: "Healthcare organizations using Anaplan for workforce planning, financial planning, or patient volume forecasting must ensure PHI is handled in compliance with HIPAA requirements",
        implementationConsiderations: [
          "Anaplan is NOT a HIPAA-covered entity and does not sign BAAs (Business Associate Agreements) for standard deployments — avoid loading Protected Health Information (PHI) directly into Anaplan models",
          "Design integration patterns that aggregate and de-identify patient data before it enters Anaplan — use patient volume counts, department-level metrics, and financial summaries rather than individual patient records",
          "If any model requires data derived from PHI sources (patient volume forecasts, department staffing based on census), document the de-identification methodology and verify no re-identification risk exists",
          "Access controls for healthcare financial models should follow minimum necessary standard — clinical department heads see only their department's data",
          "Audit trail capabilities in Anaplan support HIPAA accountability requirements — enable and retain model activity logs for the required 6-year retention period",
        ],
        deliverables: ["PHI boundary documentation", "De-identification methodology", "Access control policy for healthcare models", "Audit log retention configuration", "HIPAA compliance checklist for Anaplan deployment"],
      },
      iso27001: {
        name: "ISO 27001 Information Security Management",
        relevance: "Anaplan holds ISO 27001 certification for its cloud platform, and implementation projects should align with customer ISO 27001 ISMS requirements",
        implementationConsiderations: [
          "Anaplan's ISO 27001 certification covers platform infrastructure, but customer-configured security controls (RBAC, selective access, integration credentials) must be documented within the customer's own ISMS scope",
          "Risk assessment for Anaplan implementation should be conducted as part of the customer's ISMS risk treatment plan, covering data classification, access control, business continuity, and third-party risk",
          "Encryption in transit (TLS 1.2+) and at rest (AES-256) is provided by the Anaplan platform — document these controls in the customer's Statement of Applicability",
          "Change management for Anaplan models should follow the customer's ISO 27001 change management procedure — document model changes, approvals, and rollback plans",
          "Business continuity planning should account for Anaplan platform availability SLA (99.7%) and include procedures for operating during platform outages using exported data",
          "Annual security reviews of Anaplan workspace configurations, access rights, and integration security should be incorporated into the ISMS internal audit schedule",
        ],
        deliverables: ["Risk assessment addendum for Anaplan", "Statement of Applicability mapping", "Change management procedure for Anaplan models", "Business continuity plan for planning processes", "Internal audit checklist for Anaplan controls"],
      },
    },
  },

  // =========================================================================
  // SIZING
  // =========================================================================
  sizing: {
    tiers: {
      small: { criteria: "Single department or business unit, straightforward planning process", typicalDimensions: "3-5 dimensions, <50 list items each", userCount: "10-30 users", modelCount: "1-2 models", estimatedCellCount: "Under 10M cells" },
      medium: { criteria: "Multi-department or multi-region, moderate integration needs", typicalDimensions: "5-8 dimensions, 50-500 list items each", userCount: "30-150 users", modelCount: "3-6 models", estimatedCellCount: "10M-100M cells" },
      large: { criteria: "Enterprise-wide planning across multiple BUs, complex integrations", typicalDimensions: "8-12 dimensions, 500-5000 list items each", userCount: "150-500 users", modelCount: "6-15 models", estimatedCellCount: "100M-1B cells" },
      enterprise: { criteria: "Global deployment, multi-cloud, connected planning across all functions", typicalDimensions: "12+ dimensions, 5000+ list items, multiple hierarchies per dimension", userCount: "500+ users", modelCount: "15+ models", estimatedCellCount: "1B+ cells" },
    },
    guidelines: [
      "Cell count = product of all list sizes across all dimensions — a model with 5 dimensions of 100 items each = 10B cells if fully crossed",
      "Use subsidiary views and filtered lists to keep actual cell consumption at 5-10% of theoretical maximum",
      "Separate high-dimensionality calculation modules from low-dimensionality reporting modules",
      "Archive historical data beyond 3 years to a data warehouse — keep only rolling periods in Anaplan",
      "Target <500ms dashboard load time — if exceeding, review module design and aggregation strategy",
      "Rule of thumb: each additional dimension doubles your model size — add dimensions sparingly",
      "Workspace memory limits vary by Anaplan tier — confirm allocation with Anaplan CSM before large deployments",
    ],
  },

  // =========================================================================
  // TROUBLESHOOTING
  // =========================================================================
  troubleshooting: {
    common: [
      { issue: "Slow calculation performance", symptoms: ["Dashboard load times exceed 5 seconds", "Actions/imports take unusually long", "Users report spinning wheel during data entry"], resolution: "Audit module design for unnecessary cross-dimensional references; break large modules into summary and detail tiers; use COLLECT and SUM on summary modules; enable model optimization mode", prevention: "Follow PLANS sparsity guidelines; avoid LOOKUP across large lists; keep calculation modules under 100M cells" },
      { issue: "Data import failures", symptoms: ["CloudWorks jobs fail with mapping errors", "Row count mismatches between source and target", "Partial imports with silent data loss"], resolution: "Check column mapping and delimiter settings; verify source data encoding (UTF-8); review import action's 'ignore errors' setting; check for list items not in target hierarchy", prevention: "Add validation staging modules; implement reconciliation counts; set up CloudWorks error notification alerts" },
      { issue: "Model size exceeding workspace limits", symptoms: ["Unable to add new modules or line items", "Workspace usage dashboard shows >90% consumption", "Error messages about insufficient workspace capacity"], resolution: "Run model audit to identify oversized modules; archive historical periods; collapse sparse dimensions; move reporting aggregations to separate models", prevention: "Right-size dimensions during design phase; implement data lifecycle policies; monitor workspace consumption monthly" },
      { issue: "Formula errors and circular references", symptoms: ["#ERROR values appearing in cells", "Model stuck in calculation loop", "Unexpected zero or blank values in output"], resolution: "Use Anaplan model audit for formula dependency tracing; check for circular module references; verify time period offsets in OFFSET and LAG functions; validate IF/THEN conditional logic", prevention: "Document formula dependencies in design phase; use clear naming conventions for source vs calculated line items; test formulas with edge case data" },
      { issue: "Permission and access issues", symptoms: ["Users cannot see expected dashboards", "Data entry fields appear read-only", "Selective access filtering not applying correctly"], resolution: "Review role assignments in workspace admin; check selective access configuration on lists; verify dashboard publish status; confirm user belongs to correct access group", prevention: "Document security model during design phase; test with representative users from each role; create security matrix and review quarterly" },
    ],
    byModule: {
      fpa: [
        { issue: "Consolidation eliminations not balancing", symptoms: ["Intercompany transactions not netting to zero", "Minority interest calculation errors"], resolution: "Verify elimination rules match intercompany transaction coding; check entity hierarchy parent-child relationships; validate currency translation sequence", prevention: "Design elimination rules with finance team before build; test with known balanced transactions" },
        { issue: "Variance analysis showing incorrect drivers", symptoms: ["Price/volume/mix variance components do not sum to total variance", "Driver decomposition produces unexpected results"], resolution: "Review variance decomposition formula sequence; check for rounding in intermediate calculations; verify base period references", prevention: "Use standard variance decomposition methodology; validate against manual calculation for first period" },
        { issue: "Rolling forecast periods misaligned", symptoms: ["Actuals overwriting forecast periods", "Time range showing wrong months", "Year-end rollover not functioning"], resolution: "Check current period system module configuration; verify switchover formula logic; review time range selectors on dashboards", prevention: "Build automated period rollover action; test year-end boundary before go-live" },
      ],
      supplyChain: [
        { issue: "Statistical forecast generating unrealistic values", symptoms: ["Negative demand forecasts", "Extreme spikes not matching historical patterns", "Seasonal patterns not captured"], resolution: "Review algorithm parameter settings; check for outliers in historical data; verify seasonality index calculations; ensure sufficient history (minimum 24 months)", prevention: "Implement outlier detection in data staging; validate algorithm selection per product category; set forecast bounds" },
        { issue: "S&OP consensus version conflicts", symptoms: ["Multiple teams overwriting each other's inputs", "Snapshot comparisons showing unexpected changes"], resolution: "Review version access permissions; check workflow sequencing; verify snapshot timing aligns with process calendar", prevention: "Lock versions after review milestone; use separate input modules per function; implement approval workflow" },
        { issue: "Inventory optimization producing infeasible results", symptoms: ["Recommended safety stock exceeds warehouse capacity", "Reorder quantities too small to be practical"], resolution: "Add minimum/maximum order quantity constraints; validate lead time assumptions; check service level target reasonableness", prevention: "Include physical constraints in model design; validate parameters with supply chain ops before launch" },
      ],
      salesPerformance: [
        { issue: "Commission calculation discrepancies", symptoms: ["Calculated commissions do not match rep expectations", "Tier boundaries producing incorrect rates", "Accelerator thresholds not triggering"], resolution: "Trace individual transaction through crediting and calculation modules; verify tier lookup table boundaries; check for rounding mode differences vs legacy system", prevention: "Parallel run for 2 pay periods before cutover; document all edge cases in test plan; implement calculation audit trail" },
        { issue: "Crediting rules producing duplicate payments", symptoms: ["Same deal credited multiple times", "Total credited amount exceeds deal value"], resolution: "Review credit assignment rules for overlapping criteria; check split credit percentages sum to 100%; verify overlay rules exclude primary credit", prevention: "Build credit validation summary that compares total credits to total bookings; alert when sum exceeds 100%" },
        { issue: "Plan deployment overwriting active calculations", symptoms: ["Mid-quarter plan changes affecting already-calculated periods", "Rep earnings changing retroactively without adjustment flag"], resolution: "Implement plan effective date logic; separate plan parameters from transaction calculations; add retroactive adjustment tracking", prevention: "Design plan versioning with effective date ranges; lock completed periods before deploying new plans" },
      ],
      workforce: [
        { issue: "Headcount double-counting after reorg", symptoms: ["Total FTE count increases without new hires", "Positions appearing in multiple departments"], resolution: "Audit position-to-department mapping for duplicates; verify transfer actions update both source and target; check effective dates on org changes", prevention: "Build position uniqueness validation; require transfer workflow for all org moves; reconcile to HCM system monthly" },
        { issue: "Compensation calculations not reflecting benefits changes", symptoms: ["Fully-loaded cost per employee stale", "Benefits rate changes not propagating"], resolution: "Check benefits rate table update timing; verify lookup references point to current period rates; review benefits tier assignment logic", prevention: "Automate benefits rate imports from HRIS; set up change notification for rate table updates" },
        { issue: "Attrition model over-predicting turnover", symptoms: ["Forecast vacancies exceed historical norms", "Budget shows unrealistic hiring requirements"], resolution: "Recalibrate attrition curves with recent 12-month data; check for one-time events (layoffs, reorgs) skewing rates; segment by tenure and department", prevention: "Refresh attrition model quarterly; exclude non-recurring events from baseline; compare predictions to actual monthly" },
      ],
      territoryQuota: [
        { issue: "Territory balance optimization not converging", symptoms: ["Algorithm runs but Gini coefficient does not improve", "Optimization produces identical results to input"], resolution: "Check constraint configuration — too many hard constraints prevent optimization; verify account data completeness; increase iteration limit", prevention: "Start with fewer constraints and add incrementally; validate account potential data quality before running optimizer" },
        { issue: "Quota allocation exceeding company target", symptoms: ["Sum of individual quotas exceeds top-down number", "Ramp adjustments creating quota gap"], resolution: "Review allocation waterfall for rounding accumulation; verify ramp factor application sequence; check for double-counting of overlay quotas", prevention: "Build top-down reconciliation check that compares quota sum to company target; flag discrepancies automatically" },
        { issue: "Account reassignment breaking CRM sync", symptoms: ["Salesforce territory assignment out of sync", "Reps seeing wrong accounts after rebalance"], resolution: "Verify export mapping to CRM territory object; check for CRM validation rules blocking updates; review sync timing relative to territory effective date", prevention: "Test CRM sync in sandbox before production rebalance; implement reconciliation report comparing Anaplan assignments to CRM" },
      ],
      custom: [
        { issue: "Cross-model data flow timing errors", symptoms: ["Downstream model shows stale data", "Calculation results inconsistent across connected models"], resolution: "Map model dependency graph and validate import sequence; check CloudWorks orchestration timing; add completion flags between chained processes", prevention: "Build dependency graph documentation; use CloudWorks sequential chains; add data freshness timestamps to hub model" },
        { issue: "API rate limiting causing integration failures", symptoms: ["HTTP 429 errors in integration logs", "Partial data loads during peak hours"], resolution: "Implement exponential backoff retry logic; batch API calls to reduce request count; schedule large loads during off-peak hours", prevention: "Design integrations within Anaplan API rate limits; use bulk API endpoints instead of transactional; monitor API usage dashboard" },
        { issue: "Custom workflow approvals stuck in queue", symptoms: ["Actions waiting for approval indefinitely", "Notification emails not sent"], resolution: "Check approval group membership; verify email notification configuration; review workflow state for orphaned items; check for conditional logic blocking progression", prevention: "Set up escalation rules with timeout thresholds; test workflow end-to-end with all approver roles; monitor queue dashboard" },
      ],
    },
  },

  // =========================================================================
  // PLATFORM CAPABILITIES (CloudWorks, Polaris UX, PlanIQ)
  // =========================================================================
  platformCapabilities: {
    cloudworks: {
      name: "Anaplan CloudWorks",
      description: "Native integration orchestration platform that connects Anaplan to external systems without middleware",
      features: [
        "Pre-built connectors for Salesforce, Workday, SAP, Oracle, AWS S3, Azure Blob, Google BigQuery, Snowflake, Databricks, ServiceNow, HubSpot, NetSuite, SFTP, and HTTP/REST",
        "Drag-and-drop integration flow builder with scheduled or event-driven triggers",
        "Data transformation during flow execution — column mapping, data type conversion, filtering",
        "Multi-step orchestration chains — sequence imports, exports, processes, and cross-model syncs",
        "Built-in error handling with retry logic, notification alerts, and detailed execution logs",
        "OAuth 2.0, API key, and certificate-based authentication with encrypted credential vault",
        "Parallel flow execution for independent data streams to reduce total integration runtime",
        "Delta/incremental data loading patterns to minimize data transfer and processing time",
      ],
      bestPractices: [
        "Use CloudWorks as first choice for Anaplan integrations before evaluating middleware",
        "Design modular flows — separate data extraction from transformation from loading",
        "Implement reconciliation counts at each flow step to detect data loss early",
        "Schedule resource-intensive flows during off-peak hours (typically 2-6 AM local)",
        "Version control integration flows by maintaining documentation alongside model changes",
      ],
    },
    polaris: {
      name: "Anaplan Polaris (New UX Engine)",
      description: "Next-generation calculation engine and user experience built on a cloud-native, hyperscale architecture",
      features: [
        "Hyperscale calculation engine capable of processing billions of cells with sub-second response times",
        "Multi-dimensional sparse data storage that only allocates resources for cells containing data",
        "In-memory OLAP engine with columnar storage optimization for planning workloads",
        "Dynamic cell access — users only load and interact with the cells they need, not the entire model",
        "New UX dashboard builder with responsive layouts, modern visualization components, and mobile-first design",
        "Improved list management with support for extremely large hierarchies (millions of members)",
        "Native support for time-series analysis with built-in temporal aggregation functions",
        "Cross-model calculations without requiring physical data movement between models",
      ],
      migrationConsiderations: [
        "Classic models can be migrated to Polaris using Anaplan's migration toolkit",
        "Formula syntax is largely compatible but certain functions may need adaptation",
        "Dashboard layouts require redesign for the new UX framework",
        "Performance characteristics differ — operations that were slow in classic may be fast in Polaris and vice versa",
        "Workspace sizing rules differ between classic and Polaris engines",
      ],
    },
    planIQ: {
      name: "Anaplan PlanIQ",
      description: "Machine learning forecasting engine embedded in the Anaplan platform for predictive planning",
      features: [
        "Automated ML pipeline that trains, evaluates, and selects the best forecasting algorithm for each data series",
        "Built-in algorithms: ARIMA, exponential smoothing, Prophet, gradient boosting, neural networks",
        "External signal integration — weather data, economic indicators, Google Trends for demand sensing",
        "Forecast accuracy tracking with automated model retraining when performance degrades",
        "Explainability reports showing which drivers and signals most influence predictions",
        "Integration with Anaplan models via CloudWorks for seamless forecast data flow",
      ],
      useCases: [
        "Demand forecasting with external signals for supply chain planning",
        "Revenue forecasting using pipeline data and historical conversion patterns",
        "Workforce demand prediction based on business volume drivers",
        "Cash flow forecasting with payment pattern recognition",
      ],
    },
  },

  // =========================================================================
  // ADDITIONAL INDUSTRY METRICS
  // =========================================================================
  industryMetrics: {
    manufacturing: [
      "Inventory carrying cost reduction: 15-25% through safety stock optimization",
      "Demand forecast accuracy improvement: 20-35% with PlanIQ ML models",
      "S&OP cycle time reduction: from 3 weeks to 5 days on average",
      "Production planning efficiency: 30% reduction in overtime costs",
      "Raw material waste reduction: 10-18% through better demand-supply alignment",
    ],
    financialServices: [
      "Regulatory reporting preparation time: 60-70% reduction",
      "Scenario modeling capacity: from 3-5 scenarios to 50+ per cycle",
      "Stress testing turnaround: from weeks to hours",
      "Cost-to-income ratio improvement: 2-4 percentage points",
      "Branch/unit-level planning cycle: reduced from 6 weeks to 1 week",
    ],
    healthcare: [
      "Patient volume forecast accuracy: 85-92% at department level",
      "Workforce scheduling optimization: 15-20% reduction in agency/temp spend",
      "Capital planning cycle reduction: from 4 months to 6 weeks",
      "Drug inventory waste reduction: 12-18% in pharmacy operations",
      "Revenue cycle improvement: 8-12% reduction in days in AR",
    ],
    technology: [
      "ARR/MRR forecasting accuracy: 90-95% at 3-month horizon",
      "Headcount planning cycle: from 4 weeks to 3 days",
      "Quota deployment time: from 6 weeks to 1 week",
      "Commission calculation processing: from 5 days to same-day",
      "Gross margin improvement: 2-3 percentage points through better cost allocation",
    ],
    retail: [
      "Demand forecasting at SKU/store level: 25-40% accuracy improvement",
      "Promotional lift modeling: 80-85% accuracy on volume impact",
      "Markdown optimization: 5-8% improvement in sell-through rates",
      "Store labor scheduling: 10-15% reduction in labor cost per unit sold",
      "Open-to-buy planning cycle: from weekly to daily refresh capability",
    ],
    energy: [
      "Capital project portfolio optimization: 8-12% improvement in IRR allocation",
      "Production forecast accuracy: 90-95% for operated assets",
      "HSE budget compliance: real-time tracking vs quarterly batch reporting",
      "Renewable capacity planning: scenario comparison across 100+ site combinations",
      "Trading desk P&L reporting: from T+3 to T+0 with real-time data feeds",
    ],
  },

  // =========================================================================
  // MODULE KEYWORDS
  // =========================================================================
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

  // =========================================================================
  // TRAINING & CHANGE MANAGEMENT
  // =========================================================================
  trainingPrograms: {
    roleBasedPlans: {
      endUser: {
        role: "End User / Business Planner",
        description: "Business planners who use Anaplan dashboards and data entry forms as part of their regular planning workflow — they need to be proficient with the tool, not experts in model building",
        duration: "4-8 hours total, delivered across 2-3 sessions",
        topics: [
          "Navigating Anaplan dashboards — filtering, drill-down, version switching, and saved views",
          "Data entry workflows — entering assumptions, submitting budgets, and approving plans through structured forms",
          "Running pre-built actions — triggering imports, executing scenarios, and generating reports with one-click actions",
          "Exporting data to Excel and PDF for offline analysis and stakeholder sharing",
          "Understanding version management — when to work in Budget vs Forecast vs What-If scenarios",
          "Using personal saved views and bookmarks to customize the planning experience without affecting other users",
        ],
        deliverables: ["Quick reference guide (2-page PDF)", "Role-specific video walkthrough (15-20 min)", "Hands-on exercise workbook", "FAQ document"],
        successMetrics: ["90%+ user adoption within 30 days of training", "Less than 5 support tickets per 100 users in first month", "Average dashboard load-to-action time under 2 minutes"],
      },
      powerUser: {
        role: "Power User / Super User",
        description: "Designated departmental experts who serve as first-line support, can create basic reports, modify assumptions, and train new team members within their functional area",
        duration: "16-24 hours total, delivered across 4-6 sessions over 2 weeks",
        topics: [
          "Advanced dashboard usage — creating personal views, configuring context selectors, and building ad-hoc reports",
          "Data import monitoring — reviewing import logs, troubleshooting failed loads, and reconciling source-to-target data",
          "Scenario management — creating, comparing, and promoting what-if scenarios with proper version control",
          "Basic formula understanding — reading and interpreting line item formulas to troubleshoot unexpected results",
          "User support skills — how to diagnose and resolve common end-user issues before escalating to model admins",
          "Change request process — documenting enhancement requests, business requirements, and model modification needs for the admin team",
          "Period-end procedures — executing month-end close actions, generating management reports, and archiving period data",
        ],
        deliverables: ["Power user certification assessment", "Troubleshooting decision tree", "Change request template", "Monthly admin checklist"],
        successMetrics: ["80%+ of Tier 1 support issues resolved by power users without admin escalation", "Average time to resolve end-user issues under 4 hours", "100% of power users certified within 60 days"],
      },
      modelAdmin: {
        role: "Model Administrator / Anaplan Admin",
        description: "Technical administrators responsible for model maintenance, user management, data integration monitoring, and coordinating with the implementation partner for enhancements",
        duration: "32-40 hours total, delivered across 8-10 sessions over 3-4 weeks, plus ongoing mentoring",
        topics: [
          "Model architecture understanding — module structure, data flows, calculation dependencies, and design decisions documented in the functional design document",
          "User and role management — provisioning accounts, assigning roles, configuring selective access, and managing workspace permissions",
          "Integration administration — CloudWorks job monitoring, troubleshooting failed imports/exports, credential rotation, and schedule management",
          "List and hierarchy management — adding, modifying, and restructuring list items including parent-child relationships and production list maintenance procedures",
          "Formula maintenance — modifying existing formulas, adding new line items, and understanding the impact of changes on downstream calculations",
          "Performance monitoring — using model audit tools, identifying oversized modules, optimizing calculation performance, and managing workspace capacity",
          "Version and period management — executing period rollovers, managing version switchovers, creating snapshots, and archiving historical data",
          "Backup and recovery procedures — exporting model state, maintaining change logs, and executing rollback procedures when changes cause issues",
          "Security auditing — reviewing access logs, conducting quarterly permission reviews, and maintaining compliance documentation",
        ],
        deliverables: ["Admin run book (comprehensive operations manual)", "Integration monitoring dashboard", "Security audit template", "Model change log template", "Escalation contact matrix"],
        successMetrics: ["Admin team independently handles 95%+ of day-to-day operations within 90 days", "Zero unplanned model outages due to admin error", "Integration job success rate above 99%", "All model changes documented in change log"],
      },
      executiveSponsor: {
        role: "Executive Sponsor / Leadership",
        description: "Senior leaders who consume Anaplan outputs for decision-making and need to understand the platform's value, capabilities, and strategic roadmap without technical detail",
        duration: "2-3 hours total, delivered as a single executive briefing with optional quarterly refreshers",
        topics: [
          "Platform value overview — ROI metrics, time savings, and accuracy improvements achieved through the implementation",
          "Executive dashboard walkthrough — navigating high-level KPI views, scenario comparison summaries, and variance reports",
          "Decision support capabilities — how to request ad-hoc analysis, scenario modeling, and what-if simulations from the planning team",
          "Governance and roadmap — understanding the center of excellence model, enhancement request process, and future module expansion plans",
        ],
        deliverables: ["Executive summary dashboard guide (1-page)", "ROI tracking dashboard", "Quarterly business review template"],
        successMetrics: ["Executive dashboard viewed weekly by 80%+ of leadership team", "Strategic planning decisions reference Anaplan scenario outputs", "Continued budget approval for platform expansion"],
      },
    },
    adoptionMetrics: {
      leading: [
        "Training completion rate by role (target: 95%+ within 30 days of go-live)",
        "Active user login frequency (target: 80%+ of licensed users logging in at least weekly)",
        "Data submission timeliness (target: 90%+ of planners submitting by deadline)",
        "Self-service report generation (target: 50%+ of reports run by business users, not IT)",
        "Support ticket volume trend (target: declining week-over-week in first 90 days)",
      ],
      lagging: [
        "Planning cycle time reduction vs pre-Anaplan baseline (measured quarterly)",
        "Forecast accuracy improvement vs pre-Anaplan baseline (measured after 2-3 full cycles)",
        "FTE hours saved in planning processes (measured by time study at 90 days and 6 months)",
        "User satisfaction score from quarterly survey (target: 4.0+ on 5-point scale)",
        "Legacy tool decommissioning (target: all spreadsheet-based planning processes retired within 6 months)",
      ],
      changeManagementActivities: [
        "Executive sponsor kickoff communication — leadership video or town hall announcing the initiative, its goals, and timeline",
        "Stakeholder impact assessment — identify which teams are affected, how their workflows change, and what support they need",
        "Champion network activation — recruit 1-2 advocates per department to participate in UAT, provide feedback, and evangelize the new tool",
        "Phased communication plan — weekly updates during build phase, daily updates during deployment, bi-weekly tips and best practices during hypercare",
        "Resistance management — proactively identify and address concerns from teams that perceive the new tool as threatening their expertise or autonomy",
        "Quick wins showcase — demonstrate early value within 2 weeks of go-live by highlighting specific time savings, error reductions, or insight improvements",
        "Feedback loop establishment — create multiple channels (surveys, office hours, Slack/Teams channel) for users to report issues and suggest improvements",
        "Celebration milestones — recognize successful first planning cycle completion, high adoption rates, and teams that fully transition from legacy tools",
      ],
    },
  },

  // =========================================================================
  // IMPLEMENTATION RISK CATALOG
  // =========================================================================
  riskCatalog: {
    categories: {
      technical: [
        {
          risk: "Model performance degradation at scale",
          description: "As data volume grows and more users access the model concurrently, calculation times and dashboard load times may exceed acceptable thresholds, degrading user experience and adoption",
          probability: "medium" as const,
          impact: "high" as const,
          mitigations: [
            "Follow PLANS sparsity guidelines during design — target less than 10% cell density across dimensions",
            "Separate high-dimensionality calculation modules from low-dimensionality reporting modules",
            "Implement summary modules with pre-aggregated data for executive dashboards",
            "Conduct performance benchmarking during UAT with production-scale data volumes",
            "Establish performance SLAs (e.g., dashboard load under 3 seconds) and monitor proactively",
          ],
          earlyWarnings: ["Dashboard load times exceeding 5 seconds during testing", "Import job durations increasing week-over-week", "Users reporting spinning wheel during data entry"],
        },
        {
          risk: "Integration reliability failures",
          description: "Automated data integrations between source systems (ERP, CRM, HCM) and Anaplan may fail due to API changes, credential expiration, network issues, or data format changes, causing stale or missing data in planning models",
          probability: "high" as const,
          impact: "high" as const,
          mitigations: [
            "Implement data freshness timestamps visible on dashboards so users know when data was last updated",
            "Configure CloudWorks alerting for failed jobs with immediate email/Slack notification to admin team",
            "Build reconciliation counts that compare source record counts to Anaplan imported records after every load",
            "Maintain credential rotation schedule with 30-day advance renewal reminders",
            "Design fallback manual import procedures for critical data feeds during extended outages",
          ],
          earlyWarnings: ["CloudWorks job failure rate exceeding 2% in any week", "Source system API deprecation announcements", "Data reconciliation count mismatches"],
        },
        {
          risk: "Workspace capacity exhaustion",
          description: "Anaplan workspace memory allocation is finite and shared across all models in the workspace. Unchecked model growth can exhaust capacity, preventing new models or modules from being created",
          probability: "medium" as const,
          impact: "high" as const,
          mitigations: [
            "Establish workspace consumption monitoring with monthly reporting to model admins",
            "Define data retention policies — archive data older than 3 years to a data warehouse",
            "Right-size dimensions during design — challenge every requested dimension with actual reporting requirements",
            "Implement model lifecycle governance — decommission models that are no longer in active use",
            "Coordinate with Anaplan CSM on capacity planning for multi-phase deployments",
          ],
          earlyWarnings: ["Workspace utilization exceeding 70%", "New module creation causing noticeable performance impact", "Anaplan CSM capacity warning notifications"],
        },
      ],
      organizational: [
        {
          risk: "Insufficient executive sponsorship",
          description: "Without active, visible executive sponsorship, competing priorities, organizational resistance, and resource constraints can stall the implementation or reduce its scope below the threshold needed to deliver meaningful business value",
          probability: "medium" as const,
          impact: "critical" as const,
          mitigations: [
            "Secure named executive sponsor during project charter phase with defined time commitment (minimum 2 hours per month)",
            "Schedule bi-weekly executive steering committee updates with clear escalation procedures",
            "Tie project milestones to executive OKRs or bonus targets to ensure continued prioritization",
            "Prepare executive sponsor with talking points and success metrics for organizational communication",
            "Identify backup sponsor or co-sponsor to maintain momentum during travel, PTO, or role transitions",
          ],
          earlyWarnings: ["Executive sponsor cancelling two or more steering meetings consecutively", "Resource reallocation requests pulling team members to other projects", "Scope reduction discussions initiated by management without performance justification"],
        },
        {
          risk: "Low user adoption post-launch",
          description: "Users may resist transitioning from familiar spreadsheet-based processes to Anaplan, leading to low login rates, continued use of shadow spreadsheets, and failure to realize planned ROI",
          probability: "high" as const,
          impact: "high" as const,
          mitigations: [
            "Involve end users in design phase through collaborative workshops and prototype reviews",
            "Deploy phased rollout starting with champion users who validate and advocate for the tool",
            "Track adoption metrics weekly during first 90 days with specific intervention thresholds",
            "Establish office hours and dedicated Slack/Teams channel for real-time user support",
            "Create compelling quick-win demonstrations showing specific time savings within first two weeks",
            "Set a firm date for legacy tool decommissioning to create a forcing function for transition",
          ],
          earlyWarnings: ["Active user login rate below 50% in first 30 days", "Discovery of parallel spreadsheet processes duplicating Anaplan functionality", "Increasing support ticket volume after initial training period"],
        },
        {
          risk: "Key person dependency on implementation team",
          description: "Critical knowledge about model architecture, formula logic, and business rules becomes concentrated in one or two implementation consultants, creating risk when those individuals transition off the project",
          probability: "high" as const,
          impact: "medium" as const,
          mitigations: [
            "Pair implementation consultants with designated client model admins from sprint 1 — no solo knowledge holders",
            "Require documentation of every model design decision in the functional design document with rationale",
            "Conduct knowledge transfer sessions at each phase gate, not just at go-live",
            "Record model walkthrough videos explaining architecture, data flows, and key formulas",
            "Build a comprehensive admin run book with step-by-step procedures for all recurring operations",
          ],
          earlyWarnings: ["Client team unable to answer basic model questions during UAT", "Documentation lagging behind model construction by more than 1 sprint", "Single consultant attending all design review sessions with no client counterpart"],
        },
      ],
      dataRelated: [
        {
          risk: "Source data quality issues",
          description: "Planning model accuracy is directly dependent on the quality of data from source systems. Incomplete, inconsistent, or incorrect data from ERP, CRM, or HCM systems will produce unreliable planning outputs and erode user trust",
          probability: "high" as const,
          impact: "high" as const,
          mitigations: [
            "Conduct data quality assessment during discovery phase — profile source data for completeness, consistency, and accuracy before model design begins",
            "Build data validation staging modules in Anaplan that check for nulls, duplicates, out-of-range values, and referential integrity before data enters calculation modules",
            "Implement automated data quality scorecards visible to both admin team and business users",
            "Establish data ownership and escalation procedures — each source system should have a named data steward accountable for quality",
            "Design graceful error handling — models should produce warnings rather than break when encountering bad data",
          ],
          earlyWarnings: ["Data validation failure rate exceeding 5% during initial test loads", "Mismatched hierarchies between source systems and Anaplan dimension lists", "Business users questioning output accuracy based on data inconsistencies they can identify"],
        },
        {
          risk: "Master data misalignment across systems",
          description: "Different source systems may use different codes, hierarchies, and naming conventions for the same business entities (cost centers, products, regions), causing join failures and aggregation errors in Anaplan",
          probability: "medium" as const,
          impact: "high" as const,
          mitigations: [
            "Build a master data mapping module in Anaplan (or data hub) that translates between source system codes and Anaplan canonical dimensions",
            "Conduct cross-system master data reconciliation during design phase to identify and resolve discrepancies before build",
            "Establish a master data governance process with clear ownership for adding, modifying, and retiring dimension members",
            "Automate hierarchy imports from the authoritative source system rather than maintaining hierarchies manually in Anaplan",
            "Design exception handling for orphan records that do not map to any Anaplan dimension member",
          ],
          earlyWarnings: ["Import error logs showing unmapped dimension members", "Consolidation totals not matching source system totals", "Increasing volume of manual data corrections by admin team"],
        },
      ],
      scopeAndTimeline: [
        {
          risk: "Scope creep during build phase",
          description: "Stakeholders who did not engage during discovery and design phases surface new requirements during the build phase, leading to unplanned model changes, timeline extensions, and budget overruns",
          probability: "high" as const,
          impact: "medium" as const,
          mitigations: [
            "Freeze functional requirements at design phase gate with formal sign-off from all stakeholder groups",
            "Establish a change request process with impact assessment (timeline, cost, risk) for any post-design requirements",
            "Maintain a prioritized enhancement backlog for post-go-live Phase 2 — acknowledge requests without derailing Phase 1",
            "Conduct stakeholder review sessions at every phase gate to surface missing requirements early",
            "Include 10-15% timeline buffer in project plan for anticipated scope adjustments",
          ],
          earlyWarnings: ["More than 3 change requests submitted during build phase", "Stakeholders who skipped design workshops requesting changes", "Build velocity declining due to rework of previously completed modules"],
        },
        {
          risk: "Underestimated integration complexity",
          description: "Integration effort is frequently underestimated during scoping, particularly for legacy ERP systems with custom fields, non-standard APIs, and restrictive security policies that only become apparent during build",
          probability: "high" as const,
          impact: "medium" as const,
          mitigations: [
            "Conduct integration proof-of-concept for each critical source system during design phase — do not assume APIs work as documented",
            "Engage source system technical owners early to review firewall rules, API access, credential provisioning, and data extraction methods",
            "Include integration testing as a separate tracked workstream with dedicated time allocation, not as part of general model testing",
            "Budget for at least one integration iteration — first attempt rarely works perfectly due to data format, encoding, or mapping surprises",
            "Document all integration assumptions explicitly in the project charter and validate each one during design",
          ],
          earlyWarnings: ["Source system team delays in providing API credentials or test environment access", "Integration POC requiring more than 2 iterations to achieve clean data load", "Discovery of custom fields or non-standard data formats not identified during scoping"],
        },
      ],
    },
  },
} as const;

// ---------------------------------------------------------------------------
// Derived TypeScript Types
// ---------------------------------------------------------------------------

export type AnaplanModule = keyof typeof ANAPLAN_KB.platform.modules;
export type MethodologyPhase = typeof ANAPLAN_KB.methodology.anaplanWay.phases[number]['name'];
export type IndustryKey = keyof typeof ANAPLAN_KB.metrics.roi.byIndustry;
export type RiskProbability = 'low' | 'medium' | 'high';
export type RiskImpact = 'low' | 'medium' | 'high' | 'critical';
export type Complexity = 'standard' | 'complex' | 'enterprise';

// ---------------------------------------------------------------------------
// EyeOn Company Profile
// ---------------------------------------------------------------------------

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
    description: "EyeOn's proprietary Engagement Tracking & Optimization platform for managing Anaplan implementation projects with real-time progress tracking, risk monitoring, and resource optimization",
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

// ---------------------------------------------------------------------------
// KB Match Interface & Helper
// ---------------------------------------------------------------------------

export interface KBMatch {
  title: string;
  source: 'Built-in KB' | 'Company Profile' | 'User Docs';
  score: number;
  snippet: string;
  category: string;
}

/** Find top-N knowledge base entries relevant to a question */
export function findRelevantKB(questionText: string, topN = 3): KBMatch[] {
  const text = questionText.toLowerCase();
  const matches: KBMatch[] = [];

  // Check module keywords
  const moduleEntries = Object.entries(ANAPLAN_KB.moduleKeywords) as [AnaplanModule, readonly string[]][];
  for (const [moduleKey, keywords] of moduleEntries) {
    const mod = ANAPLAN_KB.platform.modules[moduleKey];
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) {
        score += kw.includes(' ') ? 15 : 10; // multi-word keywords score higher
      }
    }
    if (score > 0) {
      matches.push({
        title: mod.name,
        source: 'Built-in KB' as const,
        score: Math.min(score, 100),
        snippet: mod.capabilities[0].substring(0, 120) + '...',
        category: moduleKey,
      });
    }
  }

  // Check methodology keywords
  const methodKeywords = ['methodology', 'anaplan way', 'implementation', 'phases', 'cornerstones', 'plans standard', 'deployment'];
  let methodScore = 0;
  for (const kw of methodKeywords) {
    if (text.includes(kw)) methodScore += 12;
  }
  if (methodScore > 0) {
    matches.push({
      title: 'Anaplan Way Methodology',
      source: 'Built-in KB' as const,
      score: Math.min(methodScore, 100),
      snippet: 'Structured implementation methodology: Discovery -> Design -> Build -> Test -> Deploy -> Hypercare',
      category: 'methodology',
    });
  }

  // Check compliance keywords
  const complianceMap: Record<string, string> = {
    'soc 2': 'SOC 2 Type II', 'gdpr': 'GDPR', 'hipaa': 'HIPAA',
    'iso 27001': 'ISO 27001', 'security': 'Anaplan Security Architecture',
    'data protection': 'GDPR Data Processing', 'compliance': 'Compliance Framework',
  };
  for (const [kw, title] of Object.entries(complianceMap)) {
    if (text.includes(kw)) {
      const config = kw === 'soc 2' ? ANAPLAN_KB.configurations.compliance.soc2
        : kw === 'gdpr' || kw === 'data protection' ? ANAPLAN_KB.configurations.compliance.gdpr
        : kw === 'hipaa' ? ANAPLAN_KB.configurations.compliance.hipaa
        : ANAPLAN_KB.configurations.compliance.iso27001;
      matches.push({
        title,
        source: 'Built-in KB' as const,
        score: 85,
        snippet: config.relevance.substring(0, 120) + '...',
        category: 'compliance',
      });
    }
  }

  // Check platform capabilities (CloudWorks, Polaris, PlanIQ)
  const platformKeywords: Record<string, readonly string[]> = {
    cloudworks: ['cloudworks', 'integration', 'connector', 'etl', 'data flow', 'api', 'orchestration', 'middleware', 'data sync', 'import export'],
    polaris: ['polaris', 'new ux', 'hyperscale', 'next generation', 'performance', 'scalability', 'billion cells', 'large model'],
    planIQ: ['planiq', 'machine learning', 'ml', 'predictive', 'forecasting algorithm', 'demand sensing', 'ai forecast', 'statistical forecast'],
  };
  for (const [capKey, keywords] of Object.entries(platformKeywords)) {
    let capScore = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) capScore += kw.includes(' ') ? 15 : 10;
    }
    if (capScore > 0) {
      const cap = ANAPLAN_KB.platformCapabilities[capKey as keyof typeof ANAPLAN_KB.platformCapabilities];
      matches.push({
        title: cap.name,
        source: 'Built-in KB' as const,
        score: Math.min(capScore, 100),
        snippet: cap.description.substring(0, 120) + '...',
        category: 'platform',
      });
    }
  }

  // Check competitive keywords
  if (text.includes('big 4') || text.includes('deloitte') || text.includes('accenture') || text.includes('kpmg') || text.includes('ey ') || text.includes('pwc')) {
    matches.push({
      title: 'Competitive Positioning vs Big 4',
      source: 'Company Profile' as const,
      score: 90,
      snippet: ANAPLAN_KB.competitive.vsBig4.messaging[0].substring(0, 120) + '...',
      category: 'competitive',
    });
  }

  // Check EyeOn keywords
  if (text.includes('team') || text.includes('experience') || text.includes('qualification') || text.includes('partner') || text.includes('about') || text.includes('who')) {
    matches.push({
      title: 'EyeOn Company Profile',
      source: 'Company Profile' as const,
      score: 82,
      snippet: `${EYEON_PROFILE.name}: ${EYEON_PROFILE.specialization}. ${EYEON_PROFILE.teamSize}, ${EYEON_PROFILE.anaplanPartnerTier}.`,
      category: 'company',
    });
  }

  // Sort by score descending, take topN
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}
