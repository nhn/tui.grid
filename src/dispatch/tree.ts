import { OptRow, OptAppendRow, OptRemoveRow } from '../types';
import { Store, Row, RowKey } from '../store/types';
import { getRowHeight } from '../store/rowCoords';
import { findProp, findPropIndex } from '../helper/common';
import { notify } from '../helper/observable';
import { isUpdatableRowAttr } from '../dispatch/data';
import { getParentRow } from '../query/tree';
import {
  traverseAncestorRows,
  traverseDescendantRows,
  isLeaf,
  getChildRowKeys,
  getHiddenChildState
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

function changeDecendantRowsCheckedState(store: Store, rowKey: RowKey, state: boolean) {
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
    changeDecendantRowsCheckedState(store, rowKey, state);
    changeAncestorRowsCheckedState(store, rowKey);
  }
}

export function appendTreeRow(store: Store, row: OptRow, options: OptAppendRow) {
  // @TODO 로직 추가
}

export function removeTreeRow(store: Store, rowKey: RowKey, options: OptRemoveRow) {
  // @TODO 로직 추가
}
