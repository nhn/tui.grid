import {
  Summary,
  SummaryColumnContent,
  SummaryColumnContents,
  SummaryColumnContentMap,
  Column
} from './types';
import { reactive, Reactive } from '../helper/reactive';
import { OptSummaryData } from '../types';

type ColumnContentType = string | SummaryColumnContentMap | null | undefined;

interface SummaryOption {
  column: Column;
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

export function castToSummaryColumnContent(content: ColumnContentType): SummaryColumnContent {
  let casted = null;
  if (!content) return casted;

  switch (typeof content) {
    case 'string':
      casted = { template: content, useAutoSummary: false };
      break;
    case 'object':
      casted = {
        template: content.template,
        useAutoSummary:
          typeof content.useAutoSummary === 'undefined' ? true : content.useAutoSummary
      };
      break;
    default:
      break;
  }

  return casted;
}

export function create({ column, summary }: SummaryOption): Reactive<Summary> {
  const { columnContent: orgColumnContent, defaultContent: orgDefaultContent } = summary;
  const castedDefaultContent = castToSummaryColumnContent(orgDefaultContent || '');

  const columnContent = orgColumnContent || {};
  let summaryCulumnContents = column.allColumns.reduce((memo: SummaryColumnContents, { name }) => {
    const castedColumnContent = castToSummaryColumnContent(columnContent[name]);
    memo[name] = extractSummaryColumnContent(castedColumnContent, castedDefaultContent);
    return memo;
  }, {}) as SummaryColumnContents;

  summaryCulumnContents = reactive(summaryCulumnContents);

  return reactive<Summary>({ summaryCulumnContents });
}
