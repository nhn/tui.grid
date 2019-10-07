import { Rect, Store, Viewport, Side } from '../store/types';

function getHorizontalScrollPosition(
  rightSideWidth: number,
  cellPosRect: Rect,
  scrollLeft: number,
  tableBorderWidth: number
) {
  const { left, right } = cellPosRect;

  if (left < scrollLeft) {
    return left;
  }

  if (right > scrollLeft + rightSideWidth - tableBorderWidth) {
    return right - rightSideWidth + tableBorderWidth;
  }

  return null;
}

function getVerticalScrollPosition(
  height: number,
  cellPosRect: Rect,
  scrollTop: number,
  tableBorderWidth: number
) {
  const { top, bottom } = cellPosRect;

  if (top < scrollTop) {
    return top + tableBorderWidth;
  }

  if (bottom > scrollTop + height) {
    return bottom - height + tableBorderWidth;
  }

  return null;
}

function getChangedScrollPosition(store: Store, side: Side, changedCellPosRect?: Rect) {
  const {
    dimension: { bodyHeight, scrollXHeight, scrollYWidth, tableBorderWidth },
    columnCoords: { areaWidth },
    focus: { cellPosRect: focusedCellPostRect },
    viewport
  } = store;

  const { scrollLeft, scrollTop } = viewport;
  const cellPosRect = changedCellPosRect || focusedCellPostRect!;

  const changedScrollLeft =
    side === 'R'
      ? getHorizontalScrollPosition(
          areaWidth.R - scrollYWidth,
          cellPosRect,
          scrollLeft,
          tableBorderWidth
        )
      : null;
  const changedScrollTop = getVerticalScrollPosition(
    bodyHeight - scrollXHeight,
    cellPosRect,
    scrollTop,
    tableBorderWidth
  );

  return [changedScrollLeft, changedScrollTop];
}

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
    viewport
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
    viewport
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
