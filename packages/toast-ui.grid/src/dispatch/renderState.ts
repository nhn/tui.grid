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

export function matchRowHeight(store: Store) {
  const { data, rowCoords, viewport } = store;
  const [start, end] = viewport.rowRange;

  data.rawData.slice(start, end).forEach((row) => {
    const height = row._attributes.height;

    if (!isUndefined(height) && rowCoords.heights[row.sortKey] != height) {
      rowCoords.heights[row.sortKey] = height;
    }
  });

  notify(rowCoords, 'heights');
}
