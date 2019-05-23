import { Store, RowKey } from '../store/types';
import { findProp } from '../helper/common';

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
