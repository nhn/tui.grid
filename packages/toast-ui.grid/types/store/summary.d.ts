import { OptSummaryColumnContentMap, Dictionary } from '../options';

export type SummaryColumnContent = SummaryColumnContentMap | null;

export type SummaryColumnContents = Dictionary<SummaryColumnContent>;

export type SummaryValues = Dictionary<SummaryValueMap>;

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
  template?: string | ((valueMap: SummaryValueMap) => string);
}

export interface Summary {
  summaryColumnContents: SummaryColumnContents;
  summaryValues: SummaryValues;
  defaultContent?: string | OptSummaryColumnContentMap;
}
