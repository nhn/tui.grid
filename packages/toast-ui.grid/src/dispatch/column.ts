import { Store } from '@t/store';
import { ColumnInfo, ResizedColumn, Column, ComplexColumnInfo } from '@t/store/column';
import { Side } from '@t/store/focus';
import { Range } from '@t/store/selection';
import { ViewRow, Row } from '@t/store/data';
import { OptColumn, Dictionary } from '@t/options';
import { createColumn, createRelationColumns } from '../store/column';
import { createViewRow, generateDataCreationKey } from '../store/data';
import GridEvent from '../event/gridEvent';
import { getEventBus } from '../event/eventBus';
import { initFocus } from './focus';
import { isObservable, notify } from '../helper/observable';
import { unsort } from './sort';
import { initFilter, unfilter } from './filter';
import { initSelection } from './selection';
import { findProp } from '../helper/common';
import { initScrollPosition } from './viewport';
import { getTextWidth, getComputedFontStyle } from '../helper/dom';
import {
  getMaxTextMap,
  createFormattedValue,
  setMaxColumnTextMap,
  initMaxTextMap,
} from '../store/helper/data';
import { getTreeIndentWidth } from '../store/helper/tree';
import { getDepth } from '../query/tree';
import { TREE_CELL_HORIZONTAL_PADDING } from '../helper/constant';

export function setFrozenColumnCount({ column }: Store, count: number) {
  column.frozenCount = count;
}

function getCellWidthToBeResized(
  columns: ColumnInfo[],
  range: Range,
  resizeAmount: number,
  startWidths: number[]
) {
  const widths = [];
  const [startIdx, endIdx] = range;
  const rangeLength = endIdx - startIdx + 1;
  const delta = resizeAmount / rangeLength;

  for (let idx = 0; idx < rangeLength; idx += 1) {
    const columnIdx = startIdx + idx;
    const { minWidth } = columns[columnIdx];
    const width = Math.max(startWidths[idx] + delta, minWidth);
    widths.push(width);
  }

  return widths;
}

export function setColumnWidth(
  { column, id }: Store,
  side: Side,
  range: Range,
  resizeAmount: number,
  startWidths: number[]
) {
  const eventBus = getEventBus(id);
  const columns = column.visibleColumnsBySideWithRowHeader[side];
  const [startIdx, endIdx] = range;
  const resizedColumns: ResizedColumn[] = [];
  const widths = getCellWidthToBeResized(columns, range, resizeAmount, startWidths);

  for (let idx = startIdx; idx <= endIdx; idx += 1) {
    resizedColumns.push({
      columnName: columns[idx].name,
      width: widths[idx - startIdx],
    });
  }

  const gridEvent = new GridEvent({ resizedColumns });

  /**
   * Occurs when column is resized
   * @event Grid#columnResize
   * @property {Array} resizedColumns - state about resized columns
   * @property {number} resizedColumns.columnName - columnName of the target cell
   * @property {number} resizedColumns.width - width of the resized column
   * @property {Grid} instance - Current grid instance
   */
  eventBus.trigger('columnResize', gridEvent);

  if (!gridEvent.isStopped()) {
    widths.forEach((width, idx) => {
      const columnIdx = startIdx + idx;
      const item = columns[columnIdx];
      item.baseWidth = width;
      item.fixedWidth = true;
    });
  }
}

export function setColumns(store: Store, optColumns: OptColumn[]) {
  const { column, data, id } = store;
  const {
    columnOptions,
    copyOptions,
    treeColumnOptions,
    rowHeaders,
  } = column.dataForColumnCreation;

  const relationColumns = optColumns.reduce(
    (acc: string[], { relations = [] }) =>
      acc.concat(createRelationColumns(relations)).filter((columnName, index) => {
        const foundIndex = acc.indexOf(columnName);
        return foundIndex === -1 || foundIndex === index;
      }),
    []
  );

  const columnInfos = optColumns.map((optColumn) =>
    createColumn(
      optColumn,
      columnOptions,
      relationColumns,
      copyOptions,
      treeColumnOptions,
      column.columnHeaderInfo,
      !!optColumn.disabled
    )
  );

  const dataCreationKey = generateDataCreationKey();

  initScrollPosition(store);
  initFocus(store);
  initSelection(store);

  column.allColumns = [...rowHeaders, ...columnInfos];

  data.viewData.forEach((viewRow) => {
    if (Array.isArray(viewRow.__unobserveFns__)) {
      viewRow.__unobserveFns__.forEach((fn) => fn());
    }
  });

  data.rawData = data.rawData.map((row) => {
    const newRow = { ...column.emptyRow, ...row };
    newRow.uniqueKey = `${dataCreationKey}-${row.rowKey}`;

    return newRow;
  });

  data.viewData = data.rawData.map((row) =>
    isObservable(row)
      ? createViewRow(id, row, data.rawData, column)
      : ({ rowKey: row.rowKey, sortKey: row.sortKey, uniqueKey: row.uniqueKey } as ViewRow)
  );

  initFilter(store);
  unsort(store);
  setColumnWidthsByText(store);
}

export function resetColumnWidths({ column }: Store, widths: number[]) {
  column.visibleColumns.forEach((columnInfo, idx) => {
    columnInfo.baseWidth = widths[idx];
    columnInfo.autoResizing = false;
  });
}

function setColumnsHiddenValue(column: Column, columnName: string, hidden: boolean) {
  const { allColumnMap, complexColumnHeaders } = column;

  if (complexColumnHeaders.length) {
    const complexColumn = findProp('name', columnName, complexColumnHeaders);
    if (complexColumn) {
      complexColumn.childNames.forEach((childName) => {
        allColumnMap[childName].hidden = hidden;
      });
      return;
    }
  }
  allColumnMap[columnName].hidden = hidden;
}

export function hideColumn(store: Store, columnName: string) {
  const { column, focus } = store;

  if (focus.columnName === columnName) {
    initFocus(store);
  }

  initSelection(store);
  unfilter(store, columnName);
  unsort(store, columnName);

  setColumnsHiddenValue(column, columnName, true);
}

export function showColumn({ column }: Store, columnName: string) {
  setColumnsHiddenValue(column, columnName, false);
}

export function setComplexColumnHeaders(store: Store, complexColumnHeaders: ComplexColumnInfo[]) {
  store.column.complexColumnHeaders = complexColumnHeaders;
}

export function changeColumnHeadersByName({ column }: Store, columnsMap: Dictionary<string>) {
  const { complexColumnHeaders, allColumnMap } = column;

  Object.keys(columnsMap).forEach((columnName) => {
    const col = allColumnMap[columnName];
    if (col) {
      col.header = columnsMap[columnName];
    }

    if (complexColumnHeaders.length) {
      const complexCol = findProp('name', columnName, complexColumnHeaders);
      if (complexCol) {
        complexCol.header = columnsMap[columnName];
      }
    }
  });

  notify(column, 'allColumns');
}

export function setAutoResizingColumnWidths(store: Store, targetData?: Row[]) {
  const { autoResizingColumn } = store.column;
  const rawData = targetData || store.data.rawData;

  if (!rawData.length || !autoResizingColumn.length) {
    return;
  }

  initMaxTextMap();
  const maxTextMap = getMaxTextMap();

  rawData.forEach((row) => {
    autoResizingColumn.forEach((columnInfo) => {
      const { name } = columnInfo;
      const formattedValue = createFormattedValue(row, columnInfo);
      if (!maxTextMap[name] || maxTextMap[name].formattedValue.length < formattedValue.length) {
        setMaxColumnTextMap(name, formattedValue, row);
      }
    });
  });
  setColumnWidthsByText(store);
}

export function setColumnWidthsByText(store: Store) {
  const { autoResizingColumn } = store.column;

  if (store.data.rawData.length && autoResizingColumn.length) {
    autoResizingColumn.forEach(({ name }) => {
      setColumnWidthByText(store, name);
    });
  }
}

function setColumnWidthByText({ data, column }: Store, columnName: string) {
  const { allColumnMap, treeColumnName, treeIcon } = column;
  const maxTextMap = getMaxTextMap();
  const { formattedValue, row } = maxTextMap[columnName];
  let width = getTextWidth(
    formattedValue,
    getComputedFontStyle(treeColumnName ? 'tree-wrapper-relative' : 'cell')
  );

  if (treeColumnName) {
    width +=
      getTreeIndentWidth(getDepth(data.rawData, row), treeIcon) + TREE_CELL_HORIZONTAL_PADDING;
  }

  allColumnMap[columnName].baseWidth = Math.max(allColumnMap[columnName].minWidth, width);
  allColumnMap[columnName].fixedWidth = true;
}
