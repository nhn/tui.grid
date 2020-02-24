import { RowKey } from '@t/store/data';
import { Focus } from '@t/store/focus';

export function isFocusedCell(focus: Focus, rowKey: RowKey | null, columnName: string | null) {
  return rowKey === focus.rowKey && columnName === focus.columnName;
}

export function isEditingCell(focus: Focus, rowKey: RowKey, columnName: string) {
  const { editingAddress } = focus;

  return !!(
    editingAddress &&
    editingAddress.rowKey === rowKey &&
    editingAddress.columnName === columnName
  );
}
