import { Store } from '@t/store';
import { RowKey } from '@t/store/data';
import { PagePosition } from '@t/store/selection';
import { notify } from '../helper/observable';
import { findRowIndexByPosition } from '../query/mouse';
import { isUndefined } from '../helper/common';

export function setHoveredRowKey({ renderState }: Store, rowKey: RowKey | null) {
  renderState.hoveredRowKey = rowKey;
}

export function setHoveredRowKeyByPosition(store: Store, viewInfo: PagePosition) {
  const { renderState, data, viewport } = store;
  const { scrollLeft, scrollTop } = viewport;
  const rowIndex = findRowIndexByPosition(store, { ...viewInfo, scrollLeft, scrollTop });
  const { rowKey } = data.filteredRawData[rowIndex];

  if (renderState.hoveredRowKey !== rowKey) {
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

export function removeRowHeight({ renderState }: Store, rowIndex: number) {
  const { cellHeightMap } = renderState;
  delete cellHeightMap[rowIndex];
}

export function refreshRowHeight(store: Store, rowIndex: number, rowHeight: number) {
  const { data, rowCoords, renderState } = store;
  const { cellHeightMap } = renderState;
  const cellHeights = cellHeightMap[rowIndex];

  if (isUndefined(cellHeights)) {
    return;
  }

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

export function fitRowHeightWhenMovingRow(store: Store, currentIndex: number, targetIndex: number) {
  const { rowCoords, renderState } = store;
  const { cellHeightMap } = renderState;

  if (Object.keys(cellHeightMap).length === 0) {
    return;
  }

  const direction = targetIndex > currentIndex ? 1 : -1;

  for (let i = currentIndex; i !== targetIndex; i += direction) {
    const target = i + direction;
    const temp = cellHeightMap[i];
    cellHeightMap[i] = cellHeightMap[target];
    cellHeightMap[target] = temp;

    const highestHeight = Object.keys(cellHeightMap[i]).reduce(
      (acc, columnName) => Math.max(acc, cellHeightMap[i][columnName]),
      -1
    );
    const targetHighestHeight = Object.keys(cellHeightMap[target]).reduce(
      (acc, columnName) => Math.max(acc, cellHeightMap[target][columnName]),
      -1
    );
    if (highestHeight !== targetHighestHeight) {
      rowCoords.heights[i] = highestHeight;
      rowCoords.heights[target] = targetHighestHeight;
    }
  }

  notify(rowCoords, 'heights');
}
