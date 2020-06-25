import { Rect, Side } from '@t/store/focus';
import { Store } from '@t/store';

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

export function getChangedScrollPosition(store: Store, side: Side, changedCellPosRect?: Rect) {
  const {
    dimension: { bodyHeight, scrollXHeight, scrollYWidth, tableBorderWidth },
    columnCoords: { areaWidth },
    focus: { cellPosRect: focusedCellPostRect },
    viewport,
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
