import { Row, ColumnDefaultValues, RowKey } from '../store/types';
import { createRawRow } from '../store/data';
import { OptRow } from '../types';
import { observable, observe, notify } from './observable';
import { includes, findProp, removeArrayItem, isNull, isUndefined } from './common';

interface TreeDataOptions {
  keyColumnName?: string;
  lazyObservable?: boolean;
  offset?: number;
}

export const DEFAULT_INDENT_WIDTH = 22;

let treeRowKey = -1;

function generateTreeRowKey() {
  // @TODO 키 제너레이터 추가
  treeRowKey += 1;

  return treeRowKey;
}

function addChildRowKey(row: Row, rowKey: RowKey) {
  const { tree } = row._attributes;

  if (tree && !includes(tree.childRowKeys, rowKey)) {
    tree.childRowKeys.push(rowKey);
  }
}

function insertChildRowKey(row: Row, rowKey: RowKey, offset: number) {
  const { tree } = row._attributes;

  if (tree && !includes(tree.childRowKeys, rowKey)) {
    tree.childRowKeys.splice(offset, 0, rowKey);
  }
}

export function removeChildRowKey(row: Row, rowKey: RowKey) {
  const { tree } = row._attributes;

  if (tree) {
    removeArrayItem(rowKey, tree.childRowKeys);
    notify(tree, 'childRowKeys');
  }
}

export function getParentRowKey(row: Row) {
  const { tree } = row._attributes;

  return tree && tree.parentRowKey !== row.rowKey ? tree.parentRowKey : null;
}

export function getChildRowKeys(row: Row) {
  const { tree } = row._attributes;

  return tree ? tree.childRowKeys.slice() : [];
}

export function isLeaf(row: Row) {
  const { tree } = row._attributes;

  return !!tree && !tree.childRowKeys.length && isUndefined(tree.expanded);
}

export function isExpanded(row: Row) {
  const { tree } = row._attributes;

  return !!(tree && tree.expanded);
}

function isHidden(row: Row) {
  const { tree } = row._attributes;

  return !!(tree && tree.hidden);
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

function createTreeRawRow(
  row: OptRow,
  defaultValues: ColumnDefaultValues,
  parentRow: Row | null,
  options = { lazyObservable: false } as TreeDataOptions
) {
  const { keyColumnName, offset, lazyObservable = false } = options;
  const rawRow = createRawRow(row, generateTreeRowKey(), defaultValues, {
    keyColumnName,
    lazyObservable
  });
  const { rowKey } = rawRow;
  const defaultAttributes = {
    parentRowKey: parentRow ? parentRow.rowKey : null,
    childRowKeys: [],
    hidden: parentRow ? !isExpanded(parentRow) || isHidden(parentRow) : false
  };

  if (parentRow) {
    if (!isUndefined(offset)) {
      insertChildRowKey(parentRow, rowKey, offset);
    } else {
      addChildRowKey(parentRow, rowKey);
    }
  }

  const tree = {
    ...defaultAttributes,
    ...(Array.isArray(row._children) && { expanded: !!row._attributes!.expanded })
  };

  rawRow._attributes.tree = lazyObservable ? tree : observable(tree);

  return rawRow;
}

export function flattenTreeData(
  data: OptRow[],
  defaultValues: ColumnDefaultValues,
  parentRow: Row | null,
  options: TreeDataOptions
) {
  const flattenedRows: Row[] = [];

  data.forEach((row) => {
    const rawRow = createTreeRawRow(row, defaultValues, parentRow, options);

    flattenedRows.push(rawRow);

    if (Array.isArray(row._children)) {
      if (row._children.length) {
        flattenedRows.push(...flattenTreeData(row._children, defaultValues, rawRow, options));
      }
    }
  });

  return flattenedRows;
}

export function createTreeRawData(
  data: OptRow[],
  defaultValues: ColumnDefaultValues,
  keyColumnName?: string,
  lazyObservable = false
) {
  treeRowKey = -1;

  return flattenTreeData(data, defaultValues, null, { keyColumnName, lazyObservable });
}

export function getTreeCellInfo(rawData: Row[], row: Row, useIcon?: boolean) {
  const depth = getDepth(rawData, row);
  let indentWidth = depth * DEFAULT_INDENT_WIDTH;

  if (useIcon) {
    indentWidth += DEFAULT_INDENT_WIDTH;
  }

  return {
    depth,
    indentWidth,
    leaf: isLeaf(row),
    expanded: isExpanded(row)
  };
}

export function createTreeCellInfo(
  rawData: Row[],
  row: Row,
  useIcon?: boolean,
  lazyObservable = false
) {
  const treeCellInfo = getTreeCellInfo(rawData, row, useIcon);
  const treeInfo = lazyObservable ? treeCellInfo : observable(treeCellInfo);

  if (!lazyObservable) {
    observe(() => {
      treeInfo.expanded = isExpanded(row);
      treeInfo.leaf = isLeaf(row);
    });
  }

  return treeInfo;
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
