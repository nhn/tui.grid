import { CellValue, RowKey, ColumnInfo } from '../store/types';
import Grid from '../grid';

export interface CellEditor {
  getElement(): HTMLElement | undefined;
  getValue(): string;
  start?(): void;
  finish?(): void;
}

export interface CellEditorProps {
  grid: Grid;
  rowKey: RowKey;
  columnInfo: ColumnInfo;
  value: CellValue;
}

export interface CellEditorClass {
  new (props: CellEditorProps): CellEditor;
}
