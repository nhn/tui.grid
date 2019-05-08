import { Selection, ColumnCoords, RowCoords, Column, Data } from './types';
import { Reactive, reactive } from '../helper/reactive';

interface SelectionOption {
  data: Data;
  column: Column;
  rowCoords: RowCoords;
  columnCoords: ColumnCoords;
}

export function create({
  column,
  data,
  rowCoords,
  columnCoords
}: SelectionOption): Reactive<Selection> {
  return reactive({
    range: null,
    selectionUnit: 'cell',
    active: false
  });
}
