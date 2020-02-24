import TuiGrid from '../index';
import { RowKey, CellValue, ListItem } from '../store/data';
import { ColumnInfo } from '../store/column';
import { Dictionary } from '../options';

export type CheckboxOptions = ListItemOptions & {
  type: 'checkbox' | 'radio';
};

export type PortalEditingKeydown = (ev: KeyboardEvent) => void;

export interface CellEditorProps {
  grid: TuiGrid & { usageStatistics: boolean };
  rowKey: RowKey;
  columnInfo: ColumnInfo;
  value: CellValue;
  formattedValue: string;
  width: number;
  portalEditingKeydown: PortalEditingKeydown;
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
