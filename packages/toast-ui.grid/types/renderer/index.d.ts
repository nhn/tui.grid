import TuiGrid from '../index';
import { CellRenderData, RowKey } from '../store/data';
import {
  AlignType,
  ColumnFilterOption,
  ColumnInfo,
  SortingType,
  VAlignType,
} from '../store/column';

export type CellRendererProps = CellRenderData & {
  grid: TuiGrid;
  rowKey: RowKey;
  columnInfo: ColumnInfo;
};

export interface CellRenderer {
  getElement(): Element;
  focused?(): void;
  mounted?(parent: HTMLElement): void;
  render?(props: CellRendererProps): void;
  beforeDestroy?(): void;
}

export interface CellRendererClass {
  new (params: CellRendererProps, options?: any): CellRenderer;
}

export interface ColumnHeaderInfo {
  name: string;
  header: string;
  customHeader?: ColumnInfo['customHeader'];
  headerAlign?: AlignType;
  headerVAlign?: VAlignType;
  sortable?: boolean;
  sortingType?: SortingType;
  filter?: ColumnFilterOption | null;
  headerRenderer?: HeaderRendererClass | null;
}

export type HeaderRendererProps = {
  grid: TuiGrid;
  columnInfo: ColumnHeaderInfo;
};

export interface HeaderRenderer {
  getElement(): HTMLElement;
  render(props: HeaderRendererProps): void;
  mounted?(parent: HTMLElement): void;
  beforeDestroy?(): void;
}

export interface HeaderRendererClass {
  new (params: HeaderRendererProps, options?: any): HeaderRenderer;
}
