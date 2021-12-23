import { GridId } from '@t/store';
import { OptRow } from '@t/options';
import { Row, RowKey } from '@t/store/data';
import { Column } from '@t/store/column';
import { createRawRow } from '../data';
import { isExpanded, getDepth, isLeaf, isHidden } from '../../query/tree';
import { observable, observe } from '../../helper/observable';
import { includes, isUndefined, someProp } from '../../helper/common';
import { TREE_INDENT_WIDTH } from '../../helper/constant';

interface TreeDataOption {
  keyColumnName?: string;
  lazyObservable?: boolean;
  offset?: number;
  disabled?: boolean;
}

interface TreeDataCreationOption {
  id: number;
  data: OptRow[];
  column: Column;
  keyColumnName?: string;
  lazyObservable?: boolean;
  disabled?: boolean;
}

interface TreeRowKeyMap {
  [id: number]: number;
}

const treeRowKeyMap: TreeRowKeyMap = {};

export function clearTreeRowKeyMap(id: GridId) {
  delete treeRowKeyMap[id];
}

function generateTreeRowKey(id: GridId) {
  treeRowKeyMap[id] = treeRowKeyMap[id] ?? -1;

  treeRowKeyMap[id] += 1;

  return treeRowKeyMap[id];
}

function addChildRowKey(row: Row, childRow: Row) {
  const { tree } = row._attributes;
  const { rowKey } = childRow;

  if (tree && !includes(tree.childRowKeys, rowKey)) {
    tree.childRowKeys.push(rowKey);
  }
  if (!someProp('rowKey', rowKey, row._children!)) {
    row._children!.push(childRow);
  }
  row._leaf = false;
}

function insertChildRowKey(row: Row, childRow: Row, offset: number) {
  const { tree } = row._attributes;
  const { rowKey } = childRow;

  if (tree && !includes(tree.childRowKeys, rowKey)) {
    tree.childRowKeys.splice(offset, 0, rowKey);
  }
  if (!someProp('rowKey', rowKey, row._children!)) {
    row._children!.splice(offset, 0, childRow);
  }
  row._leaf = false;
}

function getTreeCellInfo(rawData: Row[], row: Row, treeIndentWidth?: number, useIcon?: boolean) {
  const depth = getDepth(rawData, row);
  const indentWidth = getTreeIndentWidth(depth, treeIndentWidth, useIcon);

  return {
    depth,
    indentWidth,
    leaf: isLeaf(row),
    expanded: isExpanded(row),
  };
}

export function createTreeRawRow(
  id: number,
  row: OptRow,
  parentRow: Row | null,
  column: Column,
  options = {} as TreeDataOption
) {
  let childRowKeys = [] as RowKey[];
  if (row._attributes && row._attributes.tree) {
    childRowKeys = row._attributes.tree.childRowKeys as RowKey[];
  }
  const { keyColumnName, offset, lazyObservable = false, disabled = false } = options;

  if (!row._children) {
    row._children = [];
    row._leaf = true;
  }
  // generate new tree rowKey when row doesn't have rowKey
  const targetTreeRowKey = isUndefined(row.rowKey) ? generateTreeRowKey(id) : Number(row.rowKey);
  const rawRow = createRawRow(id, row, targetTreeRowKey, column, {
    keyColumnName,
    lazyObservable,
    disabled,
  });
  const defaultAttributes = {
    parentRowKey: parentRow ? parentRow.rowKey : null,
    childRowKeys,
    hidden: parentRow ? !isExpanded(parentRow) || isHidden(parentRow) : false,
  };

  if (parentRow) {
    if (!isUndefined(offset)) {
      insertChildRowKey(parentRow, rawRow, offset);
    } else {
      addChildRowKey(parentRow, rawRow);
    }
  }

  const tree = {
    ...defaultAttributes,
    expanded: row._attributes!.expanded,
  };

  rawRow._attributes.tree = lazyObservable ? tree : observable(tree);

  return rawRow;
}

export function flattenTreeData(
  id: number,
  data: OptRow[],
  parentRow: Row | null,
  column: Column,
  options: TreeDataOption
) {
  const flattenedRows: Row[] = [];

  data.forEach((row) => {
    const rawRow = createTreeRawRow(id, row, parentRow, column, options);

    flattenedRows.push(rawRow);

    if (Array.isArray(row._children)) {
      if (row._children.length) {
        flattenedRows.push(...flattenTreeData(id, row._children, rawRow, column, options));
      }
    }
  });

  return flattenedRows;
}

export function createTreeRawData({
  id,
  data,
  column,
  keyColumnName,
  lazyObservable = false,
  disabled = false,
}: TreeDataCreationOption) {
  // only reset the rowKey on lazy observable data
  if (lazyObservable) {
    treeRowKeyMap[id] = -1;
  }

  return flattenTreeData(id, data, null, column, {
    keyColumnName,
    lazyObservable,
    disabled,
  });
}

export function createTreeCellInfo(
  rawData: Row[],
  row: Row,
  treeIndentWidth?: number,
  useIcon?: boolean,
  lazyObservable = false
) {
  const treeCellInfo = getTreeCellInfo(rawData, row, treeIndentWidth, useIcon);
  const treeInfo = lazyObservable ? treeCellInfo : observable(treeCellInfo);

  if (!lazyObservable) {
    observe(() => {
      treeInfo.expanded = isExpanded(row);
      treeInfo.leaf = isLeaf(row);
    });
  }

  return treeInfo;
}

export function getTreeIndentWidth(depth: number, treeIndentWidth?: number, showIcon?: boolean) {
  const indentWidth = treeIndentWidth ?? TREE_INDENT_WIDTH;
  return TREE_INDENT_WIDTH + (depth - 1) * indentWidth + (showIcon ? TREE_INDENT_WIDTH : 0);
}
