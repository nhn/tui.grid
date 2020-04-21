import { findParent } from '../helper/dom';

const INDENT = 5;
const SCROLL_BAR_WIDTH = 17;
const SCROLL_BAR_HEIGHT = 17;

export function getContainerElement(el: HTMLElement) {
  return findParent(el, 'container')!;
}

export function setLayerPosition(
  innerEl: HTMLElement,
  layerEl: HTMLElement,
  childEl?: HTMLElement,
  startBottom = false
) {
  // To hide the initial layer which is having the position which is not calculated properly
  layerEl.style.opacity = '0';

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

  layerEl.style.top = `${(layerTop + totalHeight > innerHeight - SCROLL_BAR_WIDTH
    ? innerHeight - totalHeight - INDENT - SCROLL_BAR_WIDTH
    : layerTop) - containerRect.top}px`;

  layerEl.style.left = `${(left + totalWidth > innerWidth - SCROLL_BAR_HEIGHT
    ? innerWidth - totalWidth - INDENT - SCROLL_BAR_HEIGHT
    : left) - containerRect.left}px`;

  layerEl.style.opacity = '1';
}
