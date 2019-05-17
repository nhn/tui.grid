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
import { someProp } from '../helper/common';
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

function getRelationCbResult(fn: any, relationParams: Dictionary<any>) {
  return typeof fn === 'function' ? fn(relationParams) : null;
}

function getEditable(fn: any, relationParams: Dictionary<any>) {
  const result = getRelationCbResult(fn, relationParams);
  return result === null ? true : result;
}

function getDisabled(fn: any, relationParams: Dictionary<any>) {
  const result = getRelationCbResult(fn, relationParams);
  return result === null ? false : result;
}

function getListItems(fn: any, relationParams: Dictionary<any>) {
  return getRelationCbResult(fn, relationParams);
}

function createViewCell(value: CellValue, column: ColumnInfo): CellRenderData {
  const { formatter, prefix, postfix, editor, editorOptions } = column;

  return {
    editable: !!editor,
    editorOptions: editorOptions ? { ...editorOptions } : {},
    disabled: false,
    formattedValue: getFormattedValue(value, formatter, String(value)),
    prefix: getFormattedValue(value, prefix),
    postfix: getFormattedValue(value, postfix),
    value
  };
}

function createRelationViewCell(
  name: string,
  row: Row,
  columnMap: Dictionary<ColumnInfo>,
  valueMap: Dictionary<CellRenderData>
) {
  const { editable, disabled, value } = valueMap[name];
  const { relationMap = {} } = columnMap[name];

  Object.keys(relationMap).forEach((targetName) => {
    const {
      editable: editableCallback,
      disabled: disabledCallback,
      listItems: listItemsCallback
    } = relationMap[targetName];
    const relationCbParams = { value, editable, disabled, row };
    const targetEditable = getEditable(editableCallback, relationCbParams);
    const targetDisabled = getDisabled(disabledCallback, relationCbParams);
    const targetListItems = getListItems(listItemsCallback, relationCbParams);

    let cellData = createViewCell(row[targetName], columnMap[targetName]);

    const hasValue = targetListItems ? someProp('value', cellData.value, targetListItems) : false;

    if (!hasValue) {
      cellData = createViewCell('', columnMap[targetName]);
    }

    if (!targetEditable) {
      cellData.editable = false;
    }
    if (targetDisabled) {
      cellData.disabled = true;
    }
    if (Array.isArray(cellData.editorOptions.listItems)) {
      cellData.editorOptions.listItems = targetListItems || [];
    }

    valueMap[targetName] = cellData;
  });
}

function createViewRow(row: Row, columnMap: Dictionary<ColumnInfo>) {
  const { rowKey } = row;
  const initValueMap: Dictionary<CellRenderData | null> = {};

  Object.keys(columnMap).forEach((name) => {
    initValueMap[name] = null;
  });

  const valueMap = reactive(initValueMap) as Dictionary<CellRenderData>;

  Object.keys(columnMap).forEach((name) => {
    const { related, relationMap } = columnMap[name];
    // add condition expression to prevent to call watch function recursively
    if (!related) {
      watch(() => {
        valueMap[name] = createViewCell(row[name], columnMap[name]);
      });
    }
    // @TODO need to improve relation
    if (Object.keys(relationMap!).length) {
      watch(() => {
        createRelationViewCell(name, row, columnMap, valueMap);
      });
    }
  });

  return { rowKey, valueMap };
}

export function create(data: OptRow[], column: Column): Reactive<Data> {
  const rawData = data.map((row, index) => {
    const rowKeyAdded = { rowKey: index, _number: index + 1, _checked: false, ...row };

    return reactive(rowKeyAdded as Row);
  });

  const viewData = rawData.map((row: Row) => createViewRow(row, column.allColumnMap));

  return reactive({
    rawData,
    viewData,

    // @TODO meta 프로퍼티 값으로 변경
    get checkedAllRows() {
      const checkedRows = rawData.filter(({ _checked }) => _checked);

      return checkedRows.length === rawData.length;
    }
  });
}
