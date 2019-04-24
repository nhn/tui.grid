import { Store } from '../store/types';

export function startEditing({ focus }: Store, rowKey: number, columnName: string) {
  Object.assign(focus, {
    rowKey,
    columnName,
    editing: true,
    navigating: false
  });
}

export function finishEditing({ focus }: Store, rowKey: number, columnName: string) {
  if (focus.rowKey === rowKey && focus.columnName === columnName) {
    focus.editing = false;
  }
}

export function blurFromMouseDown({ focus }: Store) {
  focus.navigating = true;
  focus.editing = false;
}
