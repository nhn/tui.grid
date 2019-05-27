import {
  Data,
  Row,
  Dictionary,
  Column,
  ColumnInfo,
  Formatter,
  CellRenderData,
  FormatterProps,
  CellValue,
  ValidationType,
  Validation
} from './types';
import { reactive, watch, Reactive } from '../helper/reactive';
import { isRowHeader } from '../helper/column';
import { OptRow } from '../types';
import { someProp, encodeHTMLEntity, setDefaultProp, isBlank, isUndefined } from '../helper/common';
import { listItemText } from '../formatter/listItemText';

export function getCellDisplayValue(value: CellValue) {
  if (typeof value === 'undefined' || value === null) {
    return '';
  }
  return String(value);
}

function getFormattedValue(props: FormatterProps, formatter?: Formatter, defaultValue?: CellValue) {
  let value: CellValue;

  if (formatter === 'listItemText') {
    value = listItemText(props);
  } else if (typeof formatter === 'function') {
    value = formatter(props);
  } else if (typeof formatter === 'string') {
    value = formatter;
  } else {
    value = defaultValue;
  }

  const strValue = getCellDisplayValue(value);

  if (strValue && props.column.escapeHTML) {
    return encodeHTMLEntity(strValue);
  }
  return strValue;
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

function getRowHeaderValue(row: Row, columnName: string) {
  if (columnName === '_number') {
    return row._attributes.rowNum;
  }
  if (columnName === '_checked') {
    return row._attributes.checked;
  }
  return '';
}

function getValidationCode(value: CellValue, validation?: Validation): ValidationType | '' {
  if (validation && validation.required && isBlank(value)) {
    return 'REQUIRED';
  }
  if (validation && validation.dataType === 'string' && typeof value !== 'string') {
    return 'TYPE_STRING';
  }
  if (validation && validation.dataType === 'number' && typeof value !== 'number') {
    return 'TYPE_NUMBER';
  }

  return '';
}

function createViewCell(row: Row, column: ColumnInfo): CellRenderData {
  const { name, formatter, prefix, postfix, editor, editorOptions, validation } = column;
  const value = isRowHeader(name) ? getRowHeaderValue(row, name) : row[name];
  const formatterProps = { row, column, value };
  const { disabled, checkDisabled } = row._attributes;

  return {
    editable: !!editor,
    editorOptions: editorOptions ? { ...editorOptions } : {},
    disabled: name === '_checked' ? checkDisabled : disabled,
    invalidState: getValidationCode(value, validation),
    formattedValue: getFormattedValue(formatterProps, formatter, value),
    prefix: getFormattedValue(formatterProps, prefix),
    postfix: getFormattedValue(formatterProps, postfix),
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

    let cellData = createViewCell(row, columnMap[targetName]);

    const hasValue = targetListItems ? someProp('value', cellData.value, targetListItems) : false;

    if (!hasValue) {
      cellData = createViewCell(row, columnMap[targetName]);
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

export function createViewRow(row: Row, columnMap: Dictionary<ColumnInfo>) {
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
        valueMap[name] = createViewCell(row, columnMap[name]);
      });
    }
    // @TODO need to improve relation
    if (relationMap && Object.keys(relationMap).length) {
      watch(() => {
        createRelationViewCell(name, row, columnMap, valueMap);
      });
    }
  });

  return { rowKey, valueMap };
}

function getAttributes(row: OptRow, index: number) {
  if (
    row._attributes &&
    typeof row._attributes.disabled === 'boolean' &&
    isUndefined(row._attributes.checkDisabled)
  ) {
    row._attributes.checkDisabled = row._attributes.disabled;
  }

  // @TODO className: {row, column}
  return reactive({
    rowNum: index + 1,
    checked: false,
    disabled: false,
    checkDisabled: false,
    ...row._attributes
  });
}

export function createRawRow(row: OptRow, index: number, defaultValues: Column['defaultValues']) {
  row.rowKey = index;
  row._attributes = getAttributes(row, index);

  defaultValues.forEach(({ name, value }) => {
    setDefaultProp(row, name, value);
  });

  return reactive(row as Row);
}

export function createData(data: OptRow[], column: Column) {
  const { defaultValues } = column;
  const rawData = data.map((row, index) => createRawRow(row, index, defaultValues));
  const viewData = rawData.map((row: Row) => createViewRow(row, column.allColumnMap));

  return { rawData, viewData };
}

export function create(data: OptRow[], column: Column): Reactive<Data> {
  const { rawData, viewData } = createData(data, column);

  // @TODO neet to modify useClient options with net api
  const sortOptions = { columnName: 'rowKey', ascending: true, useClient: false };

  return reactive({
    disabled: false,
    rawData,
    viewData,
    sortOptions,
    // @TODO meta 프로퍼티 값으로 변경
    get checkedAllRows() {
      const checkedRows = rawData.filter(({ _checked }) => _checked);

      return checkedRows.length === rawData.length;
    }
  });
}
