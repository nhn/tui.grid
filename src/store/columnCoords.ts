import { ColumnCoords, Column, Dimension } from './types';
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

function fillEmptyWidth(containerWidth: number, widths: number[]) {
  const remainTotalWidth = containerWidth - sum(widths);
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
  let columnIndexes;

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
  columnIndexes = availableList.map(([index]) => index);

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
      (index) => <[number, number]>[index, widths[index] - minWidths[index]]
    );
    result = reduceExcessColumnWidthSub(totalExtraWidth, availableWidthInfos, widths);
  } else {
    result = widths;
  }

  return result;
}

function calculateWidths(columns: Column[], containerWidth: number) {
  const baseWidths = mapProp('baseWidth', columns);
  const minWidths = mapProp('minWidth', columns);
  const fixedFlags = mapProp('fixedWidth', columns);
  const availableWidth = containerWidth;

  return pipe(
    baseWidths,
    fillEmptyWidth.bind(null, availableWidth),
    applyMinimumWidth.bind(null, minWidths),
    adjustWidths.bind(null, minWidths, fixedFlags, availableWidth, true)
  );
}

export function create(columns: Column[], dimension: Dimension): ColumnCoords {
  return reactive<any>({
    get widths(this: ColumnCoords) {
      return calculateWidths(columns, dimension.width);
    }
  });
}
