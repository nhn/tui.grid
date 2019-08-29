import { Store, Side, ComplexColumnInfo } from '../store/types';
import { OptColumn } from '../types';
import { createColumn, getRelationColumns } from '../store/column';
import { createViewRow } from '../store/data';
import GridEvent from '../event/gridEvent';
import { getEventBus } from '../event/eventBus';
import { initFocus } from './focus';
import { addColumnSummaryValues } from './summary';

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
  const { column, data, focus } = store;
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
  const { rawData } = data;

  focus.editingAddress = null;

  // to render the grid for new data after destroying editing cell on DOM
  setTimeout(() => {
    initFocus(store);

    column.allColumns = [...rowHeaders, ...columnInfos];

    data.viewData.forEach(viewRow => {
      if (Array.isArray(viewRow.__unobserveFns__)) {
        viewRow.__unobserveFns__.forEach(fn => fn());
      }
    });
    data.viewData = rawData.map(row => createViewRow(row, column.allColumnMap, rawData));
    addColumnSummaryValues(store);
  });
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
