import { Focus, ColumnCoords, RowCoords, Column, Data } from './types';
import { Observable, observable } from '../helper/observable';
import { someProp, findPropIndex } from '../helper/common';

interface FocusOption {
  data: Data;
  column: Column;
  rowCoords: RowCoords;
  columnCoords: ColumnCoords;
}

export function create({ column, data, rowCoords, columnCoords }: FocusOption): Observable<Focus> {
  return observable({
    rowKey: null,
    columnName: null,
    editingAddress: null,
    navigating: false,
    get side(this: Focus) {
      if (this.columnName === null) {
        return null;
      }

      return someProp('name', this.columnName, column.visibleColumnsBySide.R) ? 'R' : 'L';
    },

    get columnIndex(this: Focus) {
      const { columnName, side } = this;

      if (columnName === null || side === null) {
        return null;
      }

      return findPropIndex('name', columnName, column.visibleColumnsBySide[side]);
    },

    get totalColumnIndex(this: Focus) {
      const { visibleColumnsBySide } = column;
      const { columnIndex, side } = this;

      if (columnIndex === null) {
        return columnIndex;
      }

      return side === 'R' ? columnIndex + visibleColumnsBySide.L.length : columnIndex;
    },

    get rowIndex(this: Focus) {
      const { rowKey } = this;

      if (rowKey === null) {
        return null;
      }

      return findPropIndex('rowKey', rowKey, data.rawData);
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
