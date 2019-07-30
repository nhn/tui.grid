import { Store, RowKey, Focus, Data } from '../store/types';
import GridEvent from '../event/gridEvent';
import { getEventBus } from '../event/eventBus';
import { isCellEditable } from '../query/data';
import { isFocusedCell } from '../query/focus';
import { getRowSpanByRowKey, isRowSpanEnabled } from '../helper/rowSpan';

export function startEditing(store: Store, rowKey: RowKey, columnName: string) {
  const { data, focus, column } = store;

  if (!isCellEditable(data, rowKey, columnName)) {
    return;
  }

  const columnInfo = column.allColumnMap[columnName];
  if (columnInfo && columnInfo.editor) {
    focus.navigating = false;
    focus.editingAddress = { rowKey, columnName };
  }
}

export function finishEditing({ focus }: Store, rowKey: RowKey, columnName: string) {
  const { editingAddress } = focus;

  if (
    editingAddress &&
    editingAddress.rowKey === rowKey &&
    editingAddress.columnName === columnName
  ) {
    focus.editingAddress = null;
    focus.navigating = true;
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
