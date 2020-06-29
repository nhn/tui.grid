import { OptSummaryData } from '@t/options';
import { Column } from '@t/store/column';
import { Data } from '@t/store/data';
import {
  SummaryColumnContentMap,
  Summary,
  SummaryColumnContents,
  SummaryValues,
} from '@t/store/summary';
import { observable } from '../helper/observable';
import {
  castToSummaryColumnContent,
  extractSummaryColumnContent,
  getSummaryValue,
} from '../helper/summary';
import { someProp } from '../helper/common';

interface SummaryOption {
  column: Column;
  data: Data;
  summary: OptSummaryData;
}

export function createSummaryValue(
  content: SummaryColumnContentMap | null,
  columnName: string,
  data: Data
) {
  if (content && content.useAutoSummary) {
    return getSummaryValue(columnName, data.rawData, data.filteredRawData);
  }
  return {
    sum: 0,
    min: 0,
    max: 0,
    avg: 0,
    cnt: 0,
    filtered: {
      sum: 0,
      min: 0,
      max: 0,
      avg: 0,
      cnt: 0,
    },
  };
}

export function create({ column, data, summary }: SummaryOption) {
  const summaryColumnContents: SummaryColumnContents = {};
  const summaryValues: SummaryValues = {};
  const { columnContent: orgColumnContent, defaultContent } = summary;

  if (Object.keys(summary).length) {
    const castedDefaultContent = castToSummaryColumnContent(defaultContent || '');
    const columnContent = orgColumnContent || {};
    const summaryColumns = Object.keys(columnContent);
    const filteredSummaryColumns = summaryColumns.filter(
      (columnName) => !someProp('name', columnName, column.allColumns)
    );
    const targetColumns = castedDefaultContent
      ? column.allColumns.map(({ name }) => name).concat(filteredSummaryColumns)
      : summaryColumns;

    targetColumns.forEach((columnName) => {
      const castedColumnContent = castToSummaryColumnContent(columnContent[columnName]);
      const content = extractSummaryColumnContent(castedColumnContent, castedDefaultContent);

      summaryColumnContents[columnName] = content;
      summaryValues[columnName] = createSummaryValue(content, columnName, data);
    });
  }

  return observable<Summary>({ summaryColumnContents, summaryValues, defaultContent });
}
