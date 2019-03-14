import { Store, Range } from '../store/types';
import { SetScrollAction } from './types';
import { arrayEqual } from '../helper/common';

function getRowRange(rowOffsets: number[], bodyHeight: number, scrollY: number): Range {
  const start = indexOfRow(rowOffsets, scrollY);
  const end = indexOfRow(rowOffsets, scrollY + bodyHeight) + 1

  return [start, end];
}

function indexOfRow(rowOffsets: number[], posY: number) {
  return rowOffsets.findIndex(offset => offset > posY) - 1;
}

export function setScroll(store: Store, action: SetScrollAction) {
  const { scrollX, scrollY } = action;
  const { viewport, dimension, data } = store;

  if (viewport.scrollX !== scrollX) {
    viewport.scrollX = scrollX;
  }

  if (viewport.scrollY !== scrollY) {
    viewport.scrollY = scrollY;

    const { rowOffsets, bodyHeight } = dimension;
    const rowRange = getRowRange(rowOffsets, bodyHeight, scrollY);

    if (!arrayEqual(viewport.rowRange, rowRange)) {
      viewport.rowRange = rowRange
      viewport.rowsR = data.slice(...rowRange);
      viewport.offsetY = rowOffsets[rowRange[0]];
    }
  }
};