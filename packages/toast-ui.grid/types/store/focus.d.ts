import { RowKey } from './data';

export type EditingEvent = 'click' | 'dblclick';
export type TabMode = 'move' | 'moveAndEdit';
export type Side = 'L' | 'R';
export type EditingAddress = {
  rowKey: RowKey;
  columnName: string;
} | null;
export interface Rect {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export interface Focus {
  editingAddress: EditingAddress;
  navigating: boolean;
  rowKey: RowKey | null;
  editingEvent: EditingEvent;
  tabMode: TabMode;
  columnName: string | null;
  prevRowKey: RowKey | null;
  prevColumnName: string | null;
  forcedDestroyEditing: boolean;
  readonly side: Side | null;
  readonly columnIndex: number | null;
  readonly totalColumnIndex: number | null;
  readonly rowIndex: number | null;
  readonly originalRowIndex: number | null;
  readonly cellPosRect: Rect | null;
}
