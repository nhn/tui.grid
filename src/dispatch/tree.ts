import { OptRow, OptAppendTreeRow } from '../types';
import { Store, Row, RowKey } from '../store/types';
import { createViewRow } from '../store/data';
import { getRowHeight } from '../store/rowCoords';
import { findProp, findPropIndex, isUndefined } from '../helper/common';
import { notify } from '../helper/observable';
import { getDataManager } from '../instance';
import { isUpdatableRowAttr } from '../dispatch/data';
import { getParentRow, getDescendantRows } from '../query/tree';
import {
  flattenTreeData,
  traverseAncestorRows,
  traverseDescendantRows,
  getChildRowKeys,
  removeChildRowKey,
  isLeaf,
  isExpanded,
  isRootChildRow
} from '../helper/tree';
import { getEventBus } from '../event/eventBus';
import GridEvent from '../event/gridEvent';

function changeExpandedAttr(row: Row, expanded: boolean) {
  const { tree } = row._attributes;

  if (tree) {
    tree.expanded = expanded;
  }
}

function changeHiddenAttr(row: Row, hidden: boolean) {
  const { tree } = row._attributes;

  if (tree) {
    tree.hidden = hidden;
  }
}

export function removeExpandedAttr(row: Row) {
  const { tree } = row._attributes;

  if (tree) {
    delete tree.expanded;
    notify(tree, 'expanded');
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

  const { data, rowCoords, dimension } = store;
  const { rawData } = data;
  const { heights } = rowCoords;

  changeExpandedAttr(row, true);

  const childRowKeys = getChildRowKeys(row);

  childRowKeys.forEach((childRowKey) => {
    const childRow = findProp('rowKey', childRowKey, rawData);

    if (!childRow) {
      return;
    }

    changeHiddenAttr(childRow, false);

    if (!isLeaf(childRow) && (isExpanded(childRow) || recursive)) {
      expand(store, childRow, recursive);
    }

    const index = findPropIndex('rowKey', childRowKey, rawData);
    heights[index] = getRowHeight(childRow, dimension.rowHeight);

    notify(rowCoords, 'heights');
  });
}

export function expandByRowKey(store: Store, rowKey: RowKey, recursive?: boolean) {
  const row = findProp('rowKey', rowKey, store.data.rawData);

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

  const { data, rowCoords } = store;
  const { rawData } = data;
  const { heights } = rowCoords;

  changeExpandedAttr(row, false);

  const childRowKeys = getChildRowKeys(row);

  childRowKeys.forEach((childRowKey) => {
    const childRow = findProp('rowKey', childRowKey, rawData);

    if (!childRow) {
      return;
    }

    changeHiddenAttr(childRow, true);

    if (!isLeaf(childRow)) {
      if (recursive) {
        collapse(store, childRow, recursive);
      } else {
        getDescendantRows(store, childRowKey).forEach(({ rowKey: descendantRowKey }) => {
          const index = findPropIndex('rowKey', descendantRowKey, rawData);
          heights[index] = 0;
        });
      }
    }

    const index = findPropIndex('rowKey', childRowKey, rawData);
    heights[index] = 0;
  });

  notify(rowCoords, 'heights');
}

export function collapseByRowKey(store: Store, rowKey: RowKey, recursive?: boolean) {
  const row = findProp('rowKey', rowKey, store.data.rawData);

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

function setCheckedState(disabled: boolean, row: Row, state: boolean) {
  if (row && isUpdatableRowAttr('checked', row._attributes.checkDisabled, disabled)) {
    row._attributes.checked = state;
  }
}

function changeAncestorRowsCheckedState(store: Store, rowKey: RowKey) {
  const { rawData, disabled } = store.data;
  const row = findProp('rowKey', rowKey, rawData);

  if (row) {
    traverseAncestorRows(rawData, row, (parentRow: Row) => {
      const childRowKeys = getChildRowKeys(parentRow);
      const checkedChildRows = childRowKeys.filter((childRowKey) => {
        const childRow = findProp('rowKey', childRowKey, rawData);

        return !!childRow && childRow._attributes.checked;
      });
      const checked = childRowKeys.length === checkedChildRows.length;

      setCheckedState(disabled, parentRow, checked);
    });
  }
}

function changeDescendantRowsCheckedState(store: Store, rowKey: RowKey, state: boolean) {
  const { rawData, disabled } = store.data;
  const row = findProp('rowKey', rowKey, rawData);

  if (row) {
    traverseDescendantRows(rawData, row, (childRow: Row) => {
      setCheckedState(disabled, childRow, state);
    });
  }
}

export function changeTreeRowsCheckedState(store: Store, rowKey: RowKey, state: boolean) {
  const { treeColumnName, treeCascadingCheckbox } = store.column;

  if (treeColumnName && treeCascadingCheckbox) {
    changeDescendantRowsCheckedState(store, rowKey, state);
    changeAncestorRowsCheckedState(store, rowKey);
  }
}

function getStartIndexToAppendRow(store: Store, parentRow: Row, offset?: number) {
  const { data } = store;
  const { rawData } = data;
  let startIdx;

  if (parentRow) {
    if (offset) {
      const childRowKeys = getChildRowKeys(parentRow);
      const prevChildRowKey = childRowKeys[offset - 1];
      const prevChildRowIdx = findPropIndex('rowKey', prevChildRowKey, rawData);
      const descendantRowsCount = getDescendantRows(store, prevChildRowKey).length;

      startIdx = prevChildRowIdx + descendantRowsCount + 1;
    } else {
      startIdx = findPropIndex('rowKey', parentRow.rowKey, rawData) + 1;

      if (isUndefined(offset)) {
        startIdx += getDescendantRows(store, parentRow.rowKey).length;
      }
    }
  } else {
    startIdx = isUndefined(offset) ? rawData.length : offset;
  }

  return startIdx;
}

export function appendTreeRow(store: Store, row: OptRow, options: OptAppendTreeRow) {
  const { data, column, rowCoords, dimension, id } = store;
  const { rawData, viewData } = data;
  const { defaultValues, allColumnMap, treeColumnName, treeIcon } = column;
  const { heights } = rowCoords;
  const { parentRowKey, offset } = options;
  const parentRow = findProp('rowKey', parentRowKey, rawData);
  const startIdx = getStartIndexToAppendRow(store, parentRow!, offset);

  const rawRows = flattenTreeData([row], defaultValues, parentRow!, {
    keyColumnName: column.keyColumnName,
    offset
  });
  rawData.splice(startIdx, 0, ...rawRows);

  const viewRows = rawRows.map((rawRow) =>
    createViewRow(rawRow, allColumnMap, rawData, treeColumnName, treeIcon)
  );
  viewData.splice(startIdx, 0, ...viewRows);

  const rowHeights = rawRows.map((rawRow) => getRowHeight(rawRow, dimension.rowHeight));
  heights.splice(startIdx, 0, ...rowHeights);

  notify(data, 'rawData');
  notify(data, 'viewData');
  notify(rowCoords, 'heights');

  rawRows.forEach((rawRow) => {
    getDataManager(id).push('CREATE', rawRow);
  });
}

export function removeTreeRow(store: Store, rowKey: RowKey) {
  const { data, rowCoords, id } = store;
  const { rawData, viewData } = data;
  const { heights } = rowCoords;
  const parentRow = getParentRow(store, rowKey);

  if (parentRow) {
    removeChildRowKey(parentRow, parentRow.rowKey);

    if (!getChildRowKeys(parentRow).length) {
      removeExpandedAttr(parentRow);
    }
  }

  const startIdx = findPropIndex('rowKey', rowKey, rawData);
  const endIdx = getDescendantRows(store, rowKey).length + 1;

  const removedRows = rawData.splice(startIdx, endIdx);
  viewData.splice(startIdx, endIdx);
  heights.splice(startIdx, endIdx);

  notify(data, 'rawData');
  notify(data, 'viewData');
  notify(rowCoords, 'heights');

  for (let i = removedRows.length - 1; i >= 0; i -= 1) {
    getDataManager(id).push('DELETE', removedRows[i]);
  }
}
