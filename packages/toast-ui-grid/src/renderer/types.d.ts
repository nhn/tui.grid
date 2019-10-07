import { CellRenderData, ColumnInfo, RowKey } from '../store/types';
import Grid from '../grid';

export type CellRendererProps = CellRenderData & {
  grid: Grid;
  rowKey: RowKey;
  columnInfo: ColumnInfo;
  allDisabled: boolean;
};

export interface CellRenderer {
  getElement(): HTMLElement;
  focused?(): void;
  mounted?(parent: HTMLElement): void;
  render(props: CellRendererProps): void;
  beforeDestroy?(): void;
}

export interface CellRendererClass {
  new (params: CellRendererProps, options?: any): CellRenderer;
}
