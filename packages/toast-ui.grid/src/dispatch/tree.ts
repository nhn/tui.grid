import { Row, RowKey } from '@t/store/data';
import { Store } from '@t/store';
import { OptRow, OptAppendTreeRow, OptMoveRow } from '@t/options';
import { Column, ColumnInfo } from '@t/store/column';
import { ColumnCoords } from '@t/store/columnCoords';
import { Dimension } from '@t/store/dimension';
import { createViewRow } from '../store/data';
import {
  getRowHeight,
  findIndexByRowKey,
  findRowByRowKey,
  getLoadingState,
  isSorted,
  isFiltered,
} from '../query/data';
import { notify, batchObserver, getOriginObject, Observable } from '../helper/observable';
import { getDataManager } from '../instance';
import {
  isUpdatableRowAttr,
  setLoadingState,
  updateRowNumber,
  setCheckedAllRows,
  uncheck,
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
  getDepth,
} from '../query/tree';
import { getEventBus } from '../event/eventBus';
import GridEvent from '../event/gridEvent';
import { flattenTreeData, getTreeIndentWidth } from '../store/helper/tree';
import { findProp, findPropIndex, removeArrayItem, some } from '../helper/common';
import { getComputedFontStyle, getTextWidth } from '../helper/dom';
import { fillMissingColumnData } from './lazyObservable';
import { getColumnSide } from '../query/column';
import { createFormattedValue } from '../store/helper/data';
import { TREE_CELL_HORIZONTAL_PADDING } from '../helper/constant';
import { setAutoResizingColumnWidths } from './column';

let computedFontStyle = '';

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

  updateTreeColumnWidth(childRowKeys, column, columnCoords, dimension, data.rawData);

  childRowKeys.forEach((childRowKey) => {
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
  dimension: Dimension,
  rawData: Row[]
) {
  const { visibleColumnsBySideWithRowHeader, treeIcon, allColumnMap } = column;
  const treeColumnName = column.treeColumnName!;
  const treeColumnSide = getColumnSide(column, treeColumnName);
  const treeColumnIndex = findPropIndex(
    'name',
    treeColumnName,
    column.visibleColumnsBySide[treeColumnSide]
  );

  const columnInfo = visibleColumnsBySideWithRowHeader[treeColumnSide][treeColumnIndex];

  // @TODO: auto resizing is operated with 'autoResizing' option
  // 'resizable' condition should be deprecated in next version
  if (columnInfo.resizable || columnInfo.autoResizing) {
    const maxWidth = getChildTreeNodeMaxWidth(childRowKeys, rawData, columnInfo, treeIcon);
    const prevWidth =
      columnCoords.widths[treeColumnSide][treeColumnIndex] + dimension.cellBorderWidth;

    allColumnMap[treeColumnName].baseWidth = Math.max(prevWidth, maxWidth);
    allColumnMap[treeColumnName].fixedWidth = true;
  }
}

function getChildTreeNodeMaxWidth(
  childRowKeys: RowKey[],
  rawData: Row[],
  column: ColumnInfo,
  useIcon?: boolean
) {
  let maxLength = 0;

  computedFontStyle = computedFontStyle || getComputedFontStyle('tree-wrapper-relative');

  const getMaxWidth = childRowKeys.reduce(
    (acc: () => number, rowKey) => {
      const row = findProp('rowKey', rowKey, rawData)!;
      const formattedValue = createFormattedValue(row, column);

      if (formattedValue.length > maxLength) {
        maxLength = formattedValue.length;
        acc = () =>
          getTextWidth(formattedValue, computedFontStyle) +
          getTreeIndentWidth(getDepth(rawData, row), useIcon) +
          TREE_CELL_HORIZONTAL_PADDING;
      }

      return acc;
    },
    () => 0
  );

  return getMaxWidth();
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

  childRowKeys.forEach((childRowKey) => {
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
          changeHiddenAttr(data.filteredRawData[index], true);
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
      const checkedChildRows = childRowKeys.filter((childRowKey) => {
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
    if (row._children) {
      const index = findPropIndex('rowKey', rowKey, row._children);
      if (index !== -1) {
        row._children.splice(index, 1);
      }
    }
    if (!tree.childRowKeys.length) {
      row._leaf = true;
    }
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
  store.data.rawData.forEach((row) => {
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
  store.data.rawData.forEach((row) => {
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
  const { heights } = rowCoords;
  const { parentRowKey, offset } = options;
  const parentRow = findRowByRowKey(data, column, id, parentRowKey);
  const startIdx = getStartIndexToAppendRow(store, parentRow!, offset);
  const rawRows = flattenTreeData(id, [row], parentRow!, column, {
    keyColumnName: column.keyColumnName,
    offset,
  });

  fillMissingColumnData(column, rawRows);

  const viewRows = rawRows.map((rawRow) => createViewRow(id, rawRow, rawData, column));

  batchObserver(() => {
    rawData.splice(startIdx, 0, ...rawRows);
  });
  viewData.splice(startIdx, 0, ...viewRows);

  const rowHeights = rawRows.map((rawRow) => {
    changeTreeRowsCheckedState(store, rawRow.rowKey, rawRow._attributes.checked);
    getDataManager(id).push('CREATE', rawRow, true);

    return getRowHeight(rawRow, dimension.rowHeight);
  });
  heights.splice(startIdx, 0, ...rowHeights);

  postUpdateAfterManipulation(store, startIdx, rawRows);
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
  let removedRows: Row[] = [];

  batchObserver(() => {
    removedRows = rawData.splice(startIdx, deleteCount);
  });
  viewData.splice(startIdx, deleteCount);
  heights.splice(startIdx, deleteCount);

  for (let i = removedRows.length - 1; i >= 0; i -= 1) {
    getDataManager(id).push('DELETE', removedRows[i]);
  }
  postUpdateAfterManipulation(store, startIdx, rawData);
}

function postUpdateAfterManipulation(store: Store, rowIndex: number, rows?: Row[]) {
  setLoadingState(store, getLoadingState(store.data.rawData));
  updateRowNumber(store, rowIndex);
  setCheckedAllRows(store);
  setAutoResizingColumnWidths(store, rows);
}

export function moveTreeRow(
  store: Store,
  rowKey: RowKey,
  targetIndex: number,
  options: OptMoveRow & { moveToLast?: boolean }
) {
  const { data, column, id } = store;
  const { rawData } = data;
  const targetRow = rawData[targetIndex];

  if (!targetRow || isSorted(data) || isFiltered(data)) {
    return;
  }

  const currentIndex = findIndexByRowKey(data, column, id, rowKey, false);
  const row = rawData[currentIndex];

  if (
    currentIndex === -1 ||
    currentIndex === targetIndex ||
    row._attributes.disabled ||
    (targetRow._attributes.disabled && options.appended)
  ) {
    return;
  }

  const childRows = getDescendantRows(store, rowKey);
  const minIndex = Math.min(currentIndex, targetIndex);
  const moveToChild = some((childRow) => childRow.rowKey === targetRow.rowKey, childRows);

  if (!moveToChild) {
    removeTreeRow(store, rowKey);
    const originRow = getOriginObject(row as Observable<Row>);

    getDataManager(id).push('UPDATE', targetRow, true);
    getDataManager(id).push('UPDATE', row, true);

    if (options.appended) {
      appendTreeRow(store, originRow, { parentRowKey: targetRow.rowKey });
    } else {
      const { parentRowKey } = targetRow._attributes.tree!;
      const parentIndex = findIndexByRowKey(data, column, id, parentRowKey);
      let offset: number;

      // calculate the moving index for considering removed rows
      if (targetIndex > currentIndex) {
        const indexWithoutRemovedRows = targetIndex - (childRows.length + 1);
        offset =
          parentIndex === -1 ? indexWithoutRemovedRows : indexWithoutRemovedRows - parentIndex - 1;
      } else {
        offset = parentIndex === -1 ? targetIndex : targetIndex - parentIndex - 1;
      }

      // to resolve the index for moving last index
      if (options.moveToLast) {
        offset += 1;
      }
      appendTreeRow(store, originRow, { parentRowKey, offset });
    }
    postUpdateAfterManipulation(store, minIndex);
  }
}
