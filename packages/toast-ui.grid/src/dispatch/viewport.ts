import { Viewport } from '@t/store/viewport';
import { Store } from '@t/store';
import { getChangedScrollPosition } from '../query/viewport';

function setScrollPosition(
  viewport: Viewport,
  changedScrollTop: number | null,
  changedScrollLeft: number | null
) {
  if (changedScrollLeft !== null) {
    viewport.scrollLeft = changedScrollLeft;
  }
  if (changedScrollTop !== null) {
    viewport.scrollTop = changedScrollTop;
  }
}

export function setScrollToFocus(store: Store) {
  const {
    focus: { cellPosRect, side },
    viewport,
  } = store;

  if (cellPosRect === null || side === null) {
    return;
  }

  const [changedScrollLeft, changedScrollTop] = getChangedScrollPosition(store, side);
  setScrollPosition(viewport, changedScrollTop, changedScrollLeft);
}

export function setScrollToSelection(store: Store) {
  const {
    columnCoords: { widths, offsets: columnOffsets },
    rowCoords: { heights, offsets: rowOffsets },
    selection: { inputRange },
    viewport,
  } = store;
  if (!inputRange) {
    return;
  }

  const rowIndex = inputRange.row[1];
  const columnIndex = inputRange.column[1];
  const cellSide = columnIndex > widths.L.length - 1 ? 'R' : 'L';
  const rightSideColumnIndex =
    columnIndex < widths.L.length ? widths.L.length : columnIndex - widths.L.length;
  const left = columnOffsets[cellSide][rightSideColumnIndex];
  const right = left + widths[cellSide][rightSideColumnIndex];
  const top = rowOffsets[rowIndex];
  const bottom = top + heights[rowIndex];

  const cellPosRect = { left, right, top, bottom };
  const [changedScrollLeft, changedScrollTop] = getChangedScrollPosition(
    store,
    cellSide,
    cellPosRect
  );
  setScrollPosition(viewport, changedScrollTop, changedScrollLeft);
}

export function setScrollLeft({ viewport }: Store, scrollLeft: number) {
  viewport.scrollLeft = scrollLeft;
}

export function setScrollTop({ viewport }: Store, scrollTop: number) {
  viewport.scrollTop = scrollTop;
}

export function initScrollPosition({ viewport }: Store) {
  viewport.scrollLeft = 0;
  viewport.scrollTop = 0;
}
