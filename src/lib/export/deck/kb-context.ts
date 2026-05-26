/**
 * KB Context Builder for Deck Generation
 *
 * Builds structured, markdown-formatted knowledge base context strings
 * for injection into Claude prompts during outline and content generation.
 * Keeps output budgeted so the prompt stays within token limits.
 */

import { ANAPLAN_KB, EYEON_PROFILE } from '../../../data/knowledge-base';
import type { DeckRequest, DeckOutline, PatternType } from './types';

/* ── Module Name Mapping ───────────────────────────────────────── */

type KBModuleKey = keyof typeof ANAPLAN_KB.platform.modules;

/**
 * Maps common user-facing module names to KB keys.
 * Matching is case-insensitive and substring-based.
 */
const MODULE_ALIASES: Array<{ patterns: string[]; key: KBModuleKey }> = [
  {
    patterns: [
      'fp&a', 'fpa', 'financial planning', 'finance', 'budgeting',
      'forecasting', 'consolidation', 'p&l', 'revenue planning',
      'cash flow', 'balance sheet', 'cost allocation',
    ],
    key: 'fpa',
  },
  {
    patterns: [
      'supply chain', 'demand planning', 'demand', 's&op', 'inventory',
      'logistics', 'procurement', 'supply planning', 'scp',
      'demand sensing', 'production planning',
    ],
    key: 'supplyChain',
  },
  {
    patterns: [
      'sales performance', 'spm', 'commission', 'incentive compensation',
      'comp plan', 'sales comp', 'icm', 'variable pay',
    ],
    key: 'salesPerformance',
  },
  {
    patterns: [
      'workforce', 'headcount', 'people planning', 'hr planning',
      'wfp', 'labor planning', 'talent planning',
    ],
    key: 'workforce',
  },
  {
    patterns: [
      'territory', 'quota', 'tqp', 'territory planning',
      'quota planning', 'sales territory', 'coverage planning',
    ],
    key: 'territoryQuota',
  },
  {
    patterns: [
      'connected planning', 'custom', 'cross-functional',
      'data hub', 'multi-model', 'orchestration',
    ],
    key: 'custom',
  },
];

/**
 * Fuzzy-match a user-supplied module name to a KB key.
 * Returns undefined if no match is found.
 */
function resolveModuleKey(name: string): KBModuleKey | undefined {
  const lower = name.toLowerCase().trim();
  for (const alias of MODULE_ALIASES) {
    for (const pattern of alias.patterns) {
      if (lower.includes(pattern) || pattern.includes(lower)) {
        return alias.key;
      }
    }
  }
  return undefined;
}

/**
 * Resolve all requested modules to unique KB keys.
 * Falls back to ['fpa'] if nothing matches.
 */
function resolveModules(modules?: string[]): KBModuleKey[] {
  if (!modules || modules.length === 0) return ['fpa'];
  const keys = new Set<KBModuleKey>();
  for (const m of modules) {
    const key = resolveModuleKey(m);
    if (key) keys.add(key);
  }
  return keys.size > 0 ? Array.from(keys) : ['fpa'];
}

/* ── Industry Mapping ──────────────────────────────────────────── */

type IndustryMetricsKey = keyof typeof ANAPLAN_KB.industryMetrics;

const INDUSTRY_ALIASES: Record<string, IndustryMetricsKey> = {
  manufacturing: 'manufacturing',
  industrial: 'manufacturing',
  automotive: 'manufacturing',
  'financial services': 'financialServices',
  banking: 'financialServices',
  insurance: 'financialServices',
  fintech: 'financialServices',
  healthcare: 'healthcare',
  pharma: 'healthcare',
  'life sciences': 'healthcare',
  hospital: 'healthcare',
  technology: 'technology',
  software: 'technology',
  saas: 'technology',
  tech: 'technology',
  retail: 'retail',
  ecommerce: 'retail',
  'e-commerce': 'retail',
  cpg: 'retail',
  fmcg: 'retail',
  'consumer goods': 'retail',
  energy: 'energy',
  utilities: 'energy',
  oil: 'energy',
  gas: 'energy',
  mining: 'energy',
};

function resolveIndustry(industry: string): IndustryMetricsKey | undefined {
  const lower = industry.toLowerCase().trim();
  // Direct match first
  if (lower in INDUSTRY_ALIASES) return INDUSTRY_ALIASES[lower];
  // Substring match
  for (const [alias, key] of Object.entries(INDUSTRY_ALIASES)) {
    if (lower.includes(alias) || alias.includes(lower)) return key;
  }
  return undefined;
}

/* ── Helper: truncate an array of strings to fit a word budget ── */

function truncateLines(lines: readonly string[], maxWords: number): string[] {
  const result: string[] = [];
  let words = 0;
  for (const line of lines) {
    const lineWords = line.split(/\s+/).length;
    if (words + lineWords > maxWords) break;
    result.push(line);
    words += lineWords;
  }
  return result;
}

/* ── Main: buildKBContext (for outline phase) ───────────────────── */

/**
 * Build a comprehensive KB context string for the outline generation prompt.
 * Includes EyeOn profile, methodology, module details, industry metrics,
 * competitive positioning, accelerators, and platform capabilities.
 *
 * Target: ~3000 words / ~4000 tokens.
 */
export function buildKBContext(req: DeckRequest): string {
  const sections: string[] = [];
  const moduleKeys = resolveModules(req.modules);
  const industryKey = resolveIndustry(req.client.industry);

  // ── 1. EyeOn Profile ──────────────────────────────────────────
  sections.push(`## EyeOn Profile
- **Company:** ${EYEON_PROFILE.fullName} (${EYEON_PROFILE.headquarters}, est. ${EYEON_PROFILE.founded})
- **Specialization:** ${EYEON_PROFILE.specialization}
- **Partner Tier:** ${EYEON_PROFILE.anaplanPartnerTier}
- **Team:** ${EYEON_PROFILE.teamSize}
- **Certifications:** ${EYEON_PROFILE.certifications.join('; ')}
- **Key Clients:** ${EYEON_PROFILE.keyClients.join(', ')}
- **Differentiators:**
${EYEON_PROFILE.differentiators.map(d => `  - ${d}`).join('\n')}
- **ETO App:** ${EYEON_PROFILE.etoApp.description}
- **Methodology:** ${EYEON_PROFILE.methodology.name} — ${EYEON_PROFILE.methodology.phases.join(' > ')} (avg ${EYEON_PROFILE.methodology.avgDeliveryWeeks} weeks)`);

  // ── 2. Methodology Overview ───────────────────────────────────
  const phases = ANAPLAN_KB.methodology.anaplanWay.phases;
  sections.push(`## Anaplan Way Methodology
${phases.map(p => `- **${p.name}** (${p.durationRange.min}-${p.durationRange.max} weeks): ${p.description.substring(0, 120)}...`).join('\n')}

**Key Deliverables:** ${ANAPLAN_KB.methodology.anaplanWay.deliverables.slice(0, 8).join(', ')}
**Roles:** ${ANAPLAN_KB.methodology.anaplanWay.roles.join(', ')}

### Four Cornerstones
${Object.values(ANAPLAN_KB.methodology.fourCornerstones).map(c => `- **${c.name}:** ${c.description.substring(0, 100)}...`).join('\n')}`);

  // ── 3. Module Details ─────────────────────────────────────────
  for (const key of moduleKeys) {
    const mod = ANAPLAN_KB.platform.modules[key];
    const capabilities = truncateLines(mod.capabilities, 120);
    const metrics = mod.keyMetrics;
    const implPhases = mod.implementationPhases;

    sections.push(`## Module: ${mod.name} (${mod.shortName})
- **Duration:** ${mod.typicalDuration.min}-${mod.typicalDuration.max} ${mod.typicalDuration.unit}
- **Complexity:** ${mod.complexity}
- **Key Capabilities:**
${capabilities.map(c => `  - ${c.substring(0, 150)}`).join('\n')}
- **Key Metrics:**
${metrics.map(m => `  - ${m}`).join('\n')}
- **Implementation Phases:**
${implPhases.map(p => `  - ${p.name} (${p.durationWeeks}w): ${p.activities.join(', ')}`).join('\n')}
- **Common Integrations:** ${mod.commonIntegrations.join(', ')}`);

    // ROI metrics for this module
    const roiKey = key as keyof typeof ANAPLAN_KB.metrics.roi.byModule;
    const moduleRoi = ANAPLAN_KB.metrics.roi.byModule[roiKey];
    if (moduleRoi) {
      sections.push(`### ${mod.shortName} ROI Metrics
${moduleRoi.map(r => `- ${r}`).join('\n')}`);
    }
  }

  // ── 4. Industry Metrics ───────────────────────────────────────
  if (industryKey) {
    const industryMetrics = ANAPLAN_KB.industryMetrics[industryKey];
    sections.push(`## Industry Metrics: ${req.client.industry}
${industryMetrics.map(m => `- ${m}`).join('\n')}`);

    // Also include industry-specific ROI examples
    const roiIndustryKey = industryKey as keyof typeof ANAPLAN_KB.metrics.roi.byIndustry;
    const industryRoi = ANAPLAN_KB.metrics.roi.byIndustry[roiIndustryKey];
    if (industryRoi) {
      const truncated = truncateLines(industryRoi, 100);
      sections.push(`### ${req.client.industry} ROI Examples
${truncated.map(r => `- ${r}`).join('\n')}`);
    }
  }

  // ── 5. Competitive Positioning ────────────────────────────────
  const big4 = ANAPLAN_KB.competitive.vsBig4;
  const vsPartners = ANAPLAN_KB.competitive.vsOtherPartners;
  sections.push(`## Competitive Positioning
### vs Big 4
${big4.differentiators.slice(0, 4).map(d => `- **${d.point}:** ${d.detail.substring(0, 120)}...`).join('\n')}

### vs Other Anaplan Partners
${vsPartners.positioning.map(p => `- **${p.claim}:** ${p.evidence.substring(0, 120)}...`).join('\n')}
- **Proof Points:** ${vsPartners.proofPoints.join('; ')}`);

  // ── 6. Accelerators ───────────────────────────────────────────
  const acceleratorLines: string[] = [];
  for (const key of moduleKeys) {
    const accKey = key as keyof typeof ANAPLAN_KB.accelerators.byModule;
    const accelerators = ANAPLAN_KB.accelerators.byModule[accKey];
    if (accelerators) {
      for (const acc of accelerators.slice(0, 3)) {
        acceleratorLines.push(`- **${acc.name}** (${acc.timeReductionPercent}% time reduction): ${acc.description.substring(0, 100)}`);
      }
    }
  }
  if (acceleratorLines.length > 0) {
    sections.push(`## Pre-Built Accelerators
${acceleratorLines.join('\n')}`);
  }

  // ── 7. Platform Capabilities ──────────────────────────────────
  const cw = ANAPLAN_KB.platformCapabilities.cloudworks;
  const pol = ANAPLAN_KB.platformCapabilities.polaris;
  const piq = ANAPLAN_KB.platformCapabilities.planIQ;
  sections.push(`## Platform Capabilities
### ${cw.name}
${cw.description}
Key features: ${cw.features.slice(0, 4).join('; ')}

### ${pol.name}
${pol.description}
Key features: ${pol.features.slice(0, 4).join('; ')}

### ${piq.name}
${piq.description}
Use cases: ${piq.useCases.join('; ')}`);

  // ── Assemble & trim to budget ─────────────────────────────────
  let output = sections.join('\n\n');

  // Aggressive word budget — outline only needs structural knowledge.
  // Target: ~800 words max. Keeps prompt small so Haiku can respond
  // within 48s at 4096 max_tokens. Drop sections from the end until under budget.
  let words = output.split(/\s+/).length;
  while (words > 800 && sections.length > 2) {
    sections.pop();
    output = sections.join('\n\n');
    words = output.split(/\s+/).length;
  }

  return output;
}

/* ── Lean: buildKBContextForContent (for content phase) ────────── */

/**
 * Build a focused KB context string for the content generation prompt.
 * Uses the outline to select only the data needed for the chosen patterns.
 *
 * Target: ~1500 words / ~2000 tokens.
 */
export function buildKBContextForContent(
  req: DeckRequest,
  outline: DeckOutline,
): string {
  const sections: string[] = [];
  const moduleKeys = resolveModules(req.modules);
  const industryKey = resolveIndustry(req.client.industry);

  // Collect which patterns the outline uses
  const usedPatterns = new Set<PatternType>();
  for (const section of outline.sections) {
    for (const slide of section.slides) {
      usedPatterns.add(slide.pattern);
    }
  }

  // ── 1. Module-specific details for content ────────────────────
  for (const key of moduleKeys) {
    const mod = ANAPLAN_KB.platform.modules[key];
    // Include capabilities (truncated) and implementation phases
    sections.push(`## ${mod.name} (${mod.shortName})
- **Duration:** ${mod.typicalDuration.min}-${mod.typicalDuration.max} ${mod.typicalDuration.unit}
- **Capabilities:** ${mod.capabilities.slice(0, 5).map(c => c.substring(0, 100)).join(' | ')}
- **Phases:** ${mod.implementationPhases.map(p => `${p.name} (${p.durationWeeks}w)`).join(' > ')}
- **Integrations:** ${mod.commonIntegrations.join(', ')}`);
  }

  // ── 2. Metrics for metrics-dashboard and content-cards ────────
  if (usedPatterns.has('metrics-dashboard') || usedPatterns.has('content-cards')) {
    const metricLines: string[] = [];

    for (const key of moduleKeys) {
      const roiKey = key as keyof typeof ANAPLAN_KB.metrics.roi.byModule;
      const moduleRoi = ANAPLAN_KB.metrics.roi.byModule[roiKey];
      if (moduleRoi) {
        metricLines.push(...moduleRoi.map(r => `- ${r}`));
      }
    }

    if (industryKey) {
      const industryMetrics = ANAPLAN_KB.industryMetrics[industryKey];
      metricLines.push(...industryMetrics.map(m => `- ${m}`));
    }

    if (metricLines.length > 0) {
      sections.push(`## Metrics & ROI Data
${truncateLines(metricLines, 200).join('\n')}`);
    }
  }

  // ── 3. Competitive data for comparison-matrix ─────────────────
  if (usedPatterns.has('comparison-matrix')) {
    const big4 = ANAPLAN_KB.competitive.vsBig4;
    const vsPartners = ANAPLAN_KB.competitive.vsOtherPartners;
    sections.push(`## Competitive Data
### EyeOn vs Big 4
${big4.differentiators.slice(0, 4).map(d => `- **${d.point}:** ${d.detail.substring(0, 100)}`).join('\n')}

### EyeOn vs Other Partners
${vsPartners.positioning.map(p => `- **${p.claim}:** ${p.evidence.substring(0, 100)}`).join('\n')}
- **Proof Points:** ${vsPartners.proofPoints.join('; ')}`);
  }

  // ── 4. Accelerators (brief) ───────────────────────────────────
  if (usedPatterns.has('content-cards') || usedPatterns.has('gated-flow')) {
    const accLines: string[] = [];
    for (const key of moduleKeys) {
      const accKey = key as keyof typeof ANAPLAN_KB.accelerators.byModule;
      const accelerators = ANAPLAN_KB.accelerators.byModule[accKey];
      if (accelerators) {
        for (const acc of accelerators.slice(0, 2)) {
          accLines.push(`- **${acc.name}** (${acc.timeReductionPercent}% faster): ${acc.description.substring(0, 80)}`);
        }
      }
    }
    if (accLines.length > 0) {
      sections.push(`## Accelerators
${accLines.join('\n')}`);
    }
  }

  // ── 5. EyeOn quick reference ──────────────────────────────────
  sections.push(`## EyeOn Quick Reference
- ${EYEON_PROFILE.anaplanPartnerTier} | ${EYEON_PROFILE.teamSize}
- Methodology: ${EYEON_PROFILE.methodology.name} (${EYEON_PROFILE.methodology.phases.join(' > ')})
- Key Clients: ${EYEON_PROFILE.keyClients.slice(0, 5).join(', ')}
- Differentiators: ${EYEON_PROFILE.differentiators.slice(0, 3).join('; ')}`);

  return sections.join('\n\n');
}
