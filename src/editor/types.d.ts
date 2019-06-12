import { CellValue, RowKey, ColumnInfo, ListItem } from '../store/types';
import Grid from '../grid';

export interface CellEditorProps {
  grid: Grid;
  rowKey: RowKey;
  columnInfo: ColumnInfo;
  value: CellValue;
}

export interface CellEditor {
  getElement(): HTMLElement | undefined;
  getValue(): string;
  mounted?(): void;
  beforeDestroy?(): void;
}

export interface ListItemOptions {
  listItems: ListItem[];
}

export interface CellEditorClass {
  new (props: CellEditorProps): CellEditor;
}
