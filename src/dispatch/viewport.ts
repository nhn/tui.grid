import { Rect, Side, Store } from '../store/types';

interface TargetPosition {
  cellPosRect: Rect;
  side: Side;
}

interface ScrollPosition {
  scrollLeft: number;
  scrollTop: number;
}

interface BodySize {
  height: number;
  rSideWidth: number;
}

interface ScrollDirection {
  isUp: boolean;
  isDown: boolean;
  isLeft: boolean;
  isRight: boolean;
}

export function setScrollLeft({ viewport }: Store, scrollLeft: number) {
  viewport.scrollLeft = scrollLeft;
}

export function setScrollTop({ viewport }: Store, scrollTop: number) {
  viewport.scrollTop = scrollTop;
}

function judgeScrollDirection(
  { cellPosRect, side }: TargetPosition,
  { scrollLeft, scrollTop }: ScrollPosition,
  { height, rSideWidth }: BodySize
) {
  let isLeft = false;
  let isRight = false;
  const { top, bottom, left, right } = cellPosRect;
  const isUp = top < scrollTop;
  const isDown = !isUp && bottom > scrollTop + height;

  if (side === 'R') {
    isLeft = left < scrollLeft;
    isRight = !isLeft && right > scrollLeft + rSideWidth - 1;
  }

  return {
    isUp,
    isDown,
    isLeft,
    isRight
  };
}

function makeScrollPosition(
  { isUp, isDown, isLeft, isRight }: ScrollDirection,
  { cellPosRect: { top, bottom, left, right } }: TargetPosition,
  { height, rSideWidth }: BodySize
) {
  let scrollTop, scrollLeft;

  if (isUp) {
    scrollTop = top + 1;
  } else if (isDown) {
    scrollTop = bottom - height + 1;
  }

  if (isLeft) {
    scrollLeft = left;
  } else if (isRight) {
    scrollLeft = right - rSideWidth + 1;
  }

  return {
    scrollTop,
    scrollLeft
  };
}

export function setScrollPosition(store: Store) {
  const {
    dimension: { bodyHeight, scrollbarWidth },
    columnCoords: {
      areaWidth: { R: rSideWidth }
    },
    focus: { cellPosRect, side },
    viewport: { scrollLeft, scrollTop }
  } = store;

  if (cellPosRect === null || side === null) {
    return;
  }

  const bodySize = {
    height: bodyHeight - scrollbarWidth,
    rSideWidth: rSideWidth - scrollbarWidth
  };

  const targetPosition = {
    cellPosRect,
    side
  };

  const scrollPosition = {
    scrollLeft,
    scrollTop
  };

  const scrollDriection = judgeScrollDirection(targetPosition, scrollPosition, bodySize);
  const { scrollLeft: changedScrollLeft, scrollTop: changedScrollTop } = makeScrollPosition(
    scrollDriection,
    targetPosition,
    bodySize
  );

  if (typeof changedScrollLeft !== 'undefined') {
    store.viewport.scrollLeft = changedScrollLeft;
  }
  if (typeof changedScrollTop !== 'undefined') {
    store.viewport.scrollTop = changedScrollTop;
  }
}
