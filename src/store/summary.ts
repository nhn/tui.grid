import { Column, Data, Summary, SummaryColumnContents, SummaryValues } from './types';
import { observable, observe } from '../helper/observable';
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

  if (Object.keys(summary).length) {
    const { columnContent: orgColumnContent, defaultContent: orgDefaultContent } = summary;
    const castedDefaultContent = castToSummaryColumnContent(orgDefaultContent || '');
    const columnContent = orgColumnContent || {};

    column.allColumns.forEach(({ name }) => {
      observe(() => {
        const { rawData } = data;
        const columnValues = rawData.map(row => row[name]);
        const castedColumnContent = castToSummaryColumnContent(columnContent[name]);
        const content = extractSummaryColumnContent(castedColumnContent, castedDefaultContent);

        summaryColumnContents[name] = content;
        summaryValues[name] = createSummaryValue(content, columnValues);
      });
    });
    summaryColumnContents = observable(summaryColumnContents);
    summaryValues = observable(summaryValues);
  }

  return { summaryColumnContents, summaryValues };
}
