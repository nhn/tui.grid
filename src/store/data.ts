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

function getSpecificOption(type: string, fn: any, relationParams: Dictionary<any>) {
  let option = null;
  if (typeof fn === 'function') {
    option = fn(relationParams);
  }

  if (type === 'editable') {
    return option === null ? true : option;
  }
  if (type === 'disabled') {
    return option === null ? false : option;
  }
  return option;
}

function createViewCell(value: CellValue, column: ColumnInfo): CellRenderData {
  const { formatter, prefix, postfix, editor, editorOptions } = column;

  return {
    // @TODO: change editable/disabled using relations
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

  // @TODO remove lint rule
  /* eslint-disable complexity */
  Object.keys(relationMap).forEach((targetName) => {
    const {
      editable: editablaCallback,
      disabled: disabledCallback,
      listItems: listItemsCallback
    } = relationMap[targetName];
    const relationCbParams = { value, editable, disabled, row };
    const targetEditable = getSpecificOption('editable', editablaCallback, relationCbParams);
    const targetDisabled = getSpecificOption('disabled', disabledCallback, relationCbParams);
    const targetListItems = getSpecificOption('listItems', listItemsCallback, relationCbParams);

    let cellData = createViewCell(row[targetName], columnMap[targetName]);

    // @TODO apply some method in common helper
    const hasValue = targetListItems
      ? targetListItems.some((item: Dictionary<any>) => item.value === cellData.value)
      : false;

    if (!hasValue) {
      cellData = createViewCell('', columnMap[targetName]);
    }

    if (!targetEditable) {
      cellData.editable = false;
    }
    if (targetDisabled) {
      cellData.disabled = true;
    }
    cellData.editorOptions.listItems = targetListItems || [];

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
    const { isRelated, relationMap } = columnMap[name];
    if (!isRelated) {
      watch(() => {
        valueMap[name] = createViewCell(row[name], columnMap[name]);
      });
    }
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
