import { Focus, ColumnCoords, RowCoords, Column } from './types';
import { Reactive, reactive } from '../helper/reactive';

interface FocusOption {
  column: Column;
  rowCoords: RowCoords;
  columnCoords: ColumnCoords;
}

export function create({ column, rowCoords, columnCoords }: FocusOption): Reactive<Focus> {
  return reactive({
    rowKey: 0,
    columnName: 'name',
    active: false,
    get cellPosRect() {
      // const xPos = getCellHorizontalPosition(column, columnName, columnCoords);
      return null;
    }
  });
}
