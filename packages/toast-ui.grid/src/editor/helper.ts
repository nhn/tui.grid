const INDENT = 5;
const EDITOR_TOP_DIFF = 7;
const SCROLL_BAR_WIDTH = 17;
const SCROLL_BAR_HEIGHT = 17;

export function setWrapperPosition(
  el: HTMLElement,
  wrapper: HTMLElement,
  childEl?: HTMLElement,
  startBottom = false
) {
  const { innerHeight, innerWidth } = window;
  const { left, top, bottom } = el.getBoundingClientRect();
  const { height: wrapperHeight, width: wrapperWidth } = wrapper.getBoundingClientRect();
  const wrapperTop = startBottom ? bottom : top - EDITOR_TOP_DIFF;
  let childElHeight = 0;
  let childElWidth = 0;

  if (childEl) {
    const { height, width } = childEl.getBoundingClientRect();
    childElHeight = height;
    childElWidth = width;
  }

  wrapper.style.top = `${
    wrapperTop + wrapperHeight + childElHeight > innerHeight - SCROLL_BAR_WIDTH
      ? innerHeight - wrapperHeight - childElHeight - INDENT - SCROLL_BAR_WIDTH
      : wrapperTop
  }px`;

  wrapper.style.left = `${
    left + wrapperWidth + childElWidth > innerWidth - SCROLL_BAR_HEIGHT
      ? innerWidth - wrapperWidth - childElWidth - INDENT - SCROLL_BAR_HEIGHT
      : left
  }px`;
}
