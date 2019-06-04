import { Store, Row, RowKey } from '../store/types';
import { Observable, getOriginObject } from '../helper/observable';
import { findProp } from '../helper/common';
import { getParentRowKey, getChildRowKeys, traverseDescendantRows } from '../helper/tree';

export function getParentRow(store: Store, rowKey: RowKey, plainObj?: boolean) {
  const { rawData } = store.data;
  const row = findProp('rowKey', rowKey, rawData);

  if (row) {
    const parentRowKey = getParentRowKey(row);
    const parentRow = findProp('rowKey', parentRowKey, rawData);

    if (parentRow) {
      return plainObj ? getOriginObject(parentRow as Observable<Row>) : parentRow;
    }
  }

  return null;
}

export function getChildRows(store: Store, rowKey: RowKey, plainObj?: boolean) {
  const { rawData } = store.data;
  const row = findProp('rowKey', rowKey, rawData);

  if (row) {
    const childRowKeys = getChildRowKeys(row);

    return childRowKeys.map((childRowKey) => {
      const childRow = findProp('rowKey', childRowKey, rawData)!;

      return plainObj ? getOriginObject(childRow as Observable<Row>) : childRow;
    });
  }

  return [];
}

export function getAncestorRows(store: Store, rowKey: RowKey) {
  const ancestorRows = [];

  let parentRow = getParentRow(store, rowKey, true);

  while (parentRow) {
    ancestorRows.unshift(parentRow);
    parentRow = getParentRow(store, parentRow.rowKey, true);
  }

  return ancestorRows;
}

export function getDecendantRows(store: Store, rowKey: RowKey) {
  const { rawData } = store.data;
  const row = findProp('rowKey', rowKey, rawData);

  if (row) {
    let childRows: (Row | Observable<Row>)[] = getChildRows(store, rowKey, true);

    traverseDescendantRows(rawData, row, (childRow: Row) => {
      childRows = childRows.concat(getChildRows(store, childRow.rowKey, true));
    });

    return childRows;
  }

  return [];
}
