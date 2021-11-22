import TuiGrid from '../index';
import { CellValue, RowKey, SortState } from '../store/data';
import { SelectionRange } from '../store/selection';
import { Filter, FilterState, FilterOptionType, OperatorType } from '../store/filterLayerState';
import { ResizedColumn } from '../store/column';
import { OptExport } from '../store/export';

export type TargetType = 'rowHeader' | 'columnHeader' | 'dummy' | 'cell' | 'etc';
export interface CellChange {
  rowKey: RowKey;
  columnName: string;
  value: CellValue;
  nextValue?: CellValue;
  prevValue?: CellValue;
}
export type Origin = 'paste' | 'cell' | 'delete';

export interface GridEventProps {
  value?: CellValue;
  prevValue?: CellValue;
  nextValue?: CellValue;
  event?: MouseEvent;
  rowKey?: RowKey | null;
  columnName?: string | null;
  prevRowKey?: RowKey | null;
  prevColumnName?: string | null;
  range?: SelectionRange | null;
  xhr?: XMLHttpRequest;
  sortState?: SortState;
  filterState?: Filter[] | null;
  resizedColumns?: ResizedColumn[];
  ascending?: boolean;
  multiple?: boolean;
  columnFilterState?: FilterState[];
  conditionFn?: Function;
  type?: FilterOptionType;
  operator?: OperatorType;
  page?: number;
  origin?: Origin;
  changes?: CellChange[];
  floatingRow?: HTMLElement;
  floatingColumn?: HTMLElement;
  targetRowKey?: RowKey | null;
  targetColumnName?: string | null;
  appended?: boolean;
  keyboardEvent?: KeyboardEvent | null;
  save?: boolean;
  triggeredByKey?: boolean;
  exportFormat?: 'csv' | 'xlsx';
  exportOptions?: OptExport;
  data?: string[][];
  complexHeaderData?: string[][] | null;
  exportFn?: (data: string[][]) => void;
}

export class TuiGridEvent {
  constructor(props: GridEventProps);

  public stop(): void;

  public isStopped(): boolean;

  public assignData(data: GridEventProps): void;

  public setInstance(instance: TuiGrid): void;
}
