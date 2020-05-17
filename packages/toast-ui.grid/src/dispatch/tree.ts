import { Row, RowKey } from '@t/store/data';
import { Store } from '@t/store';
import { OptRow, OptAppendTreeRow } from '@t/options';
import { createViewRow, getFormattedValue } from '../store/data';
import { getRowHeight, findIndexByRowKey, findRowByRowKey, getLoadingState } from '../query/data';
import { notify } from '../helper/observable';
import { getDataManager } from '../instance';
import {
  isUpdatableRowAttr,
  setLoadingState,
  updateRowNumber,
  setCheckedAllRows,
  uncheck
} from './data';
import {
  getParentRow,
  getDescendantRows,
  getStartIndexToAppendRow,
  traverseAncestorRows,
  traverseDescendantRows,
  getChildRowKeys,
  isLeaf,
  isExpanded,
  isRootChildRow,
  getDepth
} from '../query/tree';
import { getEventBus } from '../event/eventBus';
import GridEvent from '../event/gridEvent';
import { flattenTreeData, getTreeIndentWidth } from '../store/helper/tree';
import { findProp, findPropIndex, removeArrayItem, someProp } from '../helper/common';
import { Column, ColumnInfo, VisibleColumnsBySide } from '@t/store/column';
import { cls } from '../helper/dom';
import { ColumnCoords } from '@t/store/columnCoords';

function changeExpandedAttr(row: Row, expanded: boolean) {
  const { tree } = row._attributes;

  if (tree) {
    row._attributes.expanded = expanded;
    tree.expanded = expanded;
  }
}

function changeHiddenAttr(row: Row, hidden: boolean) {
  const { tree } = row._attributes;

  if (tree) {
    tree.hidden = hidden;
  }
}

function getColumnSide(columnName: string, visibleColumns: VisibleColumnsBySide) {
  return someProp('name', columnName, visibleColumns.R) ? 'R' : 'L';
}

function expand(store: Store, row: Row, recursive?: boolean) {
  const { rowKey } = row;
  const eventBus = getEventBus(store.id);
  const gridEvent = new GridEvent({ rowKey });

  /**
   * Occurs when the row having child rows is expanded
   * @event Grid#expand
   * @type {module:event/gridEvent}
   * @property {number|string} rowKey - rowKey of the expanded row
   * @property {Grid} instance - Current grid instance
   */
  eventBus.trigger('expand', gridEvent);

  if (gridEvent.isStopped()) {
    return;
  }

  const { data, rowCoords, dimension, column, id, viewport, columnCoords } = store;

  const { heights } = rowCoords;

  changeExpandedAttr(row, true);

  const childRowKeys = getChildRowKeys(row);

  updateTreeColumnWidth(childRowKeys, column, columnCoords, data.rawData);

  childRowKeys.forEach(childRowKey => {
    const childRow = findRowByRowKey(data, column, id, childRowKey);

    if (!childRow) {
      return;
    }

    changeHiddenAttr(childRow, false);

    if (!isLeaf(childRow) && (isExpanded(childRow) || recursive)) {
      expand(store, childRow, recursive);
    }

    const index = findIndexByRowKey(data, column, id, childRowKey);
    heights[index] = getRowHeight(childRow, dimension.rowHeight);
  });

  if (childRowKeys.length) {
    notify(rowCoords, 'heights');
    notify(viewport, 'rowRange');
  }
}

function updateTreeColumnWidth(
  childRowKeys: RowKey[],
  column: Column,
  columnCoords: ColumnCoords,
  rawData: Row[]
) {
  const { visibleColumnsBySideWithRowHeader, treeIcon } = column;
  const treeColumnName = column.treeColumnName!;
  const treeColumnSide = getColumnSide(treeColumnName, visibleColumnsBySideWithRowHeader);
  const treeColumnIndex = findPropIndex(
    'name',
    treeColumnName,
    column.visibleColumnsBySide[treeColumnSide]
  );

  const columnInfo = visibleColumnsBySideWithRowHeader[treeColumnSide][treeColumnIndex];

  if (columnInfo.resizable) {
    const maxWidth = getChildTreeNodeMaxWidth(
      childRowKeys,
      rawData,
      columnInfo,
      treeColumnName,
      treeIcon
    );
    const prevWidth = columnCoords.widths[treeColumnSide][treeColumnIndex];

    if (prevWidth < maxWidth) {
      columnCoords.widths[treeColumnSide][treeColumnIndex] = maxWidth;
      notify(columnCoords, 'widths');
    }
  }
}

function getTextWidth(text: string, font: string) {
  const context = document.createElement('canvas').getContext('2d')!;
  context.font = font;
  const { width } = context.measureText(String(text));

  return Math.ceil(width);
}

function getComputedFontStyle() {
  const firstTreeNode = document.querySelector(
    `.${cls('tree-wrapper-relative')} .${cls('cell-content')}`
  )!;

  const compStyle = getComputedStyle(firstTreeNode);
  const fontSize = compStyle.getPropertyValue('font-size');
  const fontWeight = compStyle.getPropertyValue('font-weight');
  const fontFamily = compStyle.getPropertyValue('font-family');

  return `${fontWeight} ${fontSize} ${fontFamily}`;
}

function getChildTreeNodeMaxWidth(
  childRowKeys: RowKey[],
  rawData: Row[],
  column: ColumnInfo,
  treeColumnName: string,
  useIcon?: boolean
) {
  const fontStyle = getComputedFontStyle();
  const CELL_CONTENT_LEFT_PADDING = 14;
  const CELL_CONTENT_RIGHT_PADDING = 5;

  return Math.max(
    ...childRowKeys.map(rowKey => {
      const row = findProp('rowKey', rowKey, rawData)!;
      const value = row[treeColumnName];
      const { formatter, defaultValue } = column;
      const indentWidth = getTreeIndentWidth(getDepth(rawData, row), useIcon);

      const formattedValue = getFormattedValue(
        { row, column, value },
        formatter,
        defaultValue || value
      );

      return (
        getTextWidth(formattedValue, fontStyle) +
        indentWidth +
        CELL_CONTENT_LEFT_PADDING +
        CELL_CONTENT_RIGHT_PADDING
      );
    })
  );
}

function collapse(store: Store, row: Row, recursive?: boolean) {
  const { rowKey } = row;
  const eventBus = getEventBus(store.id);
  const gridEvent = new GridEvent({ rowKey });

  /**
   * Occurs when the row having child rows is collapsed
   * @event Grid#collapse
   * @type {module:event/gridEvent}
   * @property {number|string} rowKey - rowKey of the collapsed row
   * @property {Grid} instance - Current grid instance
   */
  eventBus.trigger('collapse', gridEvent);

  if (gridEvent.isStopped()) {
    return;
  }

  const { data, rowCoords, column, id } = store;
  const { heights } = rowCoords;

  changeExpandedAttr(row, false);

  const childRowKeys = getChildRowKeys(row);

  childRowKeys.forEach(childRowKey => {
    const childRow = findRowByRowKey(data, column, id, childRowKey);

    if (!childRow) {
      return;
    }

    changeHiddenAttr(childRow, true);

    if (!isLeaf(childRow)) {
      if (recursive) {
        collapse(store, childRow, recursive);
      } else {
        getDescendantRows(store, childRowKey).forEach(({ rowKey: descendantRowKey }) => {
          const index = findIndexByRowKey(data, column, id, descendantRowKey);
          heights[index] = 0;
        });
      }
    }

    const index = findIndexByRowKey(data, column, id, childRowKey);
    heights[index] = 0;
  });

  notify(rowCoords, 'heights');
}

function setCheckedState(row: Row, state: boolean) {
  if (row && isUpdatableRowAttr('checked', row._attributes.checkDisabled)) {
    row._attributes.checked = state;
  }
}

function changeAncestorRowsCheckedState(store: Store, rowKey: RowKey) {
  const { data, column, id } = store;
  const { rawData } = data;
  const row = findRowByRowKey(data, column, id, rowKey);

  if (row) {
    traverseAncestorRows(rawData, row, (parentRow: Row) => {
      const childRowKeys = getChildRowKeys(parentRow);
      const checkedChildRows = childRowKeys.filter(childRowKey => {
        const childRow = findRowByRowKey(data, column, id, childRowKey);

        return !!childRow && childRow._attributes.checked;
      });
      const checked = childRowKeys.length === checkedChildRows.length;

      setCheckedState(parentRow, checked);
    });
  }
}

function changeDescendantRowsCheckedState(store: Store, rowKey: RowKey, state: boolean) {
  const { data, column, id } = store;
  const { rawData } = data;
  const row = findRowByRowKey(data, column, id, rowKey);

  if (row) {
    traverseDescendantRows(rawData, row, (childRow: Row) => {
      setCheckedState(childRow, state);
    });
  }
}

function removeChildRowKey(row: Row, rowKey: RowKey) {
  const { tree } = row._attributes;

  if (tree) {
    removeArrayItem(rowKey, tree.childRowKeys);
    notify(tree, 'childRowKeys');
  }
}

export function removeExpandedAttr(row: Row) {
  const { tree } = row._attributes;

  if (tree) {
    delete tree.expanded;
    notify(tree, 'expanded');
  }
}

export function expandByRowKey(store: Store, rowKey: RowKey, recursive?: boolean) {
  const { data, column, id } = store;
  const row = findRowByRowKey(data, column, id, rowKey);

  if (row) {
    expand(store, row, recursive);
  }
}

export function expandAll(store: Store) {
  store.data.rawData.forEach(row => {
    if (isRootChildRow(row) && !isLeaf(row)) {
      expand(store, row, true);
    }
  });
}

export function collapseByRowKey(store: Store, rowKey: RowKey, recursive?: boolean) {
  const { data, column, id } = store;
  const row = findRowByRowKey(data, column, id, rowKey);

  if (row) {
    collapse(store, row, recursive);
  }
}

export function collapseAll(store: Store) {
  store.data.rawData.forEach(row => {
    if (isRootChildRow(row) && !isLeaf(row)) {
      collapse(store, row, true);
    }
  });
}

export function changeTreeRowsCheckedState(store: Store, rowKey: RowKey, state: boolean) {
  const { treeColumnName, treeCascadingCheckbox } = store.column;

  if (treeColumnName && treeCascadingCheckbox) {
    changeDescendantRowsCheckedState(store, rowKey, state);
    changeAncestorRowsCheckedState(store, rowKey);
  }
}

// @TODO: consider tree disabled state with cascading
export function appendTreeRow(store: Store, row: OptRow, options: OptAppendTreeRow) {
  const { data, column, rowCoords, dimension, id } = store;
  const { rawData, viewData } = data;
  const { columnMapWithRelation, treeColumnName, treeIcon } = column;
  const { heights } = rowCoords;
  const { parentRowKey, offset } = options;
  const parentRow = findRowByRowKey(data, column, id, parentRowKey);
  const startIdx = getStartIndexToAppendRow(store, parentRow!, offset);
  const rawRows = flattenTreeData([row], parentRow!, columnMapWithRelation, {
    keyColumnName: column.keyColumnName,
    offset
  });

  rawData.splice(startIdx, 0, ...rawRows);
  const viewRows = rawRows.map(rawRow =>
    createViewRow(rawRow, columnMapWithRelation, rawData, treeColumnName, treeIcon)
  );
  viewData.splice(startIdx, 0, ...viewRows);
  const rowHeights = rawRows.map(rawRow => getRowHeight(rawRow, dimension.rowHeight));
  heights.splice(startIdx, 0, ...rowHeights);

  rawRows.forEach(rawRow => {
    changeTreeRowsCheckedState(store, rawRow.rowKey, rawRow._attributes.checked);
    getDataManager(id).push('CREATE', rawRow, true);
  });
  setLoadingState(store, getLoadingState(rawData));
  updateRowNumber(store, startIdx);
  setCheckedAllRows(store);
}

// @TODO: consider tree disabled state with cascading
export function removeTreeRow(store: Store, rowKey: RowKey) {
  const { data, rowCoords, id, column } = store;
  const { rawData, viewData } = data;
  const { heights } = rowCoords;
  const parentRow = getParentRow(store, rowKey);

  uncheck(store, rowKey);

  if (parentRow) {
    removeChildRowKey(parentRow, rowKey);

    if (!getChildRowKeys(parentRow).length) {
      removeExpandedAttr(parentRow);
    }
  }

  const startIdx = findIndexByRowKey(data, column, id, rowKey);
  const deleteCount = getDescendantRows(store, rowKey).length + 1;

  viewData.splice(startIdx, deleteCount);
  const removedRows = rawData.splice(startIdx, deleteCount);
  heights.splice(startIdx, deleteCount);

  for (let i = removedRows.length - 1; i >= 0; i -= 1) {
    getDataManager(id).push('DELETE', removedRows[i]);
  }
  setLoadingState(store, getLoadingState(rawData));
  updateRowNumber(store, startIdx);
  setCheckedAllRows(store);
}
