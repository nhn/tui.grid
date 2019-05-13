import {
  Data,
  Row,
  Dictionary,
  CellValue,
  Column,
  ColumnInfo,
  Formatter,
  CellRenderData
} from './types';
import { reactive, watch, Reactive } from '../helper/reactive';
import { OptRow } from '../types';

function getFormattedValue(value: CellValue, fn?: Formatter) {
  if (typeof fn === 'function') {
    return fn(value);
  }
  if (typeof value === 'number') {
    return String(value);
  }
  if (typeof value === 'string') {
    return value;
  }
  return '';
}

function createViewCell(value: CellValue, column: ColumnInfo): CellRenderData {
  const { formatter, prefix, postfix } = column;

  return {
    formattedValue: getFormattedValue(value, formatter),
    prefix: getFormattedValue(value, prefix),
    postfix: getFormattedValue(value, postfix),
    value
  };
}

function createViewRow(row: Row, columnMap: Dictionary<ColumnInfo>) {
  const viewRow: Dictionary<CellRenderData> = {};

  for (const key in row) {
    if (row.hasOwnProperty(key)) {
      watch(() => {
        viewRow[key] = createViewCell(row[key], columnMap[key]);
      });
    }
  }

  return reactive(viewRow);
}

export function create(data: OptRow[], column: Column): Reactive<Data> {
  const rawData = data.map((row, index) => {
    const rowKeyAdded = { rowKey: index, _number: index + 1, ...row };

    return reactive(rowKeyAdded as Row);
  });

  const viewData = rawData.map((row: Row) => createViewRow(row, column.allColumnMap));

  return reactive({
    rawData,
    viewData
  });
}
