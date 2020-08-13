import TuiGrid from '../index';
import { CellValue, RowKey, SortState } from '../store/data';
import { SelectionRange } from '../store/selection';
import { Filter, FilterState, FilterOptionType, OperatorType } from '../store/filterLayerState';
import { ResizedColumn } from '../store/column';

export type TargetType = 'rowHeader' | 'columnHeader' | 'dummy' | 'cell' | 'etc';
interface CellChange {
  rowKey: RowKey;
  columnName: string;
  value: CellValue;
  nextValue?: CellValue;
  prevValue?: CellValue;
}

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
  changeType?: 'paste' | 'cell' | 'delete';
  changes?: CellChange[];
}

export class TuiGridEvent {
  constructor(props: GridEventProps);

  public stop(): void;

  public isStopped(): boolean;

  public assignData(data: GridEventProps): void;

  public setInstance(instance: TuiGrid): void;
}
