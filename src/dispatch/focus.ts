import { Store, RowKey, Focus } from '../store/types';
import { findProp } from '../helper/common';
import { getEventBus } from '../event/eventBus';
import GridEvent from '../event/gridEvent';

export function startEditing({ focus, column, data }: Store, rowKey: RowKey, columnName: string) {
  const { viewData, disabled } = data;
  const row = findProp('rowKey', rowKey, viewData)!;
  const rowDisabled = row.valueMap[columnName].disabled;
  if (disabled || rowDisabled) {
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
  if (rowKey === focus.rowKey && columnName === focus.columnName) {
    return;
  }

  focus.prevColumnName = focus.columnName;
  focus.prevRowKey = focus.rowKey;
  focus.rowKey = rowKey;
  focus.columnName = columnName;

  const eventBus = getEventBus(id);
  const gridEvent = new GridEvent({
    rowKey,
    columnName,
    prevColumnName: focus.prevColumnName,
    prevRowKey: focus.prevRowKey
  });

  eventBus.trigger('focusChange', gridEvent);
}
