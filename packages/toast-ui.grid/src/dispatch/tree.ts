import { OptRow, OptAppendTreeRow } from '../types';
import { Store, Row, RowKey } from '../store/types';
import { createViewRow } from '../store/data';
import { getRowHeight, findIndexByRowKey, findRowByRowKey } from '../query/data';
import { notify } from '../helper/observable';
import { getDataManager } from '../instance';
import { isUpdatableRowAttr } from '../dispatch/data';
import {
  getParentRow,
  getDescendantRows,
  getStartIndexToAppendRow,
  traverseAncestorRows,
  traverseDescendantRows,
  getChildRowKeys,
  isLeaf,
  isExpanded,
  isRootChildRow
} from '../query/tree';
import { getEventBus } from '../event/eventBus';
import GridEvent from '../event/gridEvent';
import { flattenTreeData } from '../store/helper/tree';
import { removeArrayItem } from '../helper/common';

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

  const { data, rowCoords, dimension, column, id, viewport } = store;
  const { heights } = rowCoords;

  changeExpandedAttr(row, true);

  const childRowKeys = getChildRowKeys(row);

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

function setCheckedState(disabled: boolean, row: Row, state: boolean) {
  if (row && isUpdatableRowAttr('checked', row._attributes.checkDisabled, disabled)) {
    row._attributes.checked = state;
  }
}

function changeAncestorRowsCheckedState(store: Store, rowKey: RowKey) {
  const { data, column, id } = store;
  const { rawData, disabled } = data;
  const row = findRowByRowKey(data, column, id, rowKey);

  if (row) {
    traverseAncestorRows(rawData, row, (parentRow: Row) => {
      const childRowKeys = getChildRowKeys(parentRow);
      const checkedChildRows = childRowKeys.filter(childRowKey => {
        const childRow = findRowByRowKey(data, column, id, childRowKey);

        return !!childRow && childRow._attributes.checked;
      });
      const checked = childRowKeys.length === checkedChildRows.length;

      setCheckedState(disabled, parentRow, checked);
    });
  }
}

function changeDescendantRowsCheckedState(store: Store, rowKey: RowKey, state: boolean) {
  const { data, column, id } = store;
  const { rawData, disabled } = data;
  const row = findRowByRowKey(data, column, id, rowKey);

  if (row) {
    traverseDescendantRows(rawData, row, (childRow: Row) => {
      setCheckedState(disabled, childRow, state);
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

export function appendTreeRow(store: Store, row: OptRow, options: OptAppendTreeRow) {
  const { data, column, rowCoords, dimension, id } = store;
  const { rawData, viewData } = data;
  const { defaultValues, columnMapWithRelation, treeColumnName, treeIcon } = column;
  const { heights } = rowCoords;
  const { parentRowKey, offset } = options;
  const parentRow = findRowByRowKey(data, column, id, parentRowKey);
  const startIdx = getStartIndexToAppendRow(store, parentRow!, offset);

  const rawRows = flattenTreeData([row], defaultValues, parentRow!, columnMapWithRelation, {
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
    getDataManager(id).push('CREATE', rawRow);
  });
}

export function removeTreeRow(store: Store, rowKey: RowKey) {
  const { data, rowCoords, id, column } = store;
  const { rawData, viewData } = data;
  const { heights } = rowCoords;
  const parentRow = getParentRow(store, rowKey);

  if (parentRow) {
    removeChildRowKey(parentRow, rowKey);

    if (!getChildRowKeys(parentRow).length) {
      removeExpandedAttr(parentRow);
    }
  }

  const startIdx = findIndexByRowKey(data, column, id, rowKey);
  const endIdx = getDescendantRows(store, rowKey).length + 1;

  const removedRows = rawData.splice(startIdx, endIdx);
  viewData.splice(startIdx, endIdx);
  heights.splice(startIdx, endIdx);

  for (let i = removedRows.length - 1; i >= 0; i -= 1) {
    getDataManager(id).push('DELETE', removedRows[i]);
  }
}
