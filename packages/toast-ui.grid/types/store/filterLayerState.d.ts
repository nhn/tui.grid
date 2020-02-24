export type NumberFilterCode = 'eq' | 'lt' | 'gt' | 'lte' | 'gte' | 'ne';
export type TextFilterCode = 'eq' | 'ne' | 'contain' | 'start' | 'end';
export type DateFilterCode = 'eq' | 'ne' | 'after' | 'afterEq' | 'before' | 'beforeEq';
export type FilterOptionType = 'text' | 'number' | 'date' | 'select';
export type OperatorType = 'AND' | 'OR';

export interface FilterState {
  code: NumberFilterCode | TextFilterCode | DateFilterCode | null;
  value: string;
}

export interface ActiveColumnAddress {
  name: string;
  left: number;
}

export interface Filter {
  columnName: string;
  type: FilterOptionType;
  operator?: OperatorType;
  conditionFn?: Function;
  state: FilterState[];
}

export interface FilterLayerState {
  activeColumnAddress: ActiveColumnAddress | null;
  activeFilterState: Filter | null;
}
