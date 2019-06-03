import { Store, Row, RowKey } from '../store/types';
import { findProp, findPropIndex } from '../helper/common';
import { notify } from '../helper/observable';
import { getRowHeight } from '../store/rowCoords';
import { traverseDescendantRows, isLeaf, getHiddenState } from '../helper/tree';
import { isUndefined } from 'util';
import { getParentRow } from '../query/tree';

function changeExpandedState(row: Row, expanded: boolean) {
  const { tree } = row._attributes;

  if (tree && !isUndefined(tree.expanded)) {
    tree.expanded = expanded;
  }
}

function changeHiddenChildState(row: Row, hidden: boolean) {
  const { tree } = row._attributes;

  if (tree && !isUndefined(tree.hiddenChild)) {
    tree.hiddenChild = hidden;
  }
}

function expand(store: Store, row: Row, recursive?: boolean) {
  const { data, rowCoords, dimension } = store;
  const { rawData } = data;
  const { heights } = rowCoords;

  if (row) {
    if (!isLeaf(row)) {
      changeExpandedState(row, true);
    }

    traverseDescendantRows(rawData, row, (childRow: Row) => {
      if (recursive) {
        changeExpandedState(childRow, true);
      }

      const parentRow = getParentRow(store, childRow.rowKey);
      const hiddenChild = parentRow ? getHiddenState(parentRow) : false;

      changeHiddenChildState(childRow, hiddenChild);

      const index = findPropIndex('rowKey', childRow.rowKey, rawData);
      heights[index] = getRowHeight(childRow, dimension.rowHeight);
    });

    notify(rowCoords, 'heights');
  }
}

export function expandByRowKey(store: Store, rowKey: RowKey, recursive?: boolean) {
  const row = findProp('rowKey', rowKey, store.data.rawData);

  if (row) {
    expand(store, row, recursive);
  }
}

export function expandAll(store: Store) {
  store.data.rawData.forEach((row) => {
    expand(store, row);
  });
}

function collapse(store: Store, row: Row, recursive?: boolean) {
  const { data, rowCoords } = store;
  const { rawData } = data;
  const { heights } = rowCoords;

  if (row) {
    if (!isLeaf(row)) {
      changeExpandedState(row, false);
    }

    traverseDescendantRows(rawData, row, (childRow: Row) => {
      if (recursive) {
        changeExpandedState(childRow, false);
      }

      const parentRow = getParentRow(store, childRow.rowKey);
      const hiddenChild = parentRow ? getHiddenState(parentRow) : true;

      changeHiddenChildState(childRow, hiddenChild);

      const index = findPropIndex('rowKey', childRow.rowKey, rawData);
      heights[index] = 0;
    });

    notify(rowCoords, 'heights');
  }
}

export function collapseByRowKey(store: Store, rowKey: RowKey, recursive?: boolean) {
  const row = findProp('rowKey', rowKey, store.data.rawData);

  if (row) {
    collapse(store, row, recursive);
  }
}

export function collapseAll(store: Store) {
  store.data.rawData.forEach((row) => {
    collapse(store, row);
  });
}
