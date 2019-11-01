import {
  Store,
  Side,
  ComplexColumnInfo,
  ViewRow,
  Dictionary,
  ColumnInfo,
  Range
} from '../store/types';
import { OptColumn } from '../types';
import { createColumn, createRelationColumns } from '../store/column';
import { createViewRow, generateDataCreationKey } from '../store/data';
import GridEvent from '../event/gridEvent';
import { getEventBus } from '../event/eventBus';
import { initFocus } from './focus';
import { addColumnSummaryValues } from './summary';
import { isObservable, notify } from '../helper/observable';
import { unsort } from './sort';
import { initFilter, unfilter } from './filter';
import { initSelection } from './selection';
import { findProp } from '../helper/common';
import { getAllColumnNamesWithColSpan } from '../query/colSpan';

export function setFrozenColumnCount({ column }: Store, count: number) {
  column.frozenCount = count;
}

function getEachCellWidthInRange(columns: ColumnInfo[], range: Range, totalWidth: number) {
  const widths = [];
  const unsetWidthIndexes = [];
  const [startIdx, endIdx] = range;
  const rangeLength = endIdx - startIdx + 1;
  let restWidth = totalWidth;
  let columnWidth = totalWidth / rangeLength;
  let countSetWidth = 0;

  for (let idx = 0; idx < rangeLength; idx += 1) {
    const columnIdx = startIdx + idx;
    const { minWidth } = columns[columnIdx];
    if (minWidth > columnWidth) {
      widths[idx] = minWidth;
      countSetWidth += 1;
      restWidth -= minWidth;
    } else {
      unsetWidthIndexes.push(columnIdx);
    }
  }

  if (rangeLength - countSetWidth) {
    columnWidth = restWidth / (rangeLength - countSetWidth);
    unsetWidthIndexes.forEach(columnIdx => {
      const { minWidth } = columns[columnIdx];
      widths[columnIdx - startIdx] = columnWidth > minWidth ? columnWidth : minWidth;
    });
  }

  return widths;
}

export function setColumnWidth(
  { column, id }: Store,
  side: Side,
  range: Range,
  totalWidth: number
) {
  const [startIdx] = range;
  const { visibleColumnsBySideWithRowHeader } = column;
  const columns = visibleColumnsBySideWithRowHeader[side];

  const columnItem = columns[startIdx];
  const widths = getEachCellWidthInRange(columns, range, totalWidth);

  const eventBus = getEventBus(id);
  const gridEvent = new GridEvent({
    columnName: columnItem.name,
    width: widths.reduce((width, acc) => acc + width, 0)
  });

  /**
   * Occurs when column is resized
   * @event Grid#columnResize
   * @property {number} columnName - columnName of the target cell
   * @property {number} width - width of the resized column
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
  const { column, data } = store;
  const {
    columnOptions,
    copyOptions,
    treeColumnOptions,
    rowHeaders
  } = column.dataForColumnCreation;

  const relationColumns = optColumns.reduce(
    (acc: string[], { relations = [] }) =>
      acc.concat(createRelationColumns(relations)).filter((columnName, index) => {
        const foundIndex = acc.indexOf(columnName);
        return foundIndex === -1 || foundIndex === index;
      }),
    []
  );

  const columnInfos = optColumns.map(optColumn =>
    createColumn(
      optColumn,
      columnOptions,
      relationColumns,
      copyOptions,
      treeColumnOptions,
      column.columnHeaderInfo
    )
  );

  const dataCreationKey = generateDataCreationKey();

  initFocus(store);
  initSelection(store);

  column.allColumns = [...rowHeaders, ...columnInfos];
  const { allColumnMap, treeColumnName, treeIcon } = column;

  data.viewData.forEach(viewRow => {
    if (Array.isArray(viewRow.__unobserveFns__)) {
      viewRow.__unobserveFns__.forEach(fn => fn());
    }
  });
  data.rawData = data.rawData.map(row => {
    row.uniqueKey = `${dataCreationKey}-${row.rowKey}`;
    return row;
  });
  data.viewData = data.rawData.map(row =>
    isObservable(row)
      ? createViewRow(row, allColumnMap, data.rawData, treeColumnName, treeIcon)
      : ({ rowKey: row.rowKey, sortKey: row.sortKey, uniqueKey: row.uniqueKey } as ViewRow)
  );

  initFilter(store);
  unsort(store);
  addColumnSummaryValues(store);
}

export function resetColumnWidths({ column }: Store, widths: number[]) {
  column.visibleColumns.forEach((columnInfo, idx) => {
    columnInfo.baseWidth = widths[idx];
  });
}

function setColumnsHiddenValue(
  columnName: string,
  allColumnMap: Dictionary<ColumnInfo>,
  hidden: boolean
) {
  const column = allColumnMap[columnName];

  if (column) {
    if (column.headerColSpan) {
      getAllColumnNamesWithColSpan(columnName, allColumnMap).forEach(name => {
        allColumnMap[name].hidden = hidden;
      });
    } else {
      column.hidden = hidden;
    }
  }
}

export function hideColumn(store: Store, columnName: string) {
  const { column, focus } = store;
  const { allColumnMap } = column;
  const { columnName: focusedColumnName } = focus;

  if (focusedColumnName === columnName) {
    initFocus(store);
  }
  initSelection(store);

  unfilter(store, columnName);
  unsort(store, columnName);

  setColumnsHiddenValue(columnName, allColumnMap, true);
}

export function showColumn({ column }: Store, columnName: string) {
  const { allColumnMap } = column;

  setColumnsHiddenValue(columnName, allColumnMap, false);
}

export function setComplexColumnHeaders(store: Store, complexColumnHeaders: ComplexColumnInfo[]) {
  store.column.complexColumnHeaders = complexColumnHeaders;
}

export function changeColumnHeadersByName({ column }: Store, columnsMap: Dictionary<string>) {
  const { complexColumnHeaders, allColumnMap } = column;

  Object.keys(columnsMap).forEach(columnName => {
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
