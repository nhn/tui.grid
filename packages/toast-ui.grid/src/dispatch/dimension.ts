import { Store } from '@t/store';

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

export function setOffsetTop(store: Store, offsetTop: number) {
  store.dimension.offsetTop = offsetTop;
}

export function setOffsetLeft(store: Store, offsetLeft: number) {
  store.dimension.offsetLeft = offsetLeft;
}

export function setHeaderHeight(store: Store, height: number) {
  store.dimension.headerHeight = height;
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
    const { paddingTop, paddingBottom } = getComputedStyle(parentEl);

    setHeight(store, parentEl.clientHeight - (parseFloat(paddingTop) + parseFloat(paddingBottom)));
  }
}

export function setAutoBodyHeight({ dimension, rowCoords }: Store) {
  const { totalRowHeight } = rowCoords;
  const { autoHeight, scrollXHeight, minBodyHeight } = dimension;

  if (autoHeight) {
    dimension.bodyHeight = Math.max(totalRowHeight + scrollXHeight, minBodyHeight);
  }
}
