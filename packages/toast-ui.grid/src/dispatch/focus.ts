import { Store, RowKey, CellValue } from '../store/types';
import GridEvent from '../event/gridEvent';
import { getEventBus } from '../event/eventBus';
import { isEditableCell, findIndexByRowKey, findRowByRowKey } from '../query/data';
import { isFocusedCell, isEditingCell } from '../query/focus';
import { getRowSpanByRowKey, isRowSpanEnabled } from '../query/rowSpan';
import { createRawRow, createViewRow } from '../store/data';
import { isObservable, notify } from '../helper/observable';
import { setValue } from './data';
import { isUndefined } from '../helper/common';
import { createTreeRawRow } from '../store/helper/tree';
import { isHiddenColumn } from '../query/column';

function makeObservable(store: Store, rowKey: RowKey) {
  const { data, column, id } = store;
  const { rawData, viewData } = data;
  const { columnMapWithRelation, treeColumnName, treeIcon, defaultValues } = column;
  const foundIndex = findIndexByRowKey(data, column, id, rowKey, false);
  const rawRow = rawData[foundIndex];

  if (isObservable(rawRow)) {
    return;
  }

  if (treeColumnName) {
    const parentRow = findRowByRowKey(data, column, id, rawRow._attributes.tree!.parentRowKey);
    rawData[foundIndex] = createTreeRawRow(
      rawRow,
      column.defaultValues,
      parentRow || null,
      columnMapWithRelation
    );
    viewData[foundIndex] = createViewRow(
      rawData[foundIndex],
      columnMapWithRelation,
      rawData,
      treeColumnName,
      treeIcon
    );
  } else {
    rawData[foundIndex] = createRawRow(rawRow, foundIndex, defaultValues, columnMapWithRelation);
    viewData[foundIndex] = createViewRow(rawData[foundIndex], columnMapWithRelation, rawData);
  }
  notify(data, 'rawData');
  notify(data, 'viewData');
}

export function startEditing(store: Store, rowKey: RowKey, columnName: string) {
  const { data, focus, column, id } = store;
  const { filteredRawData } = data;
  const foundIndex = findIndexByRowKey(data, column, id, rowKey);

  if (foundIndex === -1) {
    return;
  }

  // makes the data observable to judge editable, disable of the cell;
  makeObservable(store, rowKey);

  if (!isEditableCell(data, column, foundIndex, columnName)) {
    return;
  }

  const eventBus = getEventBus(id);
  const gridEvent = new GridEvent({
    rowKey,
    columnName,
    value: filteredRawData[foundIndex][columnName]
  });

  /**
   * Occurs when editing the cell is started
   * @event Grid#editingStart
   * @property {number} rowKey - rowKey of the target cell
   * @property {number} columnName - columnName of the target cell
   * @property {number | string | boolean | null | undefined} value - value of the editing cell
   * @property {Grid} instance - Current grid instance
   */
  eventBus.trigger('editingStart', gridEvent);

  if (!gridEvent.isStopped()) {
    focus.forcedDestroyEditing = false;
    focus.navigating = false;
    focus.editingAddress = { rowKey, columnName };
  }
}

export function finishEditing(
  { focus, id }: Store,
  rowKey: RowKey,
  columnName: string,
  value: CellValue
) {
  const eventBus = getEventBus(id);
  const gridEvent = new GridEvent({ rowKey, columnName, value });

  /**
   * Occurs when editing the cell is finished
   * @event Grid#editingFinish
   * @property {number} rowKey - rowKey of the target cell
   * @property {number} columnName - columnName of the target cell
   * @property {number | string | boolean | null | undefined} value - value of the editing cell
   * @property {Grid} instance - Current grid instance
   */
  eventBus.trigger('editingFinish', gridEvent);

  if (!gridEvent.isStopped()) {
    if (isEditingCell(focus, rowKey, columnName)) {
      focus.editingAddress = null;
      focus.navigating = true;
    }
  }
}

export function changeFocus(
  store: Store,
  rowKey: RowKey | null,
  columnName: string | null,
  id: number
) {
  const { data, focus, column } = store;

  if (
    isFocusedCell(focus, rowKey, columnName) ||
    (columnName && isHiddenColumn(column, columnName))
  ) {
    return;
  }

  const { rawData, sortState } = data;
  const eventBus = getEventBus(id);
  const gridEvent = new GridEvent({
    rowKey,
    columnName,
    prevColumnName: focus.columnName,
    prevRowKey: focus.rowKey
  });

  /**
   * Occurs when focused cell is about to change
   * @event Grid#focusChange
   * @property {number} rowKey - rowKey of the target cell
   * @property {number} columnName - columnName of the target cell
   * @property {number} prevRowKey - rowKey of the currently focused cell
   * @property {number} prevColumnName - columnName of the currently focused cell
   * @property {Grid} instance - Current grid instance
   */
  eventBus.trigger('focusChange', gridEvent);

  if (!gridEvent.isStopped()) {
    let focusRowKey = rowKey;

    if (rowKey && columnName && isRowSpanEnabled(sortState)) {
      const rowSpan = getRowSpanByRowKey(rowKey, columnName, rawData);
      if (rowSpan) {
        focusRowKey = rowSpan.mainRowKey;
      }
    }

    focus.prevColumnName = focus.columnName;
    focus.prevRowKey = focus.rowKey;
    focus.columnName = columnName;
    focus.rowKey = focusRowKey;
  }
}

export function initFocus({ focus }: Store) {
  focus.editingAddress = null;
  focus.navigating = false;
  focus.rowKey = null;
  focus.columnName = null;
  focus.prevRowKey = null;
  focus.prevColumnName = null;
}

export function saveAndFinishEditing(store: Store, value?: string) {
  // @TODO: remove 'value' paramter
  // saveAndFinishEditing(store: Store)

  const { focus } = store;
  const { editingAddress } = focus;

  if (!editingAddress) {
    return;
  }

  const { rowKey, columnName } = editingAddress;

  // makes the data observable to judge editable, disable of the cell.
  makeObservable(store, rowKey);

  // if value is 'undefined', editing result is saved and finished.
  if (isUndefined(value)) {
    focus.editingAddress = null;
    focus.forcedDestroyEditing = true;
    focus.navigating = true;
    return;
  }

  setValue(store, rowKey, columnName, value);
  finishEditing(store, rowKey, columnName, value);
}

export function setFocusInfo(
  store: Store,
  rowKey: RowKey | null,
  columnName: string | null,
  navigating: boolean
) {
  const { focus, id } = store;
  focus.navigating = navigating;

  changeFocus(store, rowKey, columnName, id);
}
