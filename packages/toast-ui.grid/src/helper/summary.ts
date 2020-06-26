import { Row, CellValue } from '@t/store/data';
import { SummaryColumnContentMap, SummaryColumnContent } from '@t/store/summary';

type ColumnContentType = string | SummaryColumnContentMap;

interface SummaryValue {
  sum: number;
  avg: number;
  min: number;
  max: number;
  cnt: number;
}

function assignFilteredSummaryValue(summaryValue: SummaryValue) {
  const { sum, min, max, avg, cnt } = summaryValue;
  return {
    filtered: {
      sum,
      min,
      max,
      avg,
      cnt,
    },
  };
}

export function getSummaryValue(columnName: string, rawData: Row[], filteredRawData: Row[]) {
  const columnValues = rawData.map((row) => row[columnName]);
  const summaryValue = calculate(columnValues);

  if (rawData.length === filteredRawData.length) {
    return { ...summaryValue, ...assignFilteredSummaryValue(summaryValue) };
  }

  const filteredColumnValues = filteredRawData.map((row) => row[columnName]);
  return { ...summaryValue, ...assignFilteredSummaryValue(calculate(filteredColumnValues)) };
}

export function calculate(values: CellValue[]) {
  const cnt = values.length;
  let min = Number.MAX_VALUE;
  let max = Number.MIN_VALUE;
  let sum = 0;
  let avg = 0;

  for (let i = 0; i < cnt; i += 1) {
    let value = Number(values[i]);
    if (isNaN(value)) {
      value = 0;
    }

    sum += value;
    if (min > value) {
      min = value;
    }
    if (max < value) {
      max = value;
    }
  }

  if (!cnt) {
    max = min = avg = 0;
  } else {
    avg = sum / cnt;
  }

  return { sum, min, max, avg, cnt };
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
          typeof content.useAutoSummary === 'undefined' ? true : content.useAutoSummary,
      };
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
