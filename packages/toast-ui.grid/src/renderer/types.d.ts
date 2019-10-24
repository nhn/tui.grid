import {
  CellRenderData,
  ColumnInfo,
  RowKey,
  ColumnFilterOption,
  SortingType
} from '../store/types';
import Grid from '../grid';
import { AlignType, VAlignType } from '../types';

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

export interface HeaderColumnInfo {
  name: string;
  header: string;
  headerAlign?: AlignType;
  headerVAlign?: VAlignType;
  sortable?: boolean;
  sortingType?: SortingType;
  filter?: ColumnFilterOption | null;
  headerRenderer?: HeaderRendererClass | null;
}

export type HeaderRendererProps = {
  grid: Grid;
  columnInfo: HeaderColumnInfo;
};

export interface HeaderRenderer {
  getElement(): HTMLElement;
  mounted?(parent: HTMLElement): void;
  beforeDestroy?(): void;
}

export interface HeaderRendererClass {
  new (params: HeaderRendererProps, options?: any): HeaderRenderer;
}
