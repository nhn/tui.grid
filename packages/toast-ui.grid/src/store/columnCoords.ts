import { ColumnInfo, Column } from '@t/store/column';
import { Dimension } from '@t/store/dimension';
import { ColumnCoords } from '@t/store/columnCoords';
import { observable } from '../helper/observable';
import { sum, findIndexes, pipe, mapProp, last } from '../helper/common';

function distributeExtraWidthEqually(extraWidth: number, targetIdxes: number[], widths: number[]) {
  const targetLen = targetIdxes.length;
  const avgValue = Math.round(extraWidth / targetLen);
  const errorValue = avgValue * targetLen - extraWidth; // to correct total width
  const result = [...widths];

  targetIdxes.forEach((idx) => {
    result[idx] += avgValue;
  });

  if (targetLen) {
    result[targetIdxes[targetLen - 1]] -= errorValue;
  }

  return result;
}

function fillEmptyWidth(contentWidth: number, widths: number[]) {
  const remainTotalWidth = contentWidth - sum(widths);
  const emptyIndexes = findIndexes((width) => !width, widths);

  return distributeExtraWidthEqually(remainTotalWidth, emptyIndexes, widths);
}

function applyMinimumWidth(minWidths: number[], widths: number[]) {
  return widths.map((width, index) => Math.max(width, minWidths[index]));
}

function reduceExcessColumnWidthSub(
  totalRemainWidth: number,
  availableList: [number, number][],
  widths: number[]
): number[] {
  const avgValue = Math.round(totalRemainWidth / availableList.length);
  const newAvailableList: [number, number][] = [];

  availableList.forEach(([index, width]) => {
    // note that totalRemainWidth and avgValue are negative number.
    if (width < Math.abs(avgValue)) {
      totalRemainWidth += width;
      widths[index] -= width;
    } else {
      newAvailableList.push([index, width]);
    }
  });
  // call recursively until all available width are less than average
  if (availableList.length > newAvailableList.length) {
    return reduceExcessColumnWidthSub(totalRemainWidth, newAvailableList, widths);
  }
  const columnIndexes = availableList.map(([index]) => index);

  return distributeExtraWidthEqually(totalRemainWidth, columnIndexes, widths);
}

function adjustWidths(
  minWidths: number[],
  fixedFlags: boolean[],
  availableWidth: number,
  fitToReducedTotal: boolean,
  widths: number[]
) {
  const columnLength = widths.length;
  const totalExtraWidth = availableWidth - sum(widths);
  const fixedCount = fixedFlags.filter(Boolean).length;
  const fixedIndexes = findIndexes((v) => !v, fixedFlags);

  if (totalExtraWidth > 0 && columnLength > fixedCount) {
    return distributeExtraWidthEqually(totalExtraWidth, fixedIndexes, widths);
  }

  if (fitToReducedTotal && totalExtraWidth < 0) {
    const availableWidthInfos = fixedIndexes.map(
      (index) => [index, widths[index] - minWidths[index]] as [number, number]
    );
    return reduceExcessColumnWidthSub(totalExtraWidth, availableWidthInfos, widths);
  }

  return widths;
}

function calculateWidths(columns: ColumnInfo[], cellBorderWidth: number, contentsWidth: number) {
  const baseWidths = columns.map(({ baseWidth }) => (baseWidth ? baseWidth - cellBorderWidth : 0));
  const minWidths = columns.map(({ minWidth }) => minWidth - cellBorderWidth);
  const fixedFlags = mapProp('fixedWidth', columns);

  return pipe(
    baseWidths,
    fillEmptyWidth.bind(null, contentsWidth),
    applyMinimumWidth.bind(null, minWidths),
    adjustWidths.bind(null, minWidths, fixedFlags, contentsWidth, true)
  );
}

function calculateOffsets(widths: number[], borderWidth: number) {
  const offsets = [0];
  for (let i = 1, len = widths.length; i < len; i += 1) {
    offsets[i] = offsets[i - 1] + widths[i - 1] + borderWidth;
  }

  return offsets;
}

interface ColumnCoordsOption {
  column: Column;
  dimension: Dimension;
}

export function create({ column, dimension }: ColumnCoordsOption) {
  return observable<ColumnCoords>({
    get widths() {
      const { visibleColumnsWithRowHeader, visibleFrozenCount } = column;
      const widths = calculateWidths(
        visibleColumnsWithRowHeader,
        dimension.cellBorderWidth,
        dimension.contentsWidth
      );

      return {
        L: widths.slice(0, visibleFrozenCount),
        R: widths.slice(visibleFrozenCount),
      };
    },

    get offsets() {
      return {
        L: calculateOffsets(this.widths.L, dimension.cellBorderWidth),
        R: calculateOffsets(this.widths.R, dimension.cellBorderWidth),
      };
    },

    get areaWidth() {
      const { visibleFrozenCount } = column;
      const { width, frozenBorderWidth, cellBorderWidth } = dimension;
      let leftAreaWidth = 0;

      if (visibleFrozenCount) {
        const leftBorderWidth = (visibleFrozenCount + 1) * cellBorderWidth;
        leftAreaWidth = sum(this.widths.L) + leftBorderWidth;
      }

      return {
        L: leftAreaWidth - frozenBorderWidth,
        R: width - leftAreaWidth,
      };
    },

    get totalColumnWidth() {
      return {
        L: last(this.offsets.L) + last(this.widths.L),
        R: last(this.offsets.R) + last(this.widths.R),
      };
    },
  });
}
