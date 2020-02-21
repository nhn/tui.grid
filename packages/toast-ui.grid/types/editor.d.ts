import { RowKey, CellValue, ListItem } from './store/data';
import { ColumnInfo } from './store/column';
import { Dictionary } from './options';
import Grid from './grid';

export type CheckboxOptions = ListItemOptions & {
  type: 'checkbox' | 'radio';
};

export interface CellEditorProps {
  grid: Grid;
  rowKey: RowKey;
  columnInfo: ColumnInfo;
  value: CellValue;
}

export interface CellEditor {
  getElement(): HTMLElement | undefined;
  getValue(): CellValue;
  mounted?(): void;
  beforeDestroy?(): void;
  el?: HTMLElement;
}

export interface ListItemOptions {
  listItems: ListItem[];
  relationListItemMap?: Dictionary<ListItem[]>;
}

export interface CellEditorClass {
  new (props: CellEditorProps): CellEditor;
}
