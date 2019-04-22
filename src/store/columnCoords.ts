import { ColumnCoords, Column, Dimension, ColumnInfo } from './types';
import { reactive } from '../helper/reactive';
import { sum, findIndexes, pipe, mapProp } from '../helper/common';

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

  let result;

  if (totalExtraWidth > 0 && columnLength > fixedCount) {
    result = distributeExtraWidthEqually(totalExtraWidth, fixedIndexes, widths);
  } else if (fitToReducedTotal && totalExtraWidth < 0) {
    const availableWidthInfos = fixedIndexes.map(
      (index) => [index, widths[index] - minWidths[index]] as [number, number]
    );
    result = reduceExcessColumnWidthSub(totalExtraWidth, availableWidthInfos, widths);
  } else {
    result = widths;
  }

  return result;
}

function calculateWidths(columns: ColumnInfo[], contentWidth: number) {
  const baseWidths = mapProp('baseWidth', columns);
  const minWidths = mapProp('minWidth', columns);
  const fixedFlags = mapProp('fixedWidth', columns);

  return pipe(
    baseWidths,
    fillEmptyWidth.bind(null, contentWidth),
    applyMinimumWidth.bind(null, minWidths),
    adjustWidths.bind(null, minWidths, fixedFlags, contentWidth, true)
  );
}

function calculateOffests(widths: number[], borderWidth: number) {
  const offsets = [0];
  for (let i = 1, len = widths.length; i < len; i += 1) {
    offsets[i] = offsets[i - 1] + widths[i - 1] + borderWidth;
  }

  return offsets;
}

interface ColumnCoordsOptions {
  column: Column;
  dimension: Dimension;
}

export function create({ column, dimension }: ColumnCoordsOptions): ColumnCoords {
  return reactive<ColumnCoords>({
    get widths(this: ColumnCoords) {
      const { visibleColumns, visibleFrozenCount } = column;
      const columns = [...visibleColumns.L, ...visibleColumns.R];
      const widths = calculateWidths(columns, dimension.contentsWidth);

      return {
        L: widths.slice(0, visibleFrozenCount),
        R: widths.slice(visibleFrozenCount)
      };
    },

    get offsets(this: ColumnCoords) {
      return {
        L: calculateOffests(this.widths.L, dimension.cellBorderWidth),
        R: calculateOffests(this.widths.R, dimension.cellBorderWidth)
      };
    },

    get areaWidth(this: ColumnCoords) {
      const { visibleFrozenCount } = column;
      const leftBorderWidth = visibleFrozenCount * dimension.cellBorderWidth;
      const leftAreaWidth = sum(this.widths.L) + leftBorderWidth;

      return {
        L: leftAreaWidth,
        R: dimension.width - leftAreaWidth - dimension.cellBorderWidth
      };
    }
  });
}
