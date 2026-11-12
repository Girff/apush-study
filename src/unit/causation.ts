/** Causation web: nodes, cause → effect links and expert chains. */
export interface CauseNode {
  id: string;
  label: string;
  year: number;
  theme: 'politics' | 'economy' | 'culture';
  /** Term references (exact names; "4.4:Name" for a specific topic). */
  terms: string[];
}

export const CAUSE_NODES: CauseNode[] = [];
