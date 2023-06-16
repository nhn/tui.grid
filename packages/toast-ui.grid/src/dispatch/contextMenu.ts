import { Store } from '@t/store';
import { MenuPos } from '@t/store/contextMenu';
import { PagePosition, Range } from '@t/store/selection';
import { ElementInfo } from '@t/dispatch';
import { execCopy } from './clipboard';
import { execExport } from './export';
import { findOffsetIndex } from '../helper/common';
import { getRowKeyByIndexWithPageRange } from '../query/data';

export function showContextMenu(
  { contextMenu, data, column, columnCoords, rowCoords }: Store,
  pos: MenuPos,
  elementInfo: ElementInfo,
  eventInfo: PagePosition
) {
  const { pageX, pageY } = eventInfo;
  const { visibleColumnsBySideWithRowHeader } = column;

  const { side, scrollLeft, scrollTop, left, top } = elementInfo;
  const offsetLeft = pageX - left + scrollLeft;
  const offsetTop = pageY - top + scrollTop;

  const columnIndex = findOffsetIndex(columnCoords.offsets[side], offsetLeft);
  const columnName = visibleColumnsBySideWithRowHeader[side][columnIndex].name;

  const rowIndex = findOffsetIndex(rowCoords.offsets, offsetTop);
  const rowKey = getRowKeyByIndexWithPageRange(data, rowIndex);

  contextMenu.posInfo = { pos, rowKey, columnName };
}

export function hideContextMenu({ contextMenu }: Store) {
  contextMenu.posInfo = null;
}

export function copy(store: Store) {
  execCopy(store);
}

export function copyColumns(store: Store) {
  const { data, selection, focus } = store;
  const { originalRange } = selection;

  const columnRange: Range = originalRange
    ? [originalRange.column[0], originalRange.column[1]]
    : [focus.totalColumnIndex!, focus.totalColumnIndex!];
  const rowRange: Range = [0, data.filteredRawData.length - 1];

  execCopy(store, { rowRange, columnRange });
}

export function copyRows(store: Store) {
  const { selection, focus, column } = store;
  const { originalRange } = selection;

  const columnRange: Range = [0, column.visibleColumnsWithRowHeader.length - 1];
  const rowRange: Range = originalRange
    ? [originalRange.row[0], originalRange.row[1]]
    : [focus.originalRowIndex!, focus.originalRowIndex!];

  execCopy(store, { rowRange, columnRange });
}

export function csvExport(store: Store) {
  execExport(store, 'csv');
}

export function excelExport(store: Store) {
  execExport(store, 'xlsx');
}

export function txtExport(store: Store) {
  execExport(store, 'txt');
}
