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

function getFormattedValue(value: CellValue, fn?: Formatter, defValue?: string) {
  if (typeof fn === 'function') {
    return fn(value);
  }
  if (typeof fn === 'string') {
    return fn;
  }
  return defValue || '';
}

function createViewCell(value: CellValue, column: ColumnInfo): CellRenderData {
  const { formatter, prefix, postfix } = column;

  return {
    formattedValue: getFormattedValue(value, formatter, String(value)),
    prefix: getFormattedValue(value, prefix),
    postfix: getFormattedValue(value, postfix),
    value
  };
}

function createViewRow(row: Row, columnMap: Dictionary<ColumnInfo>) {
  const { rowKey } = row;
  const initValueMap: Dictionary<CellRenderData> = {};

  Object.keys(columnMap).forEach((name) => {
    initValueMap[name] = {
      formattedValue: '',
      prefix: '',
      postfix: '',
      value: ''
    };
  });

  const valueMap = reactive(initValueMap);

  Object.keys(columnMap).forEach((name) => {
    watch(() => {
      valueMap[name] = createViewCell(row[name], columnMap[name]);
    });
  });

  return { rowKey, valueMap };
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
