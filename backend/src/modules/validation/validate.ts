import type { Product } from "../../db/schema/products";
import { allRules, type RuleResult } from "./rules";

export type IssueOutput = NonNullable<RuleResult>;

export function runAllRules(
  product: Product,
  allSkuIds: string[]
): IssueOutput[] {
  return allRules
    .map(r => r(product, allSkuIds))
    .filter((x): x is IssueOutput => x !== null);
}
