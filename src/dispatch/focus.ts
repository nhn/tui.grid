import { Store, RowKey, Focus, Data } from '../store/types';
import GridEvent from '../event/gridEvent';
import { getEventBus } from '../event/eventBus';
import { isCellEditable, findIndexByRowKey } from '../query/data';
import { isFocusedCell } from '../query/focus';
import { getRowSpanByRowKey, isRowSpanEnabled } from '../helper/rowSpan';
import { createRawRow, createViewRow } from '../store/data';
import { isObservable } from '../helper/observable';

export function startEditing(store: Store, rowKey: RowKey, columnName: string) {
  const { data, focus, column, id } = store;
  const { rawData, viewData } = data;
  const { allColumnMap } = column;
  const foundIndex = findIndexByRowKey(data, column, id, rowKey);
  const rawRow = rawData[foundIndex];

  // makes the data observable to judge editable, disable of the cell;
  if (!isObservable(rawRow)) {
    rawData[foundIndex] = createRawRow(rawRow, foundIndex, column.defaultValues);
    viewData[foundIndex] = createViewRow(rawData[foundIndex], allColumnMap, rawData);
  }

  if (!isCellEditable(data, rowKey, columnName)) {
    return;
  }

  const eventBus = getEventBus(id);
  const gridEvent = new GridEvent({
    rowKey,
    columnName,
    value: rawData[foundIndex][columnName]
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
    const columnInfo = allColumnMap[columnName];
    if (columnInfo && columnInfo.editor) {
      focus.navigating = false;
      focus.editingAddress = { rowKey, columnName };
    }
  }
}

export function finishEditing(
  { focus, data, id, column }: Store,
  rowKey: RowKey,
  columnName: string
) {
  const { editingAddress } = focus;
  const { rawData } = data;
  const foundIndex = findIndexByRowKey(data, column, id, rowKey);

  const eventBus = getEventBus(id);
  const gridEvent = new GridEvent({
    rowKey,
    columnName,
    value: rawData[foundIndex][columnName]
  });

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
    if (
      editingAddress &&
      editingAddress.rowKey === rowKey &&
      editingAddress.columnName === columnName
    ) {
      focus.editingAddress = null;
      focus.navigating = true;
    }
  }
}

export function changeFocus(
  focus: Focus,
  data: Data,
  rowKey: RowKey | null,
  columnName: string | null,
  id: number
) {
  if (isFocusedCell(focus, rowKey, columnName)) {
    return;
  }

  const { rawData, sortOptions } = data;
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

    if (rowKey && columnName && isRowSpanEnabled(sortOptions)) {
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

export function initFocus(focus: Focus) {
  focus.navigating = false;
  focus.rowKey = null;
  focus.columnName = null;
  focus.prevRowKey = null;
  focus.prevColumnName = null;
}
