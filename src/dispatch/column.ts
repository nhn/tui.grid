import { Store, Side, ComplexColumnInfo, ViewRow } from '../store/types';
import { OptColumn } from '../types';
import { createColumn, getRelationColumns } from '../store/column';
import { createViewRow, generateDataCreationKey } from '../store/data';
import GridEvent from '../event/gridEvent';
import { getEventBus } from '../event/eventBus';
import { initFocus } from './focus';
import { addColumnSummaryValues } from './summary';
import { isObservable } from '../helper/observable';
import { unsort } from './sort';

export function setFrozenColumnCount({ column }: Store, count: number) {
  column.frozenCount = count;
}

export function setColumnWidth({ column, id }: Store, side: Side, index: number, width: number) {
  const columnItem = column.visibleColumnsBySideWithRowHeader[side][index];
  const eventBus = getEventBus(id);
  const gridEvent = new GridEvent({
    columnName: columnItem.name,
    width
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
    columnItem.baseWidth = width;
    columnItem.fixedWidth = true;
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
      acc.concat(getRelationColumns(relations)).filter((columnName, index) => {
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
      column.headerAlignInfo
    )
  );

  initFocus(store);

  const dataCreationKey = generateDataCreationKey();

  column.allColumns = [...rowHeaders, ...columnInfos];
  const { allColumnMap, treeColumnName, treeIcon } = column;

  data.rawData = data.rawData.map(row => {
    row.uniqueKey = `${dataCreationKey}-${row.rowKey}`;
    return row;
  });
  data.viewData = data.rawData.map(row =>
    isObservable(row)
      ? createViewRow(row, allColumnMap, data.rawData, treeColumnName, treeIcon)
      : ({ rowKey: row.rowKey, sortKey: row.sortKey, uniqueKey: row.uniqueKey } as ViewRow)
  );
  unsort(store);
  addColumnSummaryValues(store);
}

export function resetColumnWidths({ column }: Store, widths: number[]) {
  column.visibleColumns.forEach((columnInfo, idx) => {
    columnInfo.baseWidth = widths[idx];
  });
}

export function hideColumn({ column }: Store, columnName: string) {
  const columnItem = column.allColumnMap[columnName];

  if (columnItem) {
    columnItem.hidden = true;
  }
}

export function showColumn({ column }: Store, columnName: string) {
  const columnItem = column.allColumnMap[columnName];

  if (columnItem) {
    columnItem.hidden = false;
  }
}

export function setComplexHeaderColumns(store: Store, complexHeaderColumns: ComplexColumnInfo[]) {
  store.column.complexHeaderColumns = complexHeaderColumns;
}
