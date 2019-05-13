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
  dimension.bodyHeight = Math.max(bodyHeight, dimension.minBodyHeight);
}

export function setOffsetTop({ dimension }: Store, offsetTop: number) {
  dimension.offsetTop = offsetTop;
}

export function setOffsetLeft({ dimension }: Store, offsetLeft: number) {
  dimension.offsetLeft = offsetLeft;
}
