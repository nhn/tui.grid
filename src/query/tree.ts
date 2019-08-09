import { Store, Row, RowKey } from '../store/types';
import { Observable, getOriginObject } from '../helper/observable';
import {
  getParentRowKey,
  getChildRowKeys,
  traverseAncestorRows,
  traverseDescendantRows
} from '../helper/tree';
import { findRowByRowKey } from './data';

export function getParentRow(store: Store, rowKey: RowKey, plainObj?: boolean) {
  const { data, column, id } = store;
  const row = findRowByRowKey(data, column, id, rowKey);

  if (row) {
    const parentRowKey = getParentRowKey(row);
    const parentRow = findRowByRowKey(data, column, id, parentRowKey);

    if (parentRow) {
      return plainObj ? getOriginObject(parentRow as Observable<Row>) : parentRow;
    }
  }

  return null;
}

export function getChildRows(store: Store, rowKey: RowKey, plainObj?: boolean) {
  const { data, column, id } = store;
  const row = findRowByRowKey(data, column, id, rowKey);

  if (row) {
    const childRowKeys = getChildRowKeys(row);

    return childRowKeys.map(childRowKey => {
      const childRow = findRowByRowKey(data, column, id, childRowKey)!;
      return plainObj ? getOriginObject(childRow as Observable<Row>) : childRow;
    });
  }

  return [];
}

export function getAncestorRows(store: Store, rowKey: RowKey) {
  const { data, column, id } = store;
  const { rawData } = data;
  const row = findRowByRowKey(data, column, id, rowKey);
  const ancestorRows: Row[] = [];

  if (row) {
    traverseAncestorRows(rawData, row, (parentRow: Row) => {
      ancestorRows.unshift(getOriginObject(parentRow as Observable<Row>));
    });
  }

  return ancestorRows;
}

export function getDescendantRows(store: Store, rowKey: RowKey) {
  const { data, column, id } = store;
  const { rawData } = data;
  const row = findRowByRowKey(data, column, id, rowKey);
  const childRows: Row[] = [];

  if (row) {
    traverseDescendantRows(rawData, row, (childRow: Row) => {
      childRows.push(getOriginObject(childRow as Observable<Row>));
    });
  }

  return childRows;
}
