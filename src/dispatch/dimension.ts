import { Store } from '../store/types';
import { notify } from '../helper/observable';

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

export function setRowHeight({ rowCoords }: Store, rowIndex: number, rowHeight: number) {
  rowCoords.heights[rowIndex] = rowHeight;
  notify(rowCoords, 'heights');
}
