import { Store, Row, RowKey } from '../store/types';
import { Observable, getOriginObject } from '../helper/observable';
import { findProp } from '../helper/common';
import {
  getParentRowKey,
  getChildRowKeys,
  traverseAncestorRows,
  traverseDescendantRows
} from '../helper/tree';

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
  const { rawData } = store.data;
  const row = findProp('rowKey', rowKey, rawData);
  const ancestorRows: Row[] = [];

  if (row) {
    traverseAncestorRows(rawData, row, (parentRow: Row) => {
      ancestorRows.unshift(getOriginObject(parentRow as Observable<Row>));
    });
  }

  return ancestorRows;
}

export function getDecendantRows(store: Store, rowKey: RowKey) {
  const { rawData } = store.data;
  const row = findProp('rowKey', rowKey, rawData);
  const childRows: Row[] = [];

  if (row) {
    traverseDescendantRows(rawData, row, (childRow: Row) => {
      childRows.push(getOriginObject(childRow as Observable<Row>));
    });
  }

  return childRows;
}
