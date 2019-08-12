import { Dictionary } from '../store/types';

type CellHeightMap = Dictionary<number[]>;

export function getHighestHeights(cellHeightMap: CellHeightMap, rowIndex: number) {
  const cellHeights = Object.keys(cellHeightMap).map(
    columnName => cellHeightMap[columnName][rowIndex]
  );

  return Math.max(...cellHeights);
}

export function setCellHeight(
  cellHeightMap: CellHeightMap,
  columnName: string,
  rowIndex: number,
  height: number,
  defaultRowHeight: number
) {
  if (!cellHeightMap[columnName]) {
    cellHeightMap[columnName] = [];
  }
  cellHeightMap[columnName][rowIndex] = Math.max(height, defaultRowHeight);
}
