import {
  RowSpanAttributeValue,
  PageOptions,
  Row,
  ListItem,
  RowKey,
  RowSpan,
  CellRenderData,
  RowSpanMap,
  ViewRow,
  Data,
  SortState,
  RawRowOptions,
} from '@t/store/data';
import { Column, ColumnInfo, ErrorInfo } from '@t/store/column';
import { Filter } from '@t/store/filterLayerState';
import { OptRow, Dictionary } from '@t/options';
import { Range } from '@t/store/selection';
import { observable, observe } from '../helper/observable';
import { isRowHeader, isRowNumColumn, isCheckboxColumn } from '../helper/column';
import {
  someProp,
  isUndefined,
  isBoolean,
  isEmpty,
  isNumber,
  isFunction,
  assign,
  isNull,
  isNil,
} from '../helper/common';
import { createTreeRawData, createTreeCellInfo } from './helper/tree';
import { addUniqueInfoMap, getValidationCode } from './helper/validation';
import { isScrollPagination } from '../query/data';
import { getFormattedValue, setMaxTextMap } from './helper/data';
import {
  DEFAULT_PER_PAGE,
  DISABLED_PRIORITY_CELL,
  DISABLED_PRIORITY_COLUMN,
  DISABLED_PRIORITY_NONE,
  DISABLED_PRIORITY_ROW,
} from '../helper/constant';

interface DataOption {
  data: OptRow[];
  column: Column;
  pageOptions: PageOptions;
  useClientSort: boolean;
  id: number;
  disabled: boolean;
}

interface DataCreationOption {
  lazyObservable?: boolean;
  prevRows?: Row[];
  disabled?: boolean;
}

interface RelationInfo {
  relationMatched?: boolean;
  relationListItems?: ListItem[];
}

interface ViewCellInfo {
  columnMap: Dictionary<ColumnInfo>;
  valueMap: Dictionary<CellRenderData>;
}

interface ViewCellCreationOpt {
  isDataModified?: boolean;
  prevInvalidStates?: ErrorInfo[];
  relationInfo?: RelationInfo;
}

let dataCreationKey = '';

export function generateDataCreationKey() {
  dataCreationKey = `@dataKey${Date.now()}`;
  return dataCreationKey;
}

function getRelationCbResult(fn: any, relationParams: Dictionary<any>) {
  const result = isFunction(fn) ? fn(relationParams) : null;
  return isUndefined(result) ? null : result;
}

function getEditable(fn: any, relationParams: Dictionary<any>): boolean {
  const result = getRelationCbResult(fn, relationParams);
  return result === null ? true : result;
}

function getDisabled(fn: any, relationParams: Dictionary<any>): boolean {
  const result = getRelationCbResult(fn, relationParams);
  return result === null ? false : result;
}

function getListItems(fn: any, relationParams: Dictionary<any>): ListItem[] {
  return getRelationCbResult(fn, relationParams) || [];
}

function getRowHeaderValue(row: Row, columnName: string) {
  if (isRowNumColumn(columnName)) {
    return row._attributes.rowNum;
  }
  if (isCheckboxColumn(columnName)) {
    return row._attributes.checked;
  }
  return '';
}

export function createRowSpan(
  mainRow: boolean,
  rowKey: RowKey,
  count: number,
  spanCount: number
): RowSpan {
  return { mainRow, mainRowKey: rowKey, count, spanCount };
}

function createViewCell(
  id: number,
  row: Row,
  column: ColumnInfo,
  { isDataModified = false, prevInvalidStates, relationInfo = {} }: ViewCellCreationOpt
): CellRenderData {
  const { relationMatched = true, relationListItems } = relationInfo;
  const { name, formatter, editor, validation, defaultValue } = column;
  let value = isRowHeader(name) ? getRowHeaderValue(row, name) : row[name];

  if (isNil(value) && !isNil(defaultValue)) {
    value = defaultValue;
  }

  if (!relationMatched) {
    value = '';
  }

  const formatterProps = { row, column, value };
  const { disabled, checkDisabled, className: classNameAttr } = row._attributes;
  const columnDisabled = !!column.disabled;
  const rowDisabled = isCheckboxColumn(name) ? checkDisabled : disabled;
  const columnClassName = isUndefined(classNameAttr.column[name]) ? [] : classNameAttr.column[name];
  const className = [...classNameAttr.row, ...columnClassName].join(' ');
  const _disabledPriority = row._disabledPriority[name];

  let cellDisabled = rowDisabled || columnDisabled;
  if (_disabledPriority === DISABLED_PRIORITY_CELL) {
    cellDisabled = true;
  } else if (_disabledPriority === DISABLED_PRIORITY_NONE) {
    cellDisabled = false;
  } else if (_disabledPriority === DISABLED_PRIORITY_COLUMN) {
    cellDisabled = columnDisabled;
  } else if (_disabledPriority === DISABLED_PRIORITY_ROW) {
    cellDisabled = rowDisabled;
  }

  const usePrevInvalidStates = !isDataModified && !isNil(prevInvalidStates);
  const invalidStates = usePrevInvalidStates
    ? (prevInvalidStates as ErrorInfo[])
    : getValidationCode({ id, value: row[name], row, validation, columnName: name });

  return {
    editable: !!editor,
    className,
    disabled: cellDisabled,
    invalidStates,
    formattedValue: getFormattedValue(formatterProps, formatter, value, relationListItems),
    value,
  };
}

function createRelationViewCell(
  id: number,
  name: string,
  row: Row,
  { columnMap, valueMap }: ViewCellInfo
) {
  const { editable, disabled, value } = valueMap[name];
  const { relationMap = {} } = columnMap[name];

  Object.keys(relationMap).forEach((targetName) => {
    const {
      editable: editableCallback,
      disabled: disabledCallback,
      listItems: listItemsCallback,
    } = relationMap[targetName];
    const relationCbParams = { value, editable, disabled, row };
    const targetEditable = getEditable(editableCallback, relationCbParams);
    const targetDisabled = getDisabled(disabledCallback, relationCbParams);
    const targetListItems = getListItems(listItemsCallback, relationCbParams);
    const targetValue = row[targetName];
    const targetEditor = columnMap[targetName].editor;
    const targetEditorOptions = targetEditor?.options;

    const relationMatched = isFunction(listItemsCallback)
      ? someProp('value', targetValue, targetListItems)
      : true;

    const cellData = createViewCell(id, row, columnMap[targetName], {
      relationInfo: {
        relationMatched,
        relationListItems: targetListItems,
      },
    });

    if (!targetEditable) {
      cellData.editable = false;
    }
    if (targetDisabled) {
      cellData.disabled = true;
    }
    // should set the relation list to relationListItemMap for preventing to share relation list in other rows
    if (targetEditorOptions) {
      targetEditorOptions.relationListItemMap = targetEditorOptions.relationListItemMap || {};
      targetEditorOptions.relationListItemMap[row.rowKey] = targetListItems;
    }

    valueMap[targetName] = cellData;
  });
}

export function createViewRow(id: number, row: Row, rawData: Row[], column: Column) {
  const { rowKey, sortKey, rowSpanMap, uniqueKey } = row;
  const { columnMapWithRelation: columnMap } = column;
  const { treeColumnName, treeIcon = true, treeIndentWidth } = column;
  const initValueMap: Dictionary<CellRenderData | null> = {};

  Object.keys(columnMap).forEach((name) => {
    initValueMap[name] = null;
  });

  const cachedValueMap: Dictionary<CellRenderData> = {};

  const valueMap = observable(initValueMap) as Dictionary<CellRenderData>;
  const __unobserveFns__: Function[] = [];

  Object.keys(columnMap).forEach((name) => {
    const { related, relationMap, className } = columnMap[name];
    if (className) {
      row._attributes.className.column[name] = className.split(' ');
    }

    // add condition expression to prevent to call watch function recursively
    if (!related) {
      __unobserveFns__.push(
        observe((calledBy: string) => {
          const isDataModified = calledBy !== 'className';

          cachedValueMap[name] = createViewCell(id, row, columnMap[name], {
            isDataModified,
            prevInvalidStates: cachedValueMap[name]?.invalidStates,
          });

          valueMap[name] = cachedValueMap[name];
        })
      );
    }

    if (relationMap && Object.keys(relationMap).length) {
      __unobserveFns__.push(
        observe(() => {
          createRelationViewCell(id, name, row, { columnMap, valueMap });
        })
      );
    }
  });

  return {
    rowKey,
    sortKey,
    uniqueKey,
    rowSpanMap,
    valueMap,
    __unobserveFns__,
    ...(treeColumnName && {
      treeInfo: createTreeCellInfo(rawData, row, treeIndentWidth, treeIcon),
    }),
  };
}

function getAttributes(row: OptRow, index: number, lazyObservable: boolean, disabled: boolean) {
  const defaultAttr = {
    rowNum: index + 1,
    checked: false,
    disabled,
    checkDisabled: disabled,
    className: {
      row: [],
      column: {},
    },
  };

  if (row._attributes) {
    if (isBoolean(row._attributes.disabled) && isUndefined(row._attributes.checkDisabled)) {
      row._attributes.checkDisabled = row._attributes.disabled;
    }

    if (!isUndefined(row._attributes.className)) {
      row._attributes.className = {
        row: [],
        column: {},
        ...row._attributes.className,
      };
    }
  }
  const attributes = { ...defaultAttr, ...row._attributes };

  return lazyObservable ? attributes : observable(attributes);
}

function createRelationListItems(name: string, row: Row, columnMap: Dictionary<ColumnInfo>) {
  const { relationMap = {}, editor } = columnMap[name];
  const { checkDisabled, disabled: rowDisabled } = row._attributes;
  const editable = !!editor;
  const disabled = isCheckboxColumn(name) ? checkDisabled : rowDisabled;
  const value = row[name];
  const relationCbParams = { value, editable, disabled, row };
  const relationListItemMap: Dictionary<ListItem[]> = {};

  Object.keys(relationMap).forEach((targetName) => {
    relationListItemMap[targetName] = getListItems(
      relationMap[targetName].listItems,
      relationCbParams
    );
  });
  return relationListItemMap;
}

export function setRowRelationListItems(row: Row, columnMap: Dictionary<ColumnInfo>) {
  const relationListItemMap = { ...row._relationListItemMap };
  Object.keys(columnMap).forEach((name) => {
    assign(relationListItemMap, createRelationListItems(name, row, columnMap));
  });
  row._relationListItemMap = relationListItemMap;
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
    const { mainRowKey, count, spanCount } = prevRowSpan;

    if (spanCount > 1 && spanCount > 1 - count) {
      const subRowCount = count >= 0 ? -1 : count - 1;
      subRowSpanMap[columnName] = createRowSpan(false, mainRowKey, subRowCount, spanCount);
    }
  });
  return subRowSpanMap;
}

function createRowSpanMap(row: OptRow, rowSpan: RowSpanAttributeValue, prevRow?: Row) {
  const rowKey = row.rowKey as RowKey;
  let mainRowSpanMap: RowSpanMap = {};
  let subRowSpanMap: RowSpanMap = {};

  if (!isEmpty(rowSpan)) {
    mainRowSpanMap = createMainRowSpanMap(rowSpan, rowKey);
  }
  if (prevRow) {
    const { rowSpanMap: prevRowSpanMap } = prevRow;
    if (!isEmpty(prevRowSpanMap)) {
      subRowSpanMap = createSubRowSpan(prevRowSpanMap);
    }
  }

  return { ...mainRowSpanMap, ...subRowSpanMap };
}

export function createRawRow(
  id: number,
  row: OptRow,
  index: number,
  column: Column,
  options: RawRowOptions = {}
) {
  // this rowSpan variable is attribute option before creating rowSpanDataMap
  const rowSpan = row._attributes?.rowSpan as RowSpanAttributeValue;

  const { keyColumnName, prevRow, lazyObservable = false, disabled = false } = options;

  if (keyColumnName) {
    row.rowKey = row[keyColumnName];
  } else if (isUndefined(row.rowKey)) {
    row.rowKey = index;
  }

  row.sortKey = isNumber(row.sortKey) ? row.sortKey : index;
  row.uniqueKey = `${dataCreationKey}-${row.rowKey}`;
  row._attributes = getAttributes(row, index, lazyObservable, disabled);
  row._attributes.rowSpan = rowSpan;
  row._disabledPriority = row._disabledPriority || {};

  (row as Row).rowSpanMap = (row as Row).rowSpanMap ?? createRowSpanMap(row, rowSpan, prevRow);

  setRowRelationListItems(row as Row, column.columnMapWithRelation);

  if (column.autoResizingColumn.length) {
    setMaxTextMap(column, row as Row);
  }
  if (lazyObservable) {
    addUniqueInfoMap(id, row, column);
  }

  return (lazyObservable ? row : observable(row)) as Row;
}

export function createData(
  id: number,
  data: OptRow[],
  column: Column,
  { lazyObservable = false, prevRows, disabled = false }: DataCreationOption
) {
  generateDataCreationKey();
  const { keyColumnName, treeColumnName = '' } = column;
  let rawData: Row[];

  // Notify when using deprecated option "_attribute.rowSpan".
  const isUseRowSpanOption = data.some((row) => row._attributes?.rowSpan);
  if (isUseRowSpanOption) {
    // eslint-disable-next-line no-console
    console.warn(
      'The option "_attribute.rowSpan" is deprecated. Please use rowSpan option of column.\nFollow example: http://nhn.github.io/tui.grid/latest/tutorial-example29-dynamic-row-span'
    );
  }

  if (treeColumnName) {
    rawData = createTreeRawData({
      id,
      data,
      column,
      keyColumnName,
      lazyObservable,
      disabled,
    });
  } else {
    rawData = data.map((row, index, rows) =>
      createRawRow(id, row, index, column, {
        keyColumnName,
        prevRow: prevRows ? prevRows[index] : (rows[index - 1] as Row),
        lazyObservable,
        disabled,
      })
    );
  }

  const viewData = rawData.map((row: Row) =>
    lazyObservable
      ? ({ rowKey: row.rowKey, sortKey: row.sortKey, uniqueKey: row.uniqueKey } as ViewRow)
      : createViewRow(id, row, rawData, column)
  );

  return { rawData, viewData };
}

let cachedFilteredIndex: Record<RowKey, number | null> = {};

function applyFilterToRawData(
  rawData: Row[],
  filters: Filter[] | null,
  columnMap: Dictionary<ColumnInfo>
) {
  let data = rawData;
  cachedFilteredIndex = {};

  if (filters) {
    data = filters.reduce((acc: Row[], filter: Filter) => {
      const { conditionFn, columnName } = filter;
      const { formatter } = columnMap[columnName];

      return acc.filter((row, index) => {
        const value = row[columnName];
        const relationListItems = row._relationListItemMap[columnName];
        const formatterProps = { row, column: columnMap[columnName], value };
        const filtered = conditionFn!(
          getFormattedValue(formatterProps, formatter, value, relationListItems)
        );

        // cache the filtered index for performance
        if (acc === rawData && filtered) {
          cachedFilteredIndex[row.rowKey] = index;
        } else if (!filtered) {
          cachedFilteredIndex[row.rowKey] = null;
        }
        return filtered;
      });
    }, rawData);
  }

  return data;
}

function createPageOptions(userPageOptions: PageOptions, rawData: Row[]) {
  const pageOptions = (isEmpty(userPageOptions)
    ? {}
    : {
        useClient: false,
        page: 1,
        perPage: DEFAULT_PER_PAGE,
        type: 'pagination',
        ...userPageOptions,
        totalCount: userPageOptions.useClient ? rawData.length : userPageOptions.totalCount!,
      }) as Required<PageOptions>;

  if (pageOptions.type === 'pagination') {
    pageOptions.position = pageOptions.position || 'bottom';
    pageOptions.visiblePages = pageOptions.visiblePages || 10;
  }

  return pageOptions;
}

export function create({
  data,
  column,
  pageOptions: userPageOptions,
  useClientSort,
  disabled,
  id,
}: DataOption) {
  const { rawData, viewData } = createData(id, data, column, { lazyObservable: true, disabled });

  const sortState: SortState = {
    useClient: useClientSort,
    columns: [
      {
        columnName: 'sortKey',
        ascending: true,
      },
    ],
  };
  const pageOptions = createPageOptions(userPageOptions, rawData);

  return observable({
    rawData,
    viewData,
    sortState,
    pageOptions,
    checkedAllRows: rawData.length ? !rawData.some((row) => !row._attributes.checked) : false,
    disabledAllCheckbox: disabled,
    filters: null,
    loadingState: rawData.length ? 'DONE' : 'EMPTY',
    clickedCheckboxRowkey: null,

    get filteredRawData() {
      if (this.filters) {
        // should filter the sliced data which is displayed in viewport in case of client infinite scrolling
        const targetData = isScrollPagination(this, true)
          ? this.rawData.slice(...this.pageRowRange)
          : this.rawData;
        return applyFilterToRawData(targetData, this.filters, column.allColumnMap);
      }

      return this.rawData;
    },

    get filteredIndex() {
      const { filteredRawData, filters } = this;
      return filters
        ? filteredRawData
            .filter((row) => !isNull(cachedFilteredIndex[row.rowKey]))
            .map((row) => cachedFilteredIndex[row.rowKey]!)
        : null;
    },

    get filteredViewData() {
      return this.filters
        ? this.filteredIndex!.map((index) => this.viewData[index])
        : this.viewData;
    },

    get pageRowRange() {
      const { useClient, type, page, perPage } = this.pageOptions;
      let start = 0;
      // should calculate the range through all rawData in case of client infinite scrolling
      let end = isScrollPagination(this, true) ? this.rawData.length : this.filteredViewData.length;

      if (useClient) {
        const pageRowLastIndex = page * perPage;
        if (type === 'pagination') {
          start = (page - 1) * perPage;
        }
        end = pageRowLastIndex > 0 && pageRowLastIndex < end ? pageRowLastIndex : end;
      }

      return [start, end] as Range;
    },
  } as Data);
}
