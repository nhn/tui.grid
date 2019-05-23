import { Row, Column, ColumnInfo, RowKey, CellValue, TreeColumnInfo } from '../store/types';
import { OptRow } from '../types';
import { observable, observe } from '../helper/observable';
import { createRawRow } from '../store/data';
import { findProp, isUndefined } from '../helper/common';

interface ColumnDefaultValue {
  name: string;
  defaultValue: CellValue;
}

export const DEFAULT_INDENT_WIDTH = 22;

let treeRowKey = -1;

function createTreeRowKey() {
  treeRowKey += 1;

  return treeRowKey;
}

export function getChildRowKeys(row: Row) {
  const { tree } = row._attributes;

  return tree ? tree.childrenRowKeys.slice() : [];
}

export function addChildRowKeys(row: Row, rowKey: RowKey) {
  const { tree } = row._attributes;

  if (tree && tree.childrenRowKeys.indexOf(rowKey) === -1) {
    tree.childrenRowKeys.push(rowKey);
  }
}

export function removeChildRowKeys() {}

export function flattenTreeData(
  data: OptRow[],
  defaultValues: Column['defaultValues'],
  parentRow?: Row
): Row[] {
  const flattenedRows: Row[] = [];

  data.forEach((row) => {
    const rawData = createRawRow(row, createTreeRowKey(), defaultValues);
    const { rowKey } = rawData;
    const parentRowKey = parentRow ? parentRow.rowKey : rowKey;

    // tree object is not reactive
    rawData._attributes.tree = observable({
      parentRowKey,
      childrenRowKeys: [],
      expanded: true
    });

    flattenedRows.push(rawData);

    if (parentRow) {
      addChildRowKeys(parentRow, rowKey);
    }

    const childRows = row._children || false;

    if (childRows && childRows.length > 0) {
      flattenedRows.push(...flattenTreeData(childRows, defaultValues, rawData));

      delete rawData._children;
    }
  });

  return flattenedRows;
}

export function isLeaf(row: Row) {
  const { tree } = row._attributes;

  return tree && tree.childrenRowKeys.length === 0;
}

export function isExpanded(row: Row) {
  const { tree } = row._attributes;

  return tree && tree.expanded;
}

export function getParentRowKey(row: Row) {
  const { tree } = row._attributes;

  return tree && tree.parentRowKey !== row.rowKey ? tree.parentRowKey : '';
}

export function getDepth(rawData: Row[], rowKey: RowKey) {
  const targetRow = findProp('rowKey', rowKey, rawData);

  if (!targetRow) {
    return -1;
  }

  const parentRowKey = getParentRowKey(targetRow);

  let parentRow = findProp('rowKey', parentRowKey, rawData);
  let depth = 0;

  while (parentRow) {
    depth += 1;
    parentRow = findProp('rowKey', getParentRowKey(parentRow), rawData);
  }

  return depth;
}

export function getTreeCellInfo(rawData: Row[], row: Row, treeColumnInfo?: TreeColumnInfo) {
  const depth = getDepth(rawData, row.rowKey);

  let indentWidth = (depth + 1) * DEFAULT_INDENT_WIDTH;

  if (treeColumnInfo && !isUndefined(treeColumnInfo.useIcon)) {
    indentWidth += DEFAULT_INDENT_WIDTH;
  }

  return {
    depth,
    indentWidth,
    leaf: isLeaf(row),
    expanded: isExpanded(row)
  };
}

export function createTreeCellInfo(rawData: Row[], row: Row, { tree }: ColumnInfo) {
  const initialInfo = getTreeCellInfo(rawData, row, tree);
  const treeInfo = observable(initialInfo);

  observe(() => {
    const { expanded } = getTreeCellInfo(rawData, row, tree);

    if (treeInfo) {
      treeInfo.expanded = expanded;
    }
  });

  return treeInfo;
}

export function traverseDescendants(rawData: Row[], row: Row, iteratee: Function) {
  let childRowKeys = getChildRowKeys(row);
  let rowKey, childRow;

  while (childRowKeys.length) {
    rowKey = childRowKeys.pop();
    childRow = findProp('rowKey', rowKey, rawData);

    iteratee(childRow);

    if (childRow) {
      childRowKeys = childRowKeys.concat(getChildRowKeys(childRow));
    }
  }
}

export function getDecendentRowKeys(rawData: Row[], parentRow: Row) {
  let childRowKeys: RowKey[] = getChildRowKeys(parentRow);

  traverseDescendants(rawData, parentRow, (row: Row) => {
    childRowKeys = childRowKeys.concat(getChildRowKeys(row));
  });

  return childRowKeys;
}
