import {
  Data,
  Row,
  Dictionary,
  Column,
  ColumnInfo,
  ColumnDefaultValues,
  Formatter,
  CellRenderData,
  FormatterProps,
  CellValue,
  ValidationType,
  Validation,
  PageOptions,
  RowKey,
  RowSpanMap
} from './types';
import { observable, observe, Observable } from '../helper/observable';
import { isRowHeader } from '../helper/column';
import { OptRow, RowSpanAttributeValue } from '../types';
import {
  someProp,
  encodeHTMLEntity,
  setDefaultProp,
  isBlank,
  isUndefined,
  isBoolean,
  isEmpty
} from '../helper/common';
import { listItemText } from '../formatter/listItemText';
import { createTreeRawData, createTreeCellInfo } from '../helper/tree';
import { createRowSpan } from '../helper/rowSpan';

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
  const { disabled, checkDisabled, className } = row._attributes;
  const columnClassName = isUndefined(className.column[name]) ? [] : className.column[name];

  return {
    editable: !!editor,
    editorOptions: editorOptions ? { ...editorOptions } : {},
    className: [...className.row, ...columnClassName].join(' '),
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

export function createViewRow(
  row: Row,
  columnMap: Dictionary<ColumnInfo>,
  rawData: Row[],
  treeColumnName?: string,
  treeIcon?: boolean
) {
  const { rowKey } = row;
  const initValueMap: Dictionary<CellRenderData | null> = {};

  Object.keys(columnMap).forEach((name) => {
    initValueMap[name] = null;
  });

  const valueMap = observable(initValueMap) as Dictionary<CellRenderData>;
  const __unobserveFns__: Function[] = [];

  Object.keys(columnMap).forEach((name) => {
    const { related, relationMap } = columnMap[name];

    // add condition expression to prevent to call watch function recursively
    if (!related) {
      __unobserveFns__.push(
        observe(() => {
          valueMap[name] = createViewCell(row, columnMap[name]);
        })
      );
    }
    // @TODO need to improve relation
    if (relationMap && Object.keys(relationMap).length) {
      __unobserveFns__.push(
        observe(() => {
          createRelationViewCell(name, row, columnMap, valueMap);
        })
      );
    }
  });

  return {
    rowKey,
    valueMap,
    __unobserveFns__,
    ...(treeColumnName && { treeInfo: createTreeCellInfo(rawData, row, treeIcon) })
  };
}

function getAttributes(row: OptRow, index: number) {
  const defaultAttr = {
    rowNum: index + 1, // @TODO append, remove 할 때 인덱스 변경 처리 필요
    checked: false,
    disabled: false,
    checkDisabled: false,
    className: {
      row: [],
      column: {}
    }
  };

  if (row._attributes) {
    if (isBoolean(row._attributes.disabled) && isUndefined(row._attributes.checkDisabled)) {
      row._attributes.checkDisabled = row._attributes.disabled;
    }

    if (!isUndefined(row._attributes.className)) {
      row._attributes.className = {
        row: [],
        column: {},
        ...row._attributes.className
      };
    }
  }

  return observable({ ...defaultAttr, ...row._attributes });
}

function createMainRowSpanMap(rowSpan: RowSpanAttributeValue, rowKey: RowKey) {
  const mainRowSpanMap: RowSpanMap = {};

  if (!rowSpan) {
    return mainRowSpanMap;
  }

  Object.keys(rowSpan).forEach((columnName) => {
    const spanCount = rowSpan[columnName];
    mainRowSpanMap[columnName] = createRowSpan(true, rowKey, spanCount, spanCount);
  });
  return mainRowSpanMap;
}

function createSubRowSpan(prevRowSpanMap: RowSpanMap) {
  const subRowSpanMap: RowSpanMap = {};

  Object.keys(prevRowSpanMap).forEach((columnName) => {
    const prevRowSpan = prevRowSpanMap[columnName];

    if (prevRowSpan.spanCount > -prevRowSpan.count + 1) {
      const { mainRowKey, count, spanCount } = prevRowSpan;
      const subRowCount = count >= 0 ? -1 : count - 1;
      subRowSpanMap[columnName] = createRowSpan(false, mainRowKey, subRowCount, spanCount);
    }
  });
  return subRowSpanMap;
}

function createRowSpanMap(row: OptRow, rowSpan: RowSpanAttributeValue, prevRow?: Row) {
  const rowSpanMap: RowSpanMap = {};
  const rowKey = row.rowKey as RowKey;

  if (!isEmpty(rowSpan)) {
    return createMainRowSpanMap(rowSpan, rowKey);
  }
  if (prevRow) {
    const { rowSpanMap: prevRowSpanMap } = prevRow;
    if (!isEmpty(prevRowSpanMap)) {
      return createSubRowSpan(prevRowSpanMap);
    }
  }

  return rowSpanMap;
}

export function createRawRow(
  row: OptRow,
  index: number,
  defaultValues: ColumnDefaultValues,
  keyColumnName?: string,
  prevRow?: Row
) {
  // this rowSpan variable is attribute option before creating rowSpanDataMap
  let rowSpan: RowSpanAttributeValue;
  if (row._attributes) {
    rowSpan = row._attributes.rowSpan as RowSpanAttributeValue;
    // protect to create uneccesary reactive data
    delete row._attributes.rowSpan;
  }
  row.rowKey = keyColumnName ? row[keyColumnName] : index;
  row._attributes = getAttributes(row, index);
  (row as Row).rowSpanMap = createRowSpanMap(row, rowSpan, prevRow);

  defaultValues.forEach(({ name, value }) => {
    setDefaultProp(row, name, value);
  });

  return observable(row as Row);
}

export function createData(data: OptRow[], column: Column) {
  const {
    defaultValues,
    keyColumnName,
    allColumnMap,
    treeColumnName = '',
    treeIcon = true
  } = column;

  let rawData: Row[];

  if (treeColumnName) {
    rawData = createTreeRawData(data, defaultValues, keyColumnName);
  } else {
    rawData = data.map((row, index, rows) =>
      createRawRow(row, index, defaultValues, keyColumnName, rows[index - 1] as Row)
    );
  }

  const viewData = rawData.map((row: Row) =>
    createViewRow(row, allColumnMap, rawData, treeColumnName, treeIcon)
  );

  return { rawData, viewData };
}

export function create(
  data: OptRow[],
  column: Column,
  pageOptions: PageOptions,
  useClientSort: boolean
): Observable<Data> {
  // @TODO add client pagination logic
  const { rawData, viewData } = createData(data, column);
  const sortOptions = { columnName: 'rowKey', ascending: true, useClient: useClientSort };

  return observable({
    disabled: false,
    rawData,
    viewData,
    sortOptions,
    pageOptions,

    get checkedAllRows() {
      const allRawData = this.rawData;
      const checkedRows = allRawData.filter((row) => row._attributes.checked);
      return checkedRows.length === allRawData.length;
    }
  });
}
