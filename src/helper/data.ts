import { Row, Column, RowKey, CellValue } from '../store/types';
import { OptRow } from '../types';
import { observable } from '../helper/observable';
import { createRawRow } from '../store/data';

const DEFAULT_INDENT_WIDTH = 22; // @TODO 디폴트 값 변경
interface ColumnDefaultValue {
  name: string;
  defaultValue: CellValue;
}

let treeRowKey = -1;

function createTreeRowKey() {
  treeRowKey += 1;

  return treeRowKey;
}

export function flattenTreeData(
  data: OptRow[],
  defaultValues: Column['defaultValues'],
  parentRow?: Row
): Row[] {
  const flattenedRows: Row[] = [];

  data.forEach((row) => {
    const rawData = createRawRow(row, createTreeRowKey(), defaultValues);
    const parentRowKey = parentRow ? parentRow.rowKey : rawData.rowKey;

    rawData._attributes.tree = observable({ parentRowKey, childrenRowKeys: [] });

    flattenedRows.push(rawData);

    const childRows = row._children || false;

    if (childRows && childRows.length > 0) {
      flattenedRows.push(...flattenTreeData(childRows, defaultValues, rawData));

      delete rawData._children;
    }
  });

  return flattenedRows;
}

export function getRow(rawData: Row[], rowKey: RowKey) {
  return rawData.find((row) => row.rowKey === rowKey);
}

export function getParentRowKey(row: Row) {
  const { tree } = row._attributes;

  return tree && tree.parentRowKey !== row.rowKey ? tree.parentRowKey : '';
}

export function getDepth(rawData: Row[], rowKey: RowKey) {
  const targetRow = getRow(rawData, rowKey);

  if (!targetRow) {
    return -1;
  }

  const parentRowKey = getParentRowKey(targetRow);

  let parentRow = getRow(rawData, parentRowKey);
  let depth = 0;

  while (parentRow) {
    depth += 1;
    parentRow = getRow(rawData, getParentRowKey(parentRow));
  }

  return depth;
}

export function isLeaf(row: Row) {
  const { tree } = row._attributes;

  return !!(tree && tree.childrenRowKeys.length > 0);
}

export function getTreeCellInfo(rawData: Row[], row: Row) {
  const depth = getDepth(rawData, row.rowKey);

  return {
    indentWidth: depth * DEFAULT_INDENT_WIDTH,
    isLeaf: isLeaf(row)
  };
}
