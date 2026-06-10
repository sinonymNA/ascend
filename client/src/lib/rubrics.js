// AP World History: Modern — 2025 rubric definitions for Summit Write.

export const RUBRICS = {
  DBQ: {
    maxScore: 7,
    label: 'Document-Based Question',
    criteria: {
      contextualization: {
        points: 1,
        label: 'Contextualization',
        description:
          'Accurately describes a broader historical context relevant to the prompt — events, developments, or processes before, during, or after the period. Goes beyond a mention: connects the context to the argument.',
      },
      thesis: {
        points: 1,
        label: 'Thesis',
        description:
          'Responds to the prompt with a historically defensible claim that establishes a line of reasoning. A restatement of the prompt does not earn the point.',
      },
      evidence_documents: {
        points: 3,
        label: 'Evidence from Documents',
        description:
          '1pt: accurately describes content of 3+ documents. 2pts: uses content of 6+ documents to support the argument. 3pts: explains how point of view, purpose, situation, or audience (HAPP) is relevant for 3+ documents.',
      },
      evidence_beyond: {
        points: 1,
        label: 'Evidence Beyond the Documents',
        description:
          'Uses at least one additional piece of specific historical evidence beyond those found in the documents.',
      },
      complexity: {
        points: 1,
        label: 'Complexity',
        description:
          'Demonstrates complex understanding — nuance, connections across periods or regions, or both similarity AND difference, continuity AND change, cause AND effect.',
      },
    },
  },
  LEQ: {
    maxScore: 6,
    label: 'Long Essay Question',
    criteria: {
      contextualization: { points: 1, label: 'Contextualization', description: 'Same standard as the DBQ: situate the prompt in broader historical context and tie it to your argument.' },
      thesis: { points: 1, label: 'Thesis', description: 'A historically defensible claim with a line of reasoning.' },
      evidence: { points: 2, label: 'Evidence', description: '1pt: at least two specific relevant examples. 2pts: uses that evidence to support the argument.' },
      reasoning: { points: 1, label: 'Historical Reasoning', description: 'Uses comparison, causation, or continuity/change to structure the argument.' },
      complexity: { points: 1, label: 'Complexity', description: 'Same standard as the DBQ.' },
    },
  },
  SAQ: {
    maxScore: 3,
    label: 'Short Answer Question',
    criteria: {
      part_a: { points: 1, label: 'Part A', description: 'Responds accurately and specifically to part (a).' },
      part_b: { points: 1, label: 'Part B', description: 'Responds accurately and specifically to part (b).' },
      part_c: { points: 1, label: 'Part C', description: 'Responds accurately and specifically to part (c).' },
    },
  },
};

export function calculateUnitGrade(dbqScore, dbqMax, mcqScore, dbqWeight) {
  const mcqWeight = 1 - dbqWeight;
  const dbqPercent = (dbqScore / dbqMax) * 100;
  return Math.round(dbqPercent * dbqWeight + mcqScore * mcqWeight);
}

export function dbqToPercent(score, max) {
  return Math.round((score / max) * 100);
}
