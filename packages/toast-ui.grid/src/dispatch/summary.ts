import { Store } from '@t/store';
import { SummaryColumnContentMap } from '@t/store/summary';
import { Row } from '@t/store/data';
import { UpdateType, Options } from '@t/dispatch';
import { castToSummaryColumnContent, extractSummaryColumnContent } from '../helper/summary';
import { findProp, isFunction } from '../helper/common';
import { createSummaryValue } from '../store/summary';
import { notify } from '../helper/observable';

export function setSummaryColumnContent(
  { summary, data }: Store,
  columnName: string,
  columnContent: string | SummaryColumnContentMap
) {
  const castedColumnContent = castToSummaryColumnContent(columnContent);
  const content = extractSummaryColumnContent(castedColumnContent, null);

  summary.summaryColumnContents[columnName] = content;
  summary.summaryValues[columnName] = createSummaryValue(content, columnName, data);

  notify(summary, 'summaryValues');
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
    cnt: filteredCnt,
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

  const columnData = data.rawData.map((row: Row) => Number(row[columnName]));

  min = Math.min(value, ...columnData);
  max = Math.max(value, ...columnData);

  if (hasColumnFilter) {
    const filteredColumnData = data.filteredRawData.map((row) => Number(row[columnName]));

    filteredMin = Math.min(value, ...filteredColumnData);
    filteredMax = Math.max(value, ...filteredColumnData);
  }

  summary.summaryValues[columnName] = {
    sum,
    min,
    max,
    avg,
    cnt,
    filtered: hasColumnFilter
      ? {
          sum: filteredSum,
          min: filteredMin,
          max: filteredMax,
          avg: filteredAvg,
          cnt: filteredCnt,
        }
      : { sum, min, max, avg, cnt },
  };

  notify(summary, 'summaryValues');
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

  notify(summary, 'summaryValues');
}
