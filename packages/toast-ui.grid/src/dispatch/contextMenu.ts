import { Store } from '@t/store';
import { MenuPos } from '@t/store/contextMenu';
import { Range } from '@t/store/selection';
import { execCopy } from './clipboard';

export function setContextMenuPos({ contextMenu }: Store, pos: MenuPos | null) {
  contextMenu.pos = pos;
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
