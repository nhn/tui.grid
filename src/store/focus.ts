import { Focus, ColumnCoords, RowCoords, Column, Data } from './types';
import { Reactive, reactive } from '../helper/reactive';

interface FocusOption {
  data: Data;
  column: Column;
  rowCoords: RowCoords;
  columnCoords: ColumnCoords;
}

export function create({ column, data, rowCoords, columnCoords }: FocusOption): Reactive<Focus> {
  return reactive({
    rowKey: null,
    columnName: null,
    active: false,
    get side(this: Focus) {
      if (this.columnName === null) {
        return null;
      }

      return column.visibleColumns.R.some(({ name }) => name === this.columnName) ? 'R' : 'L';
    },

    get columnIndex(this: Focus) {
      const { columnName, side } = this;

      if (columnName === null || side === null) {
        return null;
      }
      return column.visibleColumns[side].findIndex(({ name }) => name === columnName);
    },

    get rowIndex(this: Focus) {
      const { rowKey } = this;

      if (rowKey === null) {
        return null;
      }
      return data.rawData.findIndex((row) => row.rowKey === rowKey);
    },

    get cellPosRect(this: Focus) {
      const { columnIndex, rowIndex, side } = this;

      if (columnIndex === null || rowIndex === null || side === null) {
        return null;
      }

      const left = columnCoords.offsets[side][columnIndex];
      const right = left + columnCoords.widths[side][columnIndex];
      const top = rowCoords.offsets[rowIndex];
      const bottom = top + rowCoords.heights[rowIndex];

      return { left, right, top, bottom };
    }
  });
}
