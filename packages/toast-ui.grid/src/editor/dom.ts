import { GridRectForDropDownLayerPos, LayerPos } from '@t/editor';
import { isBetween } from '../helper/common';
import { findParentByClassName } from '../helper/dom';

const INDENT = 5;
const SCROLL_BAR_WIDTH = 17;
const SCROLL_BAR_HEIGHT = 17;

function exceedGridViewport(
  top: number,
  left: number,
  { bodyHeight, bodyWidth, headerHeight, leftSideWidth }: GridRectForDropDownLayerPos
) {
  return !(
    isBetween(top, headerHeight, bodyHeight + headerHeight) &&
    isBetween(left, leftSideWidth, bodyWidth)
  );
}

export function setOpacity(el: HTMLElement, opacity: number | string) {
  el.style.opacity = String(opacity);
}

export function getContainerElement(el: HTMLElement) {
  return findParentByClassName(el, 'container')!;
}

export function moveLayer(
  layerEl: HTMLElement,
  initLayerPos: LayerPos,
  gridRect: GridRectForDropDownLayerPos
) {
  const { top, left } = initLayerPos;
  const { initBodyScrollTop, initBodyScrollLeft, bodyScrollTop, bodyScrollLeft } = gridRect;
  const newTop = top + initBodyScrollTop - bodyScrollTop;
  const newLeft = left + initBodyScrollLeft - bodyScrollLeft;

  if (exceedGridViewport(newTop, newLeft, gridRect)) {
    layerEl.style.zIndex = '-100';
    layerEl.style.top = '0px';
    layerEl.style.left = '0px';
  } else {
    layerEl.style.zIndex = '';
    layerEl.style.top = `${newTop}px`;
    layerEl.style.left = `${newLeft}px`;
  }
}

export function setLayerPosition(
  innerEl: HTMLElement,
  layerEl: HTMLElement,
  childEl?: HTMLElement,
  startBottom = false
) {
  const containerRect = getContainerElement(innerEl).getBoundingClientRect();
  const { innerHeight, innerWidth } = window;
  const { left, top, bottom } = innerEl.getBoundingClientRect();
  const { height: layerHeight, width: layerWidth } = layerEl.getBoundingClientRect();
  const layerTop = startBottom ? bottom : top + INDENT;
  let childElHeight = 0;
  let childElWidth = 0;

  if (childEl) {
    const { height, width } = childEl.getBoundingClientRect();
    childElHeight = height;
    childElWidth = width;
  }
  const totalHeight = layerHeight + childElHeight;
  const totalWidth = layerWidth || childElWidth;

  layerEl.style.top = `${
    (layerTop + totalHeight > innerHeight - SCROLL_BAR_WIDTH
      ? innerHeight - totalHeight - INDENT - SCROLL_BAR_WIDTH
      : layerTop) - containerRect.top
  }px`;

  layerEl.style.left = `${
    (left + totalWidth > innerWidth - SCROLL_BAR_HEIGHT
      ? innerWidth - totalWidth - INDENT - SCROLL_BAR_HEIGHT
      : left) - containerRect.left
  }px`;
}
