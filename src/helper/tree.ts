import { Row, ColumnDefaultValues, RowKey, TreeColumnInfo } from '../store/types';
import { createRawRow } from '../store/data';
import { OptRow } from '../types';
import { observable, observe } from './observable';
import { includes, findProp } from './common';

export const DEFAULT_INDENT_WIDTH = 22;

let treeRowKey = -1;

function generateTreeRowKey() {
  treeRowKey += 1;

  return treeRowKey;
}

function addChildRowKeys(row: Row, rowKey: RowKey) {
  const { tree } = row._attributes;

  if (tree && !includes(tree.childrenRowKeys, rowKey)) {
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

  return !!tree && !tree.childrenRowKeys.length;
}

export function isExpanded(row: Row) {
  const { tree } = row._attributes;

  return !!tree && tree.expanded;
}

export function getDepth(rawData: Row[], row: Row) {
  let parentRow: Row | undefined = row;
  let depth = 0;

  do {
    depth += 1;
    parentRow = findProp('rowKey', getParentRowKey(parentRow), rawData);
  } while (parentRow);

  return depth;
}

function hasChildrenState(row: OptRow) {
  const { _children } = row;

  return Array.isArray(_children) && _children.length > 0;
}

function getExpandedState(row: OptRow) {
  if (row && row._attributes) {
    const { expanded = true } = row._attributes;

    return expanded;
  }

  return true;
}

export function getHiddenChildState(row: Row) {
  if (row) {
    const { tree } = row._attributes;
    const collapsed = !isExpanded(row);
    const hiddenChild = !!(tree && tree.hiddenChild);

    return collapsed || hiddenChild;
  }

  return false;
}

function createTreeRawRow(row: OptRow, defaultValues: ColumnDefaultValues, parentRow?: Row) {
  const rawRow = createRawRow(row, generateTreeRowKey(), defaultValues);
  const { rowKey } = rawRow;
  const defaultAttributes = {
    parentRowKey: parentRow ? parentRow.rowKey : -1,
    childrenRowKeys: []
  };

  if (parentRow) {
    addChildRowKeys(parentRow, rowKey);
  }

  rawRow._attributes.tree = observable({
    ...defaultAttributes,
    ...(hasChildrenState(row) && { expanded: getExpandedState(row) }),
    ...(!!parentRow && { hiddenChild: getHiddenChildState(parentRow) })
  });

  return rawRow;
}

export function flattenTreeData(
  data: OptRow[],
  defaultValues: ColumnDefaultValues,
  parentRow?: Row
) {
  const flattenedRows: Row[] = [];

  data.forEach((row) => {
    const rawRow = createTreeRawRow(row, defaultValues, parentRow);

    flattenedRows.push(rawRow);

    if (hasChildrenState(row)) {
      flattenedRows.push(...flattenTreeData(row._children || [], defaultValues, rawRow));
      delete rawRow._children;
    }
  });

  return flattenedRows;
}

export function createTreeRawData(data: OptRow[], defaultValues: ColumnDefaultValues) {
  treeRowKey = -1;

  return flattenTreeData(data, defaultValues);
}

export function getTreeCellInfo(rawData: Row[], row: Row, treeColumnInfo?: TreeColumnInfo) {
  const depth = getDepth(rawData, row);
  let indentWidth = (depth + 1) * DEFAULT_INDENT_WIDTH;

  if (treeColumnInfo && treeColumnInfo.useIcon === true) {
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
  const treeInfo = observable(getTreeCellInfo(rawData, row, treeColumnInfo));

  observe(() => {
    treeInfo.expanded = isExpanded(row);
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
