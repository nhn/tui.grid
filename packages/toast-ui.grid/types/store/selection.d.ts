import { Side } from './focus';

export type SelectionType = 'cell' | 'row' | 'column';
export type SelectionUnit = 'cell' | 'row';
export type Range = [number, number];
export type RangeAreaInfo = { [key in Side]: AreaInfo | null };
export type RangeBySide = {
  [key in Side]: {
    row: Range;
    column: Range | null;
  };
};

export interface AreaInfo {
  top: number;
  height: number;
  left: number;
  width: number;
}

export interface SelectionRange {
  row: Range;
  column: Range;
}

export interface DragStartData {
  pageX: number | null;
  pageY: number | null;
}

export interface PagePosition {
  pageX: number;
  pageY: number;
}

export interface Selection {
  type: SelectionType;
  unit: SelectionUnit;
  intervalIdForAutoScroll: number | null;
  inputRange: SelectionRange | null;
  readonly range: SelectionRange | null;
  readonly rangeBySide: RangeBySide | null;
  readonly rangeAreaInfo: RangeAreaInfo | null;
  readonly rangeWithRowHeader: SelectionRange | null;
  readonly originalRange: SelectionRange | null;
}
