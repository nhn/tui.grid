import { Store, Side, ComplexColumnInfo } from '../store/types';
import { OptColumn } from '../types';
import { createColumn } from '../store/column';
import { createViewRow } from '../store/data';

export function setFrozenColumnCount({ column }: Store, count: number) {
  column.frozenCount = count;
}

export function setColumnWidth({ column }: Store, side: Side, index: number, width: number) {
  const columnItem = column.visibleColumnsBySide[side][index];

  columnItem.baseWidth = width;
  columnItem.fixedWidth = true;
}

export function setColumns({ column, data }: Store, optColumns: OptColumn[]) {
  const {
    columnOptions,
    copyOptions,
    treeColumnOptions,
    rowHeaders,
    relationColumns
  } = column.dataForColumnCreation;

  const columnInfos = optColumns.map((optColumn) =>
    createColumn(optColumn, columnOptions, relationColumns, copyOptions, treeColumnOptions)
  );

  column.allColumns = [...rowHeaders, ...columnInfos];
  const { allColumnMap } = column;
  const { rawData } = data;

  data.viewData.forEach((viewRow) => {
    viewRow.__unobserveFns__.forEach((fn) => fn());
  });
  data.viewData = rawData.map((row) => createViewRow(row, allColumnMap, rawData));
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
