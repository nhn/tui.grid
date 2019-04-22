import { Store, Side } from '../store/types';

export function setFocusActive({ focus }: Store, active: boolean) {
  focus.active = active;
}

interface MouseEventInfo {
  offsetX: number;
  offsetY: number;
  side: Side;
  shiftKey: boolean;
}

function findPrevIndex<T>(arr: T[], pred: (_: T) => boolean): number {
  const index = arr.findIndex(pred);

  return index >= 0 ? index - 1 : arr.length - 1;
}

function findOffsetIndex(offsets: number[], targetOffset: number) {
  return findPrevIndex(offsets, (offset) => offset > targetOffset);
}

export function mouseDownBody(store: Store, eventInfo: MouseEventInfo) {
  const { data, column, columnCoords, rowCoords, focus } = store;
  const { offsetX, offsetY, side } = eventInfo;

  const rowIndex = findOffsetIndex(rowCoords.offsets, offsetY);
  const columnIndex = findOffsetIndex(columnCoords.offsets[side], offsetX);

  focus.rowKey = data.viewData[rowIndex].rowKey;
  focus.columnName = column.visibleColumns[side][columnIndex].name;
}
