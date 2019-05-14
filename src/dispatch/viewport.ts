import { Rect, Store } from '../store/types';
import { cell } from '../theme/styleGenerator';

export function setScrollLeft({ viewport }: Store, scrollLeft: number) {
  viewport.scrollLeft = scrollLeft;
}

export function setScrollTop({ viewport }: Store, scrollTop: number) {
  viewport.scrollTop = scrollTop;
}

function getHorizontalScrollPosition(
  rSideWidth: number,
  cellPosRect: Rect,
  scrollLeft: number,
  tableBorderWidth: number
) {
  const { left, right } = cellPosRect;

  if (left < scrollLeft) {
    return left;
  }

  if (right > scrollLeft + rSideWidth - tableBorderWidth) {
    return right - rSideWidth + tableBorderWidth;
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

export function setScrollPosition(store: Store, focusShift: boolean) {
  const {
    dimension: { bodyHeight, scrollbarWidth, tableBorderWidth },
    columnCoords: {
      areaWidth: { R: rSideWidth }
    },
    focus,
    viewport: { scrollLeft, scrollTop }
  } = store;

  // @TODO: focusShift 가 아닐 떄 selection rowIndex, columnIndex 기준으로 scroll 이동해야
  const cellPosRect = focusShift ? focus.cellPosRect : null;
  const side = focusShift ? focus.side : null;

  if (cellPosRect === null || side === null) {
    return;
  }

  const changedScrollLeft =
    side === 'R'
      ? getHorizontalScrollPosition(
          rSideWidth - scrollbarWidth,
          cellPosRect,
          scrollLeft,
          tableBorderWidth
        )
      : null;
  const changedScrollTop = getVerticalScrollPosition(
    bodyHeight - scrollbarWidth,
    cellPosRect,
    scrollTop,
    tableBorderWidth
  );

  if (changedScrollLeft !== null) {
    store.viewport.scrollLeft = changedScrollLeft;
  }
  if (changedScrollTop !== null) {
    store.viewport.scrollTop = changedScrollTop;
  }
}
