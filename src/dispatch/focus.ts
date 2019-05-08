import { Store } from '../store/types';

export function startEditing(
  { focus, column }: Store,
  rowKey: number | string,
  columnName: string
) {
  const columnInfo = column.allColumns.find(({ name }) => name === columnName);

  if (columnInfo && columnInfo.editor) {
    focus.navigating = false;
    focus.editing = { rowKey, columnName };
  }
}

export function finishEditing({ focus }: Store, rowKey: number | string, columnName: string) {
  const { editing } = focus;
  if (editing && editing.rowKey === rowKey && editing.columnName === columnName) {
    focus.editing = null;
    focus.navigating = true;
  }
}
