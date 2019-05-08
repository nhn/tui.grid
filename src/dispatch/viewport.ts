import { Rect, Side, Store } from '../store/types';

export function setScrollLeft({ viewport }: Store, scrollLeft: number) {
  viewport.scrollLeft = scrollLeft;
}

export function setScrollTop({ viewport }: Store, scrollTop: number) {
  viewport.scrollTop = scrollTop;
}

function getHorizontalScrollPosition(
  side: Side,
  rSideWidth: number,
  cellPosRect: Rect,
  scrollLeft: number,
  tableBorderWidth: number
) {
  let changedScrollLeft;
  let isLeft = false;
  let isRight = false;
  const { left, right } = cellPosRect;
  if (side === 'R') {
    isLeft = left < scrollLeft;
    isRight = !isLeft && right > scrollLeft + rSideWidth - tableBorderWidth;
  }

  if (isLeft) {
    changedScrollLeft = left;
  } else if (isRight) {
    changedScrollLeft = right - rSideWidth + tableBorderWidth;
  }

  return changedScrollLeft;
}

function getVerticalScrollPosition(
  height: number,
  cellPosRect: Rect,
  scrollTop: number,
  tableBorderWidth: number
) {
  const { top, bottom } = cellPosRect;
  const isUp = top < scrollTop;
  const isDown = !isUp && bottom > scrollTop + height;
  let changedScrollTop;

  if (isUp) {
    changedScrollTop = top + tableBorderWidth;
  } else if (isDown) {
    changedScrollTop = bottom - height + tableBorderWidth;
  }

  return changedScrollTop;
}

export function setScrollPosition(store: Store) {
  const {
    dimension: { bodyHeight, scrollbarWidth, tableBorderWidth },
    columnCoords: {
      areaWidth: { R: rSideWidth }
    },
    focus: { cellPosRect, side },
    viewport: { scrollLeft, scrollTop }
  } = store;

  if (cellPosRect === null || side === null) {
    return;
  }

  const changedScrollLeft = getHorizontalScrollPosition(
    side,
    rSideWidth - scrollbarWidth,
    cellPosRect,
    scrollLeft,
    tableBorderWidth
  );
  const changedScrollTop = getVerticalScrollPosition(
    bodyHeight - scrollbarWidth,
    cellPosRect,
    scrollTop,
    tableBorderWidth
  );

  if (typeof changedScrollLeft !== 'undefined') {
    store.viewport.scrollLeft = changedScrollLeft;
  }
  if (typeof changedScrollTop !== 'undefined') {
    store.viewport.scrollTop = changedScrollTop;
  }
}
