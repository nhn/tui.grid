import { Column, Data, Summary, SummaryColumnContents, SummaryValues } from './types';
import { reactive, watch } from '../helper/reactive';
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
