import { Column, Data, Summary, SummaryColumnContents, SummaryValues } from './types';
import { observable } from '../helper/observable';
import { OptSummaryData } from '../types';
import {
  castToSummaryColumnContent,
  createSummaryValue,
  extractSummaryColumnContent
} from '../helper/summary';

interface SummaryOption {
  column: Column;
  data: Data;
  summary: OptSummaryData;
}

export function create({ column, data, summary }: SummaryOption): Summary {
  let summaryColumnContents: SummaryColumnContents = {};
  let summaryValues: SummaryValues = {};
  const { columnContent: orgColumnContent, defaultContent } = summary;

  if (Object.keys(summary).length) {
    const castedDefaultContent = castToSummaryColumnContent(defaultContent || '');
    const columnContent = orgColumnContent || {};
    const { rawData } = data;

    column.allColumns.forEach(({ name }) => {
      const castedColumnContent = castToSummaryColumnContent(columnContent[name]);
      const content = extractSummaryColumnContent(castedColumnContent, castedDefaultContent);

      summaryColumnContents[name] = content;
      summaryValues[name] = createSummaryValue(content, name, rawData);
    });
    summaryColumnContents = observable(summaryColumnContents);
    summaryValues = observable(summaryValues);
  }

  return { summaryColumnContents, summaryValues, defaultContent };
}
