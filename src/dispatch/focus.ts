import { Store, RowKey, Focus } from '../store/types';
import GridEvent from '../event/gridEvent';
import { getEventBus } from '../event/eventBus';
import { isCellDisabled } from '../query/data';
import { isFocusedCell } from '../query/focus';

export function startEditing(store: Store, rowKey: RowKey, columnName: string) {
  const { data, focus, column } = store;

  if (isCellDisabled(data, rowKey, columnName) || !isFocusedCell(focus, rowKey, columnName)) {
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
  rowKey: RowKey | null,
  columnName: string | null,
  id: number
) {
  if (isFocusedCell(focus, rowKey, columnName)) {
    return;
  }

  const eventBus = getEventBus(id);
  const gridEvent = new GridEvent({
    rowKey,
    columnName,
    prevColumnName: focus.columnName,
    prevRowKey: focus.rowKey
  });

  eventBus.trigger('focusChange', gridEvent);

  if (!gridEvent.isStopped()) {
    focus.prevColumnName = focus.columnName;
    focus.prevRowKey = focus.rowKey;
    focus.rowKey = rowKey;
    focus.columnName = columnName;
  }
}
