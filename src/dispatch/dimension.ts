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
