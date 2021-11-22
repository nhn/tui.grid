import { Store } from '@t/store';
import { RowKey, Row } from '@t/store/data';
import { Observable, getOriginObject } from '../helper/observable';
import { findRowByRowKey, findIndexByRowKey } from './data';
import { isUndefined, isNull, findProp } from '../helper/common';
import { Column } from '@t/store/column';

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

    return childRowKeys.map((childRowKey) => {
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

export function getStartIndexToAppendRow(store: Store, parentRow: Row, offset?: number) {
  const { data, column, id } = store;
  const { rawData } = data;
  let startIdx;

  if (parentRow) {
    if (offset) {
      const childRowKeys = getChildRowKeys(parentRow);
      const prevChildRowKey = childRowKeys[offset - 1];
      const prevChildRowIdx = findIndexByRowKey(data, column, id, prevChildRowKey);
      const descendantRowsCount = getDescendantRows(store, prevChildRowKey).length;

      startIdx = prevChildRowIdx + descendantRowsCount + 1;
    } else {
      startIdx = findIndexByRowKey(data, column, id, parentRow.rowKey) + 1;

      if (isUndefined(offset)) {
        startIdx += getDescendantRows(store, parentRow.rowKey).length;
      }
    }
  } else {
    startIdx = isUndefined(offset) ? rawData.length : offset;
  }

  return startIdx;
}

export function getParentRowKey(row: Row) {
  const { tree } = row._attributes;

  return tree && tree.parentRowKey !== row.rowKey ? tree.parentRowKey : null;
}

export function getChildRowKeys(row: Row) {
  const { tree } = row._attributes;

  return tree ? tree.childRowKeys.slice() : [];
}

export function isTreeColumnName(column: Column, columnName: string) {
  return column.treeColumnName === columnName;
}

export function isHidden({ _attributes }: Row) {
  const { tree } = _attributes;

  return !!(tree && tree.hidden);
}

export function isLeaf({ _attributes, _leaf }: Row) {
  const { tree } = _attributes;

  return !!tree && !tree.childRowKeys.length && !!_leaf;
}

export function isExpanded(row: Row) {
  const { tree } = row._attributes;

  return !!(tree && tree.expanded);
}

export function isRootChildRow(row: Row) {
  const { tree } = row._attributes;

  return !!tree && isNull(tree.parentRowKey);
}

export function getDepth(rawData: Row[], row?: Row) {
  let parentRow = row;
  let depth = 0;

  do {
    depth += 1;
    parentRow = findProp('rowKey', getParentRowKey(parentRow!), rawData);
  } while (parentRow);

  return depth;
}

export function traverseAncestorRows(rawData: Row[], row: Row, iteratee: Function) {
  let parentRowKey = getParentRowKey(row);
  let parentRow;

  while (!isNull(parentRowKey)) {
    parentRow = findProp('rowKey', parentRowKey, rawData);

    iteratee(parentRow);

    parentRowKey = parentRow ? getParentRowKey(parentRow) : null;
  }
}

export function traverseDescendantRows(rawData: Row[], row: Row, iteratee: Function) {
  let childRowKeys = getChildRowKeys(row);
  let rowKey, childRow;

  while (childRowKeys.length) {
    rowKey = childRowKeys.shift();
    childRow = findProp('rowKey', rowKey, rawData);

    iteratee(childRow);

    if (childRow) {
      childRowKeys = childRowKeys.concat(getChildRowKeys(childRow));
    }
  }
}

export function getRootParentRow(rawData: Row[], row: Row) {
  let rootParentRow = row;

  do {
    const parentRow = findProp('rowKey', getParentRowKey(rootParentRow!), rawData);
    if (!parentRow) {
      break;
    }
    rootParentRow = parentRow;
  } while (rootParentRow);

  return rootParentRow;
}
