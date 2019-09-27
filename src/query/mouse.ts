import { Dimension, DragData, Side, Store } from '../store/types';
import { findOffsetIndex } from '../helper/common';
import { ScrollData } from '../dispatch/mouse';

type ViewInfo = DragData & ScrollData;

export type ElementInfo = {
  side: Side;
  top: number;
  left: number;
} & ScrollData;

export function getPositionFromBodyArea(pageX: number, pageY: number, dimension: Dimension) {
  const {
    offsetLeft,
    offsetTop,
    tableBorderWidth,
    cellBorderWidth,
    headerHeight,
    summaryHeight,
    summaryPosition
  } = dimension;
  const adjustedSummaryHeight = summaryPosition === 'top' ? summaryHeight : 0;

  return {
    x: pageX - offsetLeft,
    y:
      pageY -
      (offsetTop + headerHeight + adjustedSummaryHeight + cellBorderWidth + tableBorderWidth)
  };
}

function getTotalColumnOffsets(widths: { [key in Side]: number[] }, cellBorderWidth: number) {
  const totalWidths = [...widths.L, ...widths.R];
  const offsets = [0];
  for (let i = 1, len = totalWidths.length; i < len; i += 1) {
    offsets.push(offsets[i - 1] + totalWidths[i - 1] + cellBorderWidth);
  }

  return offsets;
}

function getScrolledPosition(
  { pageX, pageY, scrollLeft, scrollTop }: ViewInfo,
  dimension: Dimension,
  leftSideWidth: number
) {
  const { x: bodyPositionX, y: bodyPositionY } = getPositionFromBodyArea(pageX, pageY, dimension);
  const scrollX = bodyPositionX > leftSideWidth ? scrollLeft : 0;
  const scrolledPositionX = bodyPositionX + scrollX;
  const scrolledPositionY = bodyPositionY + scrollTop;

  return {
    x: scrolledPositionX,
    y: scrolledPositionY
  };
}

export function getColumnNameRange(
  store: Store,
  dragStartData: DragData,
  dragData: DragData,
  elementInfo: ElementInfo
) {
  const {
    column: { allColumns }
  } = store;
  const { scrollTop, scrollLeft } = elementInfo;

  const { pageX: startPageX, pageY: startPageY } = dragStartData;
  const { pageX: endPageX, pageY: endPageY } = dragData;

  const startViewInfo = { pageX: startPageX, pageY: startPageY, scrollTop, scrollLeft };
  const endViewInfo = { pageX: endPageX, pageY: endPageY, scrollTop, scrollLeft };

  const startColumnIndex = findColumnIndexByPosition(store, startViewInfo);
  const endColumnIndex = findColumnIndexByPosition(store, endViewInfo);

  const { name: startColumnName } = allColumns[startColumnIndex];
  const { name: endColumnName } = allColumns[endColumnIndex];

  return [startColumnName, endColumnName];
}

export function findColumnIndexByPosition(store: Store, viewInfo: ViewInfo) {
  const { dimension, columnCoords } = store;
  const { widths, areaWidth } = columnCoords;
  const totalColumnOffsets = getTotalColumnOffsets(widths, dimension.cellBorderWidth);
  const scrolledPosition = getScrolledPosition(viewInfo, dimension, areaWidth.L);

  return findOffsetIndex(totalColumnOffsets, scrolledPosition.x);
}

export function findRowIndexByPosition(store: Store, viewInfo: ViewInfo) {
  const { dimension, columnCoords, rowCoords } = store;
  const { areaWidth } = columnCoords;
  const scrolledPosition = getScrolledPosition(viewInfo, dimension, areaWidth.L);

  return findOffsetIndex(rowCoords.offsets, scrolledPosition.y);
}
