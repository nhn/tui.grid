import { Store, RowKey, PagePosition } from '../store/types';
import { notify } from '../helper/observable';
import { findRowIndexByPosition } from '../query/mouse';

export function setHoveredRowKey({ renderState }: Store, rowKey: RowKey | null) {
  renderState.hoveredRowKey = rowKey;
}

export function setHoveredRowKeyByPosition(store: Store, viewInfo: PagePosition) {
  const {
    renderState: { hoveredRowKey },
    data: { filteredRawData },
    viewport: { scrollLeft, scrollTop }
  } = store;
  const rowIndex = findRowIndexByPosition(store, {
    ...viewInfo,
    scrollLeft,
    scrollTop
  });
  const rowKey = filteredRawData[rowIndex].rowKey;

  if (hoveredRowKey !== rowKey) {
    setHoveredRowKey(store, rowKey);
  }
}

export function setCellHeight(
  { renderState }: Store,
  columnName: string,
  rowIndex: number,
  height: number,
  defaultRowHeight: number
) {
  const { cellHeightMap } = renderState;

  if (!cellHeightMap[rowIndex]) {
    cellHeightMap[rowIndex] = {};
  }

  cellHeightMap[rowIndex][columnName] = Math.max(height, defaultRowHeight);
}

export function removeCellHeight({ renderState }: Store, rowIndex: number) {
  const { cellHeightMap } = renderState;
  delete cellHeightMap[rowIndex];
}

export function refreshRowHeight(store: Store, rowIndex: number, rowHeight: number) {
  const { data, rowCoords, renderState } = store;
  const { cellHeightMap } = renderState;
  const cellHeights = cellHeightMap[rowIndex];
  const highestHeight = Object.keys(cellHeights).reduce(
    (acc, columnName) => Math.max(acc, cellHeights[columnName]),
    -1
  );

  if (rowHeight !== highestHeight) {
    data.rawData[rowIndex]._attributes.height = highestHeight;
    rowCoords.heights[rowIndex] = highestHeight;

    notify(rowCoords, 'heights');
  }
}
