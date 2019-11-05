import {
  Focus,
  ColumnCoords,
  RowCoords,
  Column,
  Data,
  EditingEvent,
  TabMode,
  Dimension
} from './types';
import { Observable, observable } from '../helper/observable';
import { someProp, findPropIndex, isEmpty } from '../helper/common';
import { isRowSpanEnabled, getVerticalPosWithRowSpan, getRowSpanByRowKey } from '../query/rowSpan';
import { findIndexByRowKey } from '../query/data';

interface FocusOption {
  data: Data;
  column: Column;
  dimension: Dimension;
  rowCoords: RowCoords;
  columnCoords: ColumnCoords;
  editingEvent: EditingEvent;
  tabMode: TabMode;
  id: number;
}

export function create({
  column,
  data,
  dimension,
  rowCoords,
  columnCoords,
  editingEvent,
  tabMode,
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
    tabMode,

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

      return columnName === null || side === null
        ? null
        : findPropIndex('name', columnName, column.visibleColumnsBySideWithRowHeader[side]);
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

      return rowKey === null ? null : findIndexByRowKey(data, column, id, rowKey);
    },

    get originalRowIndex(this: Focus) {
      const { rowIndex } = this;
      const { pageOptions } = data;

      if (rowIndex === null) {
        return null;
      }

      if (!isEmpty(pageOptions)) {
        const { perPage, page } = pageOptions;

        return rowIndex + (page - 1) * perPage;
      }

      return rowIndex;
    },

    get cellPosRect(this: Focus) {
      const { columnIndex, rowIndex, side, columnName, rowKey } = this;
      const { filteredRawData, sortState } = data;
      const { cellBorderWidth } = dimension;

      if (columnIndex === null || rowIndex === null || side === null || columnName === null) {
        return null;
      }

      const { widths, offsets } = columnCoords;
      const borderWidth = widths[side].length - 1 === columnIndex ? 0 : cellBorderWidth;
      const left = offsets[side][columnIndex];
      const right = left + widths[side][columnIndex] + borderWidth;
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
