import { OptRow, Dictionary } from '../../../types/options';
import { Row, RowKey } from '../../../types/store/data';
import { ColumnInfo } from '../../../types/store/column';
import { createRawRow } from '../data';
import { isExpanded, getDepth, isLeaf, isHidden } from '../../query/tree';
import { observable, observe } from '../../helper/observable';
import { includes, isUndefined } from '../../helper/common';
import { TREE_INDENT_WIDTH } from '../../helper/constant';

interface TreeDataOption {
  keyColumnName?: string;
  lazyObservable?: boolean;
  offset?: number;
  disabled?: boolean;
}

interface TreeDataCreationOption {
  data: OptRow[];
  columnMap: Dictionary<ColumnInfo>;
  keyColumnName?: string;
  lazyObservable?: boolean;
  disabled?: boolean;
}

let treeRowKey = -1;

function generateTreeRowKey() {
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

function getTreeCellInfo(rawData: Row[], row: Row, useIcon?: boolean) {
  const depth = getDepth(rawData, row);
  const indentWidth = getTreeIndentWidth(depth, useIcon);

  return {
    depth,
    indentWidth,
    leaf: isLeaf(row),
    expanded: isExpanded(row)
  };
}

export function createTreeRawRow(
  row: OptRow,
  parentRow: Row | null,
  columnMap: Dictionary<ColumnInfo>,
  options = {} as TreeDataOption
) {
  let childRowKeys = [] as RowKey[];
  if (row._attributes && row._attributes.tree) {
    childRowKeys = row._attributes.tree.childRowKeys as RowKey[];
  }
  const { keyColumnName, offset, lazyObservable = false, disabled = false } = options;
  // generate new tree rowKey when row doesn't have rowKey
  const targetTreeRowKey = isUndefined(row.rowKey) ? generateTreeRowKey() : Number(row.rowKey);
  const rawRow = createRawRow(row, targetTreeRowKey, columnMap, {
    keyColumnName,
    lazyObservable,
    disabled
  });
  const { rowKey } = rawRow;
  const defaultAttributes = {
    parentRowKey: parentRow ? parentRow.rowKey : null,
    childRowKeys,
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
    ...((Array.isArray(row._children) || childRowKeys.length) && {
      expanded: !!row._attributes!.expanded
    })
  };

  rawRow._attributes.tree = lazyObservable ? tree : observable(tree);

  return rawRow;
}

export function flattenTreeData(
  data: OptRow[],
  parentRow: Row | null,
  columnMap: Dictionary<ColumnInfo>,
  options: TreeDataOption
) {
  const flattenedRows: Row[] = [];

  data.forEach(row => {
    const rawRow = createTreeRawRow(row, parentRow, columnMap, options);

    flattenedRows.push(rawRow);

    if (Array.isArray(row._children)) {
      if (row._children.length) {
        flattenedRows.push(...flattenTreeData(row._children, rawRow, columnMap, options));
      }
    }
  });

  return flattenedRows;
}

export function createTreeRawData({
  data,
  columnMap,
  keyColumnName,
  lazyObservable = false,
  disabled = false
}: TreeDataCreationOption) {
  // only reset the rowKey on lazy observable data
  if (lazyObservable) {
    treeRowKey = -1;
  }

  return flattenTreeData(data, null, columnMap, {
    keyColumnName,
    lazyObservable,
    disabled
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
