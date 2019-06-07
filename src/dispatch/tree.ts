import { OptRow, OptAppendRow, OptRemoveRow } from '../types';
import { Store, Row, RowKey } from '../store/types';
import { createViewRow } from '../store/data';
import { getRowHeight } from '../store/rowCoords';
import { findProp, findPropIndex, isUndefined } from '../helper/common';
import { notify } from '../helper/observable';
import { isUpdatableRowAttr } from '../dispatch/data';
import { getParentRow, getDescendantRows } from '../query/tree';
import {
  flattenTreeData,
  traverseAncestorRows,
  traverseDescendantRows,
  removeChildRowKey,
  isLeaf,
  getHiddenChildState,
  getChildRowKeys
} from '../helper/tree';
import { getEventBus } from '../event/eventBus';
import GridEvent from '../event/gridEvent';

function changeExpandedState(row: Row, expanded: boolean) {
  const { tree } = row._attributes;

  if (tree) {
    tree.expanded = expanded;
  }
}

function changeHiddenChildState(row: Row, hidden: boolean) {
  const { tree } = row._attributes;

  if (tree) {
    tree.hiddenChild = hidden;
  }
}

function expand(store: Store, row: Row, recursive?: boolean, silent?: boolean) {
  const { data, rowCoords, dimension } = store;
  const { rawData } = data;
  const { heights } = rowCoords;

  if (row) {
    if (!isLeaf(row)) {
      changeExpandedState(row, true);
    }

    traverseDescendantRows(rawData, row, (childRow: Row) => {
      if (recursive) {
        changeExpandedState(childRow, true);
      }

      const parentRow = getParentRow(store, childRow.rowKey);
      const hiddenChild = parentRow ? getHiddenChildState(parentRow) : false;

      changeHiddenChildState(childRow, hiddenChild);

      const index = findPropIndex('rowKey', childRow.rowKey, rawData);
      heights[index] = getRowHeight(childRow, dimension.rowHeight);
    });

    if (silent) {
      notify(rowCoords, 'heights');
    }
  }
}

export function expandByRowKey(store: Store, rowKey: RowKey, recursive?: boolean) {
  const row = findProp('rowKey', rowKey, store.data.rawData);

  if (row) {
    const eventBus = getEventBus(store.id);
    const gridEvent = new GridEvent({ rowKey });

    /**
     * Occurs when the row having child rows is expanded
     * @event Grid#expanded
     * @type {module:event/gridEvent}
     * @property {number|string} rowKey - rowKey of the expanded row
     * @property {Grid} instance - Current grid instance
     */
    eventBus.trigger('expand', gridEvent);

    expand(store, row, recursive, true);
  }
}

export function expandAll(store: Store) {
  const { data, rowCoords } = store;

  data.rawData.forEach((row) => {
    expand(store, row, true, false);
  });

  notify(rowCoords, 'heights');
}

function collapse(store: Store, row: Row, recursive?: boolean, silent?: boolean) {
  const { data, rowCoords } = store;
  const { rawData } = data;
  const { heights } = rowCoords;

  if (row) {
    if (!isLeaf(row)) {
      changeExpandedState(row, false);
    }

    traverseDescendantRows(rawData, row, (childRow: Row) => {
      if (recursive) {
        changeExpandedState(childRow, false);
      }

      const parentRow = getParentRow(store, childRow.rowKey);
      const hiddenChild = parentRow ? getHiddenChildState(parentRow) : true;

      changeHiddenChildState(childRow, hiddenChild);

      const index = findPropIndex('rowKey', childRow.rowKey, rawData);
      heights[index] = 0;
    });

    if (silent) {
      notify(rowCoords, 'heights');
    }
  }
}

export function collapseByRowKey(store: Store, rowKey: RowKey, recursive?: boolean) {
  const row = findProp('rowKey', rowKey, store.data.rawData);

  if (row) {
    const eventBus = getEventBus(store.id);
    const gridEvent = new GridEvent({ rowKey });

    /**
     * Occurs when the row having child rows is collapsed
     * @event Grid#collapsed
     * @type {module:event/gridEvent}
     * @property {number|string} rowKey - rowKey of the collapsed row
     * @property {Grid} instance - Current grid instance
     */
    eventBus.trigger('collapse', gridEvent);

    collapse(store, row, recursive, true);
  }
}

export function collapseAll(store: Store) {
  const { data, rowCoords } = store;

  data.rawData.forEach((row) => {
    collapse(store, row, true, false);
  });

  notify(rowCoords, 'heights');
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

export function appendTreeRow(store: Store, row: OptRow, options: OptAppendRow) {
  const { data, column, rowCoords, dimension } = store;
  const { rawData, viewData } = data;
  const { defaultValues, allColumnMap, treeColumnName, treeIcon } = column;
  const { heights } = rowCoords;
  const { parentRowKey = -1 } = options;

  const parentRowIdx = findPropIndex('rowKey', parentRowKey, rawData);
  const parentRow = rawData[parentRowIdx];

  const startIdx =
    parentRowKey > -1
      ? parentRowIdx + getDescendantRows(store, parentRow.rowKey).length + 1
      : rawData.length;

  const rawRows = flattenTreeData([row], defaultValues, parentRow);
  rawData.splice(startIdx, 0, ...rawRows);

  const viewRows = rawRows.map((rawRow: Row) =>
    createViewRow(rawRow, allColumnMap, rawData, treeColumnName, treeIcon)
  );
  viewData.splice(startIdx, 0, ...viewRows);

  const rowHeights = rawRows.map((rawRow: Row) => getRowHeight(rawRow, dimension.rowHeight));
  heights.splice(startIdx, 0, ...rowHeights);

  notify(data, 'rawData');
  notify(data, 'viewData');
  notify(rowCoords, 'heights');

  // @todo net 연동
}

export function removeTreeRow(store: Store, rowKey: RowKey, options: OptRemoveRow) {
  const { data, rowCoords } = store;
  const { rawData, viewData } = data;
  const { heights } = rowCoords;

  const parentRow = getParentRow(store, rowKey);

  if (parentRow) {
    removeChildRowKey(parentRow, parentRow.rowKey);
  }

  const startIdx = findPropIndex('rowKey', rowKey, rawData);
  const endIdx = getDescendantRows(store, rowKey).length + 1;

  rawData.splice(startIdx, endIdx);
  viewData.splice(startIdx, endIdx);
  heights.splice(startIdx, endIdx);

  notify(data, 'rawData');
  notify(data, 'viewData');
  notify(rowCoords, 'heights');

  // @todo net 연동
}
