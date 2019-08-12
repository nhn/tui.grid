import { Dictionary } from '../store/types';

type CellHeightMap = Dictionary<Dictionary<number>>;

export function getHighestHeight(cellHeightMap: CellHeightMap, rowIndex: number) {
  const cellHeights = cellHeightMap[rowIndex];
  let highestHeight = -1;

  Object.keys(cellHeights).forEach(columnName => {
    if (highestHeight < cellHeights[columnName]) {
      highestHeight = cellHeights[columnName];
    }
  });

  return highestHeight;
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
