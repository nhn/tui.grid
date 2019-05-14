import {
  CellValue,
  Column,
  Data,
  Summary,
  SummaryColumnContent,
  SummaryColumnContents,
  SummaryColumnContentMap,
  SummaryValue,
  SummaryValues,
  Dictionary
} from './types';
import { reactive, watch } from '../helper/reactive';
import { OptSummaryData } from '../types';
import { calculate } from '../helper/summary';

type ColumnContentType = string | SummaryColumnContentMap;

interface SummaryOption {
  column: Column;
  data: Data;
  summary: OptSummaryData;
}

export function extractSummaryColumnContent(
  content: SummaryColumnContent,
  defaultContent: SummaryColumnContent
) {
  let summaryColumnContent: SummaryColumnContent = null;

  if (content) {
    summaryColumnContent = content;
  } else if (!content && defaultContent) {
    summaryColumnContent = defaultContent;
  }
  return summaryColumnContent;
}

export function castToSummaryColumnContent(content?: ColumnContentType): SummaryColumnContent {
  if (!content) {
    return null;
  }

  return typeof content === 'string'
    ? { template: content, useAutoSummary: false }
    : {
        template: content.template,
        useAutoSummary:
          typeof content.useAutoSummary === 'undefined' ? true : content.useAutoSummary
      };
}

export function createSummaryValue(
  content: SummaryColumnContentMap | null,
  columnValues: CellValue[]
): SummaryValue {
  const initSummaryMap = { sum: 0, min: 0, max: 0, avg: 0, cnt: 0 };

  return content && content.useAutoSummary ? calculate(columnValues) : initSummaryMap;
}

export function create({ column, data, summary }: SummaryOption): Summary {
  let summaryColumnContents: SummaryColumnContents = {};
  let summaryValues: SummaryValues = {};

  if (Object.keys(summary).length) {
    const { rawData } = data;
    const { columnContent: orgColumnContent, defaultContent: orgDefaultContent } = summary;
    const castedDefaultContent = castToSummaryColumnContent(orgDefaultContent || '');
    const columnContent = orgColumnContent || {};

    column.allColumns.forEach(({ name }) => {
      watch(() => {
        const columnValues = rawData.map((row) => row[name]);
        const castedColumnContent = castToSummaryColumnContent(columnContent[name]);
        const content = extractSummaryColumnContent(castedColumnContent, castedDefaultContent);

        summaryColumnContents[name] = content;
        summaryValues[name] = createSummaryValue(content, columnValues);
      });
    });
    summaryColumnContents = reactive(summaryColumnContents);
    summaryValues = reactive(summaryValues);
  }

  return { summaryColumnContents, summaryValues };
}
