import { OptRow } from '../../../types/options';
import { Row, RowKey } from '../../../types/store/data';
import { Column } from '../../../types/store/column';
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

let treeRowKey = -1;

function generateTreeRowKey() {
  treeRowKey += 1;

  return treeRowKey;
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

function getTreeCellInfo(rawData: Row[], row: Row, useIcon?: boolean) {
  const depth = getDepth(rawData, row);
  const indentWidth = getTreeIndentWidth(depth, useIcon);

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
  const targetTreeRowKey = isUndefined(row.rowKey) ? generateTreeRowKey() : Number(row.rowKey);
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
    treeRowKey = -1;
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

export function getTreeIndentWidth(depth: number, showIcon?: boolean) {
  return depth * TREE_INDENT_WIDTH + (showIcon ? TREE_INDENT_WIDTH : 0);
}
