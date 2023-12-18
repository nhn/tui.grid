import { RowKey, CellValue } from '@t/store/data';
import { Store } from '@t/store';
import GridEvent from '../event/gridEvent';
import { getEventBus } from '../event/eventBus';
import { isEditableCell, findIndexByRowKey } from '../query/data';
import { isFocusedCell, isEditingCell } from '../query/focus';
import { getRowSpanByRowKey, isRowSpanEnabled } from '../query/rowSpan';
import { setValue, makeObservable } from './data';
import { isUndefined } from '../helper/common';
import { isHiddenColumn } from '../query/column';

interface EditingInfo {
  save: boolean;
  triggeredByKey?: boolean;
}

export function startEditing(store: Store, rowKey: RowKey, columnName: string) {
  const { data, focus, column, id } = store;
  const { filteredRawData } = data;
  const foundIndex = findIndexByRowKey(data, column, id, rowKey);

  if (foundIndex === -1) {
    return;
  }

  // makes the data observable to judge editable, disable of the cell
  makeObservable({ store, rowIndex: findIndexByRowKey(data, column, id, rowKey, false) });

  if (!isEditableCell(store, foundIndex, columnName)) {
    return;
  }

  const eventBus = getEventBus(id);
  const gridEvent = new GridEvent({
    rowKey,
    columnName,
    value: filteredRawData[foundIndex][columnName],
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

// @TODO: Events should be separated(ex.'editingFinish', 'editingCanceled')
export function finishEditing(
  { focus, id }: Store,
  rowKey: RowKey,
  columnName: string,
  value: CellValue,
  editingInfo: EditingInfo
) {
  if (isEditingCell(focus, rowKey, columnName)) {
    focus.editingAddress = null;
    focus.navigating = true;
  }

  const eventBus = getEventBus(id);
  const gridEvent = new GridEvent({ rowKey, columnName, value, ...editingInfo });

  /**
   * Occurs when editing the cell is finished
   * @event Grid#editingFinish
   * @property {number} rowKey - rowKey of the target cell
   * @property {number} columnName - columnName of the target cell
   * @property {number | string | boolean | null | undefined} value - value of the editing cell
   * @property {Grid} instance - Current grid instance
   * @property {boolean} save - Whether to save the value
   * @property {boolean} triggeredByKey - Whether to trigger the event by key
   */
  eventBus.trigger('editingFinish', gridEvent);
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
    prevRowKey: focus.rowKey,
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

    if (rowKey && columnName && isRowSpanEnabled(sortState, column)) {
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

  const { focus, data, column, id } = store;
  const { editingAddress } = focus;

  if (!editingAddress) {
    return;
  }

  const { rowKey, columnName } = editingAddress;

  // makes the data observable to judge editable, disable of the cell.
  makeObservable({ store, rowIndex: findIndexByRowKey(data, column, id, rowKey, false) });

  // if value is 'undefined', editing result is saved and finished.
  if (isUndefined(value)) {
    focus.forcedDestroyEditing = true;
    focus.editingAddress = null;
    focus.navigating = true;
    return;
  }

  setValue(store, rowKey, columnName, value);
  finishEditing(store, rowKey, columnName, value, { save: true });
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
