import { RowKey, Focus } from '../store/types';

export function isFocusedCell(focus: Focus, rowKey: RowKey | null, columnName: string | null) {
  return rowKey === focus.rowKey && columnName === focus.columnName;
}
