import { Dictionary } from '../store/types';

type CellHeightMap = Dictionary<Dictionary<number>>;

export function getHighestHeight(cellHeightMap: CellHeightMap, rowIndex: number) {
  const cellHeights = cellHeightMap[rowIndex];

  return Object.keys(cellHeights).reduce(
    (acc, columnName) => Math.max(acc, cellHeights[columnName]),
    -1
  );
}

export function setCellHeight(
  cellHeightMap: CellHeightMap,
  columnName: string,
  rowIndex: number,
  height: number,
  defaultRowHeight: number
) {
  if (!cellHeightMap[rowIndex]) {
    cellHeightMap[rowIndex] = {};
  }

  cellHeightMap[rowIndex][columnName] = Math.max(height, defaultRowHeight);
}

export function removeCellHeight(cellHeightMap: CellHeightMap, rowIndex: number) {
  delete cellHeightMap[rowIndex];
}
