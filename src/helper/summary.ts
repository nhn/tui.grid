import {
  CellValue,
  SummaryColumnContent,
  SummaryColumnContentMap,
  SummaryValue
} from '../store/types';

type ColumnContentType = string | SummaryColumnContentMap;

export function calculate(values: CellValue[]): SummaryValue {
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
