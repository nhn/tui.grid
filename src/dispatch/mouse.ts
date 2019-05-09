import { Store, Side } from '../store/types';
import { findOffsetIndex } from '../helper/common';

export function setNavigating({ focus }: Store, navigating: boolean) {
  focus.navigating = navigating;
}

interface MouseEventInfo {
  offsetX: number;
  offsetY: number;
  side: Side;
  shiftKey: boolean;
}

export function mouseDownBody(store: Store, eventInfo: MouseEventInfo) {
  const { data, column, columnCoords, rowCoords, focus } = store;
  const { offsetX, offsetY, side } = eventInfo;

  const rowIndex = findOffsetIndex(rowCoords.offsets, offsetY);
  const columnIndex = findOffsetIndex(columnCoords.offsets[side], offsetX);

  focus.rowKey = data.viewData[rowIndex].rowKey;
  focus.columnName = column.visibleColumnsBySide[side][columnIndex].name;
}
