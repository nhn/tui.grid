import { Row, Column, RowKey, TreeColumnInfo } from '../store/types';
import { OptRow } from '../types';
import { observable, observe } from '../helper/observable';
import { createRawRow } from '../store/data';
import { findProp, isUndefined } from '../helper/common';

export const DEFAULT_INDENT_WIDTH = 22;

let treeRowKey = -1;

function generateTreeRowKey() {
  treeRowKey += 1;

  return treeRowKey;
}

function addChildRowKeys(row: Row, rowKey: RowKey) {
  const { tree } = row._attributes;

  if (tree && tree.childrenRowKeys.indexOf(rowKey) === -1) {
    tree.childrenRowKeys.push(rowKey);
  }
}

export function getParentRowKey(row: Row) {
  const { tree } = row._attributes;

  return tree && tree.parentRowKey !== row.rowKey ? tree.parentRowKey : '';
}

export function getChildRowKeys(row: Row) {
  const { tree } = row._attributes;

  return tree ? tree.childrenRowKeys.slice() : [];
}

export function isLeaf(row: Row) {
  const { tree } = row._attributes;

  return !!tree && tree.childrenRowKeys.length === 0;
}

export function isExpanded(row: Row) {
  const { tree } = row._attributes;

  return !!tree && tree.expanded;
}

export function getDepth(rawData: Row[], row: Row) {
  let parentRowKey = getParentRowKey(row);
  let parentRow = findProp('rowKey', parentRowKey, rawData);

  let depth = 0;

  while (parentRow) {
    depth += 1;
    parentRowKey = getParentRowKey(parentRow);
    parentRow = findProp('rowKey', parentRowKey, rawData)!;
  }

  return depth;
}

function hasChildrenState(row: OptRow) {
  if (row) {
    const { _children } = row;

    return Array.isArray(_children) && _children.length > 0;
  }

  return false;
}

function getExpandedState(row: OptRow) {
  if (row) {
    const { _attributes } = row;

    if (!!_attributes && !isUndefined(_attributes.expanded)) {
      return _attributes.expanded;
    }
  }

  return true;
}

export function getHiddenState(row?: Row) {
  if (row) {
    const { tree } = row._attributes;
    const collapsed = isExpanded(row) === false;
    const hiddenChild = tree && !isUndefined(tree.hiddenChild) && tree.hiddenChild === true;

    if (collapsed || hiddenChild) {
      return true;
    }
  }

  return false;
}

function createTreeRawRow(row: OptRow, defaultValues: Column['defaultValues'], parentRow?: Row) {
  const rawData = createRawRow(row, generateTreeRowKey(), defaultValues);
  const { rowKey } = rawData;

  const defaultAttributes = {
    parentRowKey: parentRow ? parentRow.rowKey : rowKey,
    childrenRowKeys: []
  };

  if (parentRow) {
    addChildRowKeys(parentRow, rowKey);
  }

  rawData._attributes.tree = observable({
    ...defaultAttributes,
    ...(hasChildrenState(row) ? { expanded: getExpandedState(row) } : null),
    ...(parentRow ? { hiddenChild: getHiddenState(parentRow) } : null)
  });

  return rawData;
}

export function flattenTreeData(
  data: OptRow[],
  defaultValues: Column['defaultValues'],
  parentRow?: Row
): Row[] {
  const flattenedRows: Row[] = [];

  data.forEach((row) => {
    const rawData = createTreeRawRow(row, defaultValues, parentRow);

    flattenedRows.push(rawData);

    if (hasChildrenState(row)) {
      flattenedRows.push(...flattenTreeData(row._children || [], defaultValues, rawData));
      delete rawData._children;
    }
  });

  return flattenedRows;
}

export function createTreeRawData(data: OptRow[], defaultValues: Column['defaultValues']) {
  treeRowKey = -1;

  return flattenTreeData(data, defaultValues);
}

export function getTreeCellInfo(rawData: Row[], row: Row, treeColumnInfo?: TreeColumnInfo) {
  const depth = getDepth(rawData, row);

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

export function createTreeCellInfo(rawData: Row[], row: Row, treeColumnInfo?: TreeColumnInfo) {
  const initialInfo = getTreeCellInfo(rawData, row, treeColumnInfo);
  const treeInfo = observable(initialInfo);

  observe(() => {
    const { expanded } = getTreeCellInfo(rawData, row, treeColumnInfo);

    if (treeInfo) {
      treeInfo.expanded = expanded;
    }
  });

  return treeInfo;
}

export function traverseDescendantRows(rawData: Row[], row: Row, iteratee: Function) {
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
