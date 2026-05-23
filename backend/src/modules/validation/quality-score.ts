import type { IssueOutput } from "./validate";

const WEIGHTS = { HIGH: 20, MEDIUM: 10, LOW: 3 } as const;

export function computeQualityScore(issues: IssueOutput[]): number {
  const penalty = issues.reduce((sum, i) => sum + WEIGHTS[i.severity], 0);
  return Math.max(0, 100 - penalty);
}
