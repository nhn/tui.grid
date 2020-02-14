const INDENT = 5;
const EDITOR_TOP_DIFF = 4;
const SCROLL_BAR_Y_WIDTH = 17;
const SCROLL_BAR_X_HEIGHT = 17;

export function setWrapperPosition(
  el: HTMLElement,
  wrapper: HTMLElement,
  childEl?: HTMLElement,
  startBottom = false
) {
  const { innerHeight, innerWidth } = window;
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

  wrapper.style.top = `${
    wrapperTop + wrapperHeight + childElHeight > innerHeight - SCROLL_BAR_X_HEIGHT
      ? innerHeight - wrapperHeight - childElHeight - INDENT - SCROLL_BAR_X_HEIGHT
      : wrapperTop
  }px`;

  const layerWidth = wrapperWidth || childElWidth;
  wrapper.style.left = `${
    left + layerWidth > innerWidth - SCROLL_BAR_Y_WIDTH
      ? innerWidth - layerWidth - INDENT - SCROLL_BAR_Y_WIDTH
      : left
  }px`;
}
