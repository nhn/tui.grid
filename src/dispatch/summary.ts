import { Store, SummaryColumnContentMap, CellValue, Row } from '../store/types';
import {
  castToSummaryColumnContent,
  createSummaryValue,
  extractSummaryColumnContent
} from '../helper/summary';

export function setSummaryColumnContent(
  { summary, data }: Store,
  columnName: string,
  columnContent: string | SummaryColumnContentMap
) {
  const { rawData } = data;
  const castedColumnContent = castToSummaryColumnContent(columnContent);
  const content = extractSummaryColumnContent(castedColumnContent, null);

  summary.summaryColumnContents[columnName] = content;
  summary.summaryValues[columnName] = createSummaryValue(content, columnName, rawData);
}

interface Options {
  prevValue?: CellValue;
  value?: CellValue;
  appended?: boolean;
}
type UpdateType = 'UPDATE_COLUMN' | 'UPDATE_CELL' | 'UPDATE_ROW';

export function updateSummaryValue(
  { summary }: Store,
  columnName: string,
  type: UpdateType,
  options: Options
) {
  const content = summary.summaryColumnContents[columnName];

  if (content && content.useAutoSummary) {
    const summaryValue = summary.summaryValues[columnName];
    const [numericPrevValue, numericValue] = [Number(options.prevValue), Number(options.value)];
    const prevValue = isNaN(numericPrevValue) ? 0 : numericPrevValue;
    const value = isNaN(numericValue) ? 0 : numericValue;
    const cntVariation = options.appended ? 1 : -1;

    let { sum, avg, min, max, cnt } = summaryValue;

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
    avg = sum / cnt;
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
  const { rawData } = data;
  const summaryColumns = column.allColumns.filter(
    ({ name }) => !!summary.summaryColumnContents[name]
  );
  summaryColumns.forEach(({ name }) => {
    summary.summaryValues[name] = createSummaryValue(
      summary.summaryColumnContents[name],
      name,
      rawData
    );
  });
}
