import { Focus, ColumnCoords, RowCoords, Column, Data, EditingEvent, MovingTabMode } from './types';
import { Observable, observable } from '../helper/observable';
import { someProp, findPropIndex } from '../helper/common';
import { isRowSpanEnabled, getVerticalPosWithRowSpan, getRowSpanByRowKey } from '../helper/rowSpan';
import { findIndexByRowKey } from '../query/data';

interface FocusOption {
  data: Data;
  column: Column;
  rowCoords: RowCoords;
  columnCoords: ColumnCoords;
  editingEvent: EditingEvent;
  movingTabMode: MovingTabMode;
  id: number;
}

export function create({
  column,
  data,
  rowCoords,
  columnCoords,
  editingEvent,
  movingTabMode,
  id
}: FocusOption): Observable<Focus> {
  return observable({
    rowKey: null,
    columnName: null,
    prevRowKey: null,
    prevColumnName: null,
    editingAddress: null,
    editingEvent,
    navigating: false,
    forcedDestroyEditing: false,
    movingTabMode,

    get side(this: Focus) {
      if (this.columnName === null) {
        return null;
      }

      return someProp('name', this.columnName, column.visibleColumnsBySideWithRowHeader.R)
        ? 'R'
        : 'L';
    },

    get columnIndex(this: Focus) {
      const { columnName, side } = this;

      if (columnName === null || side === null) {
        return null;
      }

      return findPropIndex('name', columnName, column.visibleColumnsBySideWithRowHeader[side]);
    },

    get totalColumnIndex(this: Focus) {
      const { visibleColumnsBySideWithRowHeader } = column;
      const { columnIndex, side } = this;

      if (columnIndex === null) {
        return columnIndex;
      }

      return side === 'R' ? columnIndex + visibleColumnsBySideWithRowHeader.L.length : columnIndex;
    },

    get rowIndex(this: Focus) {
      const { rowKey } = this;

      if (rowKey === null) {
        return null;
      }
      return findIndexByRowKey(data, column, id, rowKey);
    },

    get cellPosRect(this: Focus) {
      const { columnIndex, rowIndex, side, columnName, rowKey } = this;
      const { filteredRawData, sortState } = data;

      if (columnIndex === null || rowIndex === null || side === null || columnName === null) {
        return null;
      }

      const left = columnCoords.offsets[side][columnIndex];
      const right = left + columnCoords.widths[side][columnIndex];
      const top = rowCoords.offsets[rowIndex];
      const bottom = top + rowCoords.heights[rowIndex];
      const rowSpan = getRowSpanByRowKey(rowKey!, columnName, filteredRawData);

      if (isRowSpanEnabled(sortState) && rowSpan) {
        const verticalPos = getVerticalPosWithRowSpan(
          columnName,
          rowSpan,
          rowCoords,
          filteredRawData
        );
        return { left, right, top: verticalPos[0], bottom: verticalPos[1] };
      }

      return { left, right, top, bottom };
    }
  });
}
