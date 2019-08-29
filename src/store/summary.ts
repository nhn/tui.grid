import { Column, Data, Summary, SummaryColumnContents, SummaryValues } from './types';
import { observable } from '../helper/observable';
import { OptSummaryData } from '../types';
import {
  castToSummaryColumnContent,
  createSummaryValue,
  extractSummaryColumnContent
} from '../helper/summary';
import { someProp } from '../helper/common';

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
    const summaryColumns = Object.keys(columnContent).filter(
      columnName => !someProp('name', columnName, column.allColumns)
    );
    const targetColumns = column.allColumns.map(col => col.name).concat(summaryColumns);

    targetColumns.forEach(columnName => {
      const castedColumnContent = castToSummaryColumnContent(columnContent[columnName]);
      const content = extractSummaryColumnContent(castedColumnContent, castedDefaultContent);

      summaryColumnContents[columnName] = content;
      summaryValues[columnName] = createSummaryValue(content, columnName, rawData);
    });

    summaryColumnContents = observable(summaryColumnContents);
    summaryValues = observable(summaryValues);
  }

  return { summaryColumnContents, summaryValues, defaultContent };
}
