import { Store, SummaryColumnContentMap, Row } from '../store/types';
import { castToSummaryColumnContent, extractSummaryColumnContent } from '../helper/summary';
import { isEmpty } from '../helper/common';
import { createSummaryValue } from '../store/summary';
import { Options, UpdateType } from './types';

export function setSummaryColumnContent(
  { summary, data }: Store,
  columnName: string,
  columnContent: string | SummaryColumnContentMap
) {
  const { filteredRawData, pageRowRange } = data;
  const castedColumnContent = castToSummaryColumnContent(columnContent);
  const content = extractSummaryColumnContent(castedColumnContent, null);

  summary.summaryColumnContents[columnName] = content;
  summary.summaryValues[columnName] = createSummaryValue(
    content,
    columnName,
    filteredRawData,
    pageRowRange
  );
}

export function updateSummaryValue(
  { summary }: Store,
  columnName: string,
  type: UpdateType,
  options: Options
) {
  const content = summary.summaryColumnContents[columnName];

  if (content && content.useAutoSummary) {
    const summaryValue = summary.summaryValues[columnName];
    const prevValue = Number(options.prevValue) || 0;
    const value = Number(options.value) || 0;
    const cntVariation = options.appended ? 1 : -1;

    let { sum, min, max, cnt } = summaryValue;

    if (type === 'UPDATE_COLUMN') {
      sum = value * cnt;
      min = value;
      max = value;
    } else if (type === 'UPDATE_CELL') {
      sum = sum - prevValue + value;
    } else {
      cnt += cntVariation;
      sum = sum + cntVariation * value;
    }
    const avg = sum / cnt;
    min = Math.min(value, min);
    max = Math.max(value, max);

    summary.summaryValues[columnName] = { sum, avg, min, max, cnt };
  }
}

export function updateSummaryValueByCell(store: Store, columnName: string, options: Options) {
  updateSummaryValue(store, columnName, 'UPDATE_CELL', options);
}

export function updateSummaryValueByColumn(store: Store, columnName: string, options: Options) {
  updateSummaryValue(store, columnName, 'UPDATE_COLUMN', options);
}

export function updateSummaryValueByRow(store: Store, row: Row, appended: boolean) {
  const { summary, column } = store;
  const summaryColumns = column.allColumns.filter(
    ({ name }) => !!summary.summaryColumnContents[name]
  );
  summaryColumns.forEach(({ name }) => {
    updateSummaryValue(store, name, 'UPDATE_ROW', { value: row[name], appended });
  });
}

export function updateAllSummaryValues({ summary, data, column }: Store) {
  const { filteredRawData, pageRowRange } = data;
  const summaryColumns = column.allColumns.filter(
    ({ name }) => !!summary.summaryColumnContents[name]
  );
  summaryColumns.forEach(({ name }) => {
    summary.summaryValues[name] = createSummaryValue(
      summary.summaryColumnContents[name],
      name,
      filteredRawData,
      pageRowRange
    );
  });
}

export function addColumnSummaryValues({ summary, data, column }: Store) {
  if (!isEmpty(summary)) {
    const { defaultContent } = summary;
    const castedDefaultContent = castToSummaryColumnContent(defaultContent || '');
    const { filteredRawData, pageRowRange } = data;

    column.allColumns.forEach(({ name }) => {
      const orgSummaryContent = summary.summaryColumnContents[name];
      if (!orgSummaryContent) {
        const content = extractSummaryColumnContent(null, castedDefaultContent);
        summary.summaryColumnContents[name] = content;
        summary.summaryValues[name] = createSummaryValue(
          content,
          name,
          filteredRawData,
          pageRowRange
        );
      } else {
        summary.summaryValues[name] = createSummaryValue(
          orgSummaryContent,
          name,
          filteredRawData,
          pageRowRange
        );
      }
    });
  }
}
