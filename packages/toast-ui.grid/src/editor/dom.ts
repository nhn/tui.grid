import { findParentByClassName } from '../helper/dom';

const INDENT = 5;
const SCROLL_BAR_WIDTH = 17;
const SCROLL_BAR_HEIGHT = 17;

export function setOpacity(el: HTMLElement, opacity: number | string) {
  el.style.opacity = String(opacity);
}

export function getContainerElement(el: HTMLElement) {
  return findParentByClassName(el, 'container')!;
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
