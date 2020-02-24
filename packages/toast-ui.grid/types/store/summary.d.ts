import { Dictionary } from '../options';

export type SummaryPosition = 'top' | 'bottom';
export type SummaryColumnContent = SummaryColumnContentMap | null;
export type SummaryColumnContents = Dictionary<SummaryColumnContent>;
export type SummaryValues = Dictionary<SummaryValueMap>;
export type SummaryTemplateFn = (valueMap: SummaryValueMap) => string;

export interface SummaryValueMap {
  sum: number;
  avg: number;
  min: number;
  max: number;
  cnt: number;
  filtered: {
    sum: number;
    avg: number;
    min: number;
    max: number;
    cnt: number;
  };
}

export interface SummaryColumnContentMap {
  useAutoSummary?: boolean;
  template?: string | SummaryTemplateFn;
}

export interface SummaryColumnContentMapOnlyFn extends SummaryColumnContentMap {
  template?: SummaryTemplateFn;
}

export interface Summary {
  summaryColumnContents: SummaryColumnContents;
  summaryValues: SummaryValues;
  defaultContent?: string | SummaryColumnContentMapOnlyFn;
}
