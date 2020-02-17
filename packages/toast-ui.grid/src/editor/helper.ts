import { cls } from '../helper/dom';

const INDENT = 5;
const EDITOR_TOP_DIFF = 4;

function getTopPos(totalHeight: number, topDiff: number, baseHeight: number, wrapperTop: number) {
  return totalHeight > baseHeight ? baseHeight - topDiff : wrapperTop;
}

export function setWrapperPosition(
  el: HTMLElement,
  wrapper: HTMLElement,
  childEl?: HTMLElement,
  startBottom = false
) {
  // To prevent display the layer before calculating the position
  wrapper.style.opacity = '0';

  // Use setTimeout to wait until the DOM element is actually mounted or updated.
  // For example, when start editing the cell with scroll,
  // grid needs to wait for detecting the accurate scrolling position.
  setTimeout(() => {
    const { innerWidth, innerHeight } = window;
    const { top: bottomScrollTop } = document
      .querySelector(`.${cls('scrollbar-right-bottom')}`)!
      .getBoundingClientRect();
    const { left: frozenLeft } = document
      .querySelector(`.${cls('frozen-border')}`)!
      .getBoundingClientRect();
    const { left, top, bottom } = el.getBoundingClientRect();

    const wrapperTop = startBottom ? bottom : top + EDITOR_TOP_DIFF;
    const { height: wrapperHeight, width: wrapperWidth } = wrapper.getBoundingClientRect();
    let childElHeight = 0;
    let childElWidth = 0;

    if (childEl) {
      const { height, width } = childEl.getBoundingClientRect();
      childElHeight = height;
      childElWidth = width;
    }

    // To prevent editing layer to be cut by bottom line or summary area,
    // compare the calulated top position with `window.innerHeight` and the calulated top position with scroll bottom line
    const totalHeight = wrapperTop + wrapperHeight + childElHeight;
    const topDiff = wrapperHeight + childElHeight + INDENT;
    const topPosWithInnerHeight = getTopPos(totalHeight, topDiff, innerHeight, wrapperTop);
    const topPosWithBottomScrollTop = getTopPos(totalHeight, topDiff, bottomScrollTop, wrapperTop);
    const topPos =
      topPosWithInnerHeight > topPosWithBottomScrollTop
        ? topPosWithBottomScrollTop
        : topPosWithInnerHeight;

    wrapper.style.top = `${topPos < 0 ? INDENT : topPos}px`;

    const layerWidth = wrapperWidth || childElWidth;
    // To prevent editing layer to be cut by left area or frozen border,
    // compare the calulated left position with `window.innerWidth` and the calulated left position with frozen border
    const leftPos = left + layerWidth > innerWidth ? innerWidth - layerWidth - INDENT : left;

    wrapper.style.left = `${leftPos < frozenLeft ? frozenLeft : leftPos}px`;

    wrapper.style.opacity = '1';
  });
}
