import { Store, SummaryColumnContentMap, Row } from '../store/types';
import { castToSummaryColumnContent, extractSummaryColumnContent } from '../helper/summary';
import { isEmpty, findProp, isFunction } from '../helper/common';
import { createSummaryValue } from '../store/summary';
import { Options, UpdateType } from './types';

export function setSummaryColumnContent(
  { summary, data }: Store,
  columnName: string,
  columnContent: string | SummaryColumnContentMap
) {
  const castedColumnContent = castToSummaryColumnContent(columnContent);
  const content = extractSummaryColumnContent(castedColumnContent, null);

  summary.summaryColumnContents[columnName] = content;
  summary.summaryValues[columnName] = createSummaryValue(content, columnName, data);
}

function updateSummaryValue(
  { summary, data }: Store,
  columnName: string,
  type: UpdateType,
  options: Options
) {
  const content = summary.summaryColumnContents[columnName];

  if (!content || !content.useAutoSummary) {
    return;
  }

  const summaryValue = summary.summaryValues[columnName];
  const orgValue = Number(options.orgValue) || 0;
  const value = Number(options.value) || 0;
  const cntVariation = options.type === 'APPEND' ? 1 : -1;

  const columnFilter = findProp('columnName', columnName, data.filters || []);
  const hasColumnFilter = !!(columnFilter && isFunction(columnFilter.conditionFn));
  const included = hasColumnFilter && columnFilter!.conditionFn!(value);
  let { sum, min, max, cnt } = summaryValue;
  let {
    sum: filteredSum,
    min: filteredMin,
    max: filteredMax,
    cnt: filteredCnt
  } = summaryValue.filtered;

  switch (type) {
    case 'UPDATE_COLUMN':
      sum = value * cnt;
      min = value;
      max = value;

      if (hasColumnFilter) {
        filteredCnt = included ? filteredCnt : 0;
        filteredSum = included ? value * filteredCnt : 0;
        filteredMin = included ? value : 0;
        filteredMax = included ? value : 0;
      }
      break;
    case 'UPDATE_CELL':
      sum = sum - orgValue + value;

      if (hasColumnFilter) {
        const orgIncluded = columnFilter!.conditionFn!(orgValue);
        if (!orgIncluded && included) {
          filteredSum = filteredSum + value;
          filteredCnt += 1;
        } else if (orgIncluded && !included) {
          filteredSum = filteredSum - orgValue;
          filteredCnt -= 1;
        } else if (orgIncluded && included) {
          filteredSum = filteredSum - orgValue + value;
        }
      }
      break;
    case 'UPDATE_ROW':
      cnt += cntVariation;
      sum = sum + cntVariation * value;

      if (hasColumnFilter && included) {
        filteredSum = filteredSum + cntVariation * value;
        filteredCnt += cntVariation;
      }
      break;
    default:
    // do nothing;
  }

  const avg = sum / cnt;
  const filteredAvg = filteredSum / filteredCnt;

  min = Math.min(value, min);
  max = Math.max(value, max);
  filteredMin = Math.min(value, filteredMin);
  filteredMax = Math.max(value, filteredMax);

  summary.summaryValues[columnName] = {
    sum,
    min,
    max,
    avg,
    cnt,
    filtered: {
      sum: filteredSum,
      min: filteredMin,
      max: filteredMax,
      avg: filteredAvg,
      cnt: filteredCnt
    }
  };
}

export function updateSummaryValueByCell(store: Store, columnName: string, options: Options) {
  updateSummaryValue(store, columnName, 'UPDATE_CELL', options);
}

export function updateSummaryValueByColumn(store: Store, columnName: string, options: Options) {
  updateSummaryValue(store, columnName, 'UPDATE_COLUMN', options);
}

export function updateSummaryValueByRow(
  store: Store,
  row: Row,
  options: Options & { orgRow?: Row }
) {
  const { summary, column } = store;
  const { type, orgRow } = options;
  const summaryColumns = column.allColumns.filter(
    ({ name }) => !!summary.summaryColumnContents[name]
  );
  summaryColumns.forEach(({ name }) => {
    if (type === 'SET') {
      updateSummaryValue(store, name, 'UPDATE_CELL', { orgValue: orgRow![name], value: row[name] });
    } else {
      updateSummaryValue(store, name, 'UPDATE_ROW', { type, value: row[name] });
    }
  });
}

export function updateAllSummaryValues({ summary, data, column }: Store) {
  const summaryColumns = column.allColumns.filter(
    ({ name }) => !!summary.summaryColumnContents[name]
  );
  summaryColumns.forEach(({ name }) => {
    const content = summary.summaryColumnContents[name];
    summary.summaryValues[name] = createSummaryValue(content, name, data);
  });
}

export function addColumnSummaryValues({ summary, data, column }: Store) {
  if (!isEmpty(summary)) {
    const { defaultContent } = summary;
    const castedDefaultContent = castToSummaryColumnContent(defaultContent || '');

    column.allColumns.forEach(({ name }) => {
      const orgSummaryContent = summary.summaryColumnContents[name];
      let content = orgSummaryContent;
      if (!orgSummaryContent) {
        content = extractSummaryColumnContent(null, castedDefaultContent);
        summary.summaryColumnContents[name] = content;
      }
      summary.summaryValues[name] = createSummaryValue(content, name, data);
    });
  }
}
