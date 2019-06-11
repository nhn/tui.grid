import { Store } from '../store/types';

export function setWidth({ dimension }: Store, width: number, autoWidth: boolean) {
  dimension.autoWidth = autoWidth;
  dimension.width = width;
}

export function setHeight({ dimension }: Store, height: number) {
  const { headerHeight, summaryHeight, tableBorderWidth } = dimension;

  dimension.bodyHeight = height - headerHeight - summaryHeight - tableBorderWidth;
}

export function setBodyHeight({ dimension }: Store, bodyHeight: number) {
  dimension.autoHeight = false;
  dimension.bodyHeight = Math.max(bodyHeight, dimension.minBodyHeight);
}

export function setOffsetTop({ dimension }: Store, offsetTop: number) {
  dimension.offsetTop = offsetTop;
}

export function setOffsetLeft({ dimension }: Store, offsetLeft: number) {
  dimension.offsetLeft = offsetLeft;
}

export function refreshLayout(store: Store, containerEl: HTMLElement, parentEl: HTMLElement) {
  const { dimension } = store;
  const { autoWidth, fitToParentHeight } = dimension;
  const { clientHeight, clientWidth, scrollTop, scrollLeft } = containerEl;
  const { top, left } = containerEl.getBoundingClientRect();

  setOffsetTop(store, top + scrollTop);
  setOffsetLeft(store, left + scrollLeft);
  setWidth(store, clientWidth, autoWidth);

  if (fitToParentHeight && parentEl && parentEl.clientHeight !== clientHeight) {
    setHeight(store, parentEl.clientHeight);
  }
}
