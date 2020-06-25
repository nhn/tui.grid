import { Side } from '@t/store/focus';
import { Dimension } from '@t/store/dimension';
import { Store } from '@t/store';
import { PagePosition } from '@t/store/selection';
import {
  ViewInfo,
  ContainerPosition,
  BodySize,
  OverflowInfo,
  OverflowType,
  ElementInfo,
} from '@t/dispatch';
import { findOffsetIndex } from '../helper/common';

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
    y: scrolledPositionY,
  };
}

function judgeOverflow(
  { x: containerX, y: containerY }: ContainerPosition,
  { bodyHeight, bodyWidth }: BodySize
): OverflowInfo {
  let overflowY: OverflowType = 0;
  let overflowX: OverflowType = 0;

  if (containerY < 0) {
    overflowY = -1;
  } else if (containerY > bodyHeight) {
    overflowY = 1;
  }

  if (containerX < 0) {
    overflowX = -1;
  } else if (containerX > bodyWidth) {
    overflowX = 1;
  }

  return {
    x: overflowX,
    y: overflowY,
  };
}

function getPositionFromBodyArea(pageX: number, pageY: number, dimension: Dimension) {
  const {
    offsetLeft,
    offsetTop,
    tableBorderWidth,
    cellBorderWidth,
    headerHeight,
    summaryHeight,
    summaryPosition,
  } = dimension;
  const adjustedSummaryHeight = summaryPosition === 'top' ? summaryHeight : 0;

  return {
    x: pageX - offsetLeft,
    y:
      pageY -
      (offsetTop + headerHeight + adjustedSummaryHeight + cellBorderWidth + tableBorderWidth),
  };
}

export function getOverflowFromMousePosition(
  pageX: number,
  pageY: number,
  bodyWidth: number,
  dimension: Dimension
) {
  const { bodyHeight } = dimension;
  const { x, y } = getPositionFromBodyArea(pageX, pageY, dimension);

  return judgeOverflow({ x, y }, { bodyWidth, bodyHeight });
}

export function getColumnNameRange(
  store: Store,
  dragStartData: PagePosition,
  dragData: PagePosition,
  elementInfo: ElementInfo
) {
  const {
    column: { allColumns },
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
