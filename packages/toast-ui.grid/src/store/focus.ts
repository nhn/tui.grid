import { Data } from '@t/store/data';
import { Column } from '@t/store/column';
import { Dimension } from '@t/store/dimension';
import { RowCoords } from '@t/store/rowCoords';
import { ColumnCoords } from '@t/store/columnCoords';
import { EditingEvent, TabMode, Focus } from '@t/store/focus';
import { observable } from '../helper/observable';
import { someProp, findPropIndex, isNull } from '../helper/common';
import { isRowSpanEnabled, getVerticalPosWithRowSpan, getRowSpanByRowKey } from '../query/rowSpan';
import { findIndexByRowKey, isClientPagination } from '../query/data';
import { EnterCommandType } from '../helper/keyboard';

interface FocusOption {
  data: Data;
  column: Column;
  dimension: Dimension;
  rowCoords: RowCoords;
  columnCoords: ColumnCoords;
  editingEvent: EditingEvent;
  tabMode: TabMode;
  id: number;
  moveDirectionOnEnter?: EnterCommandType;
}

export function create({
  column,
  data,
  dimension,
  rowCoords,
  columnCoords,
  editingEvent,
  tabMode,
  id,
  moveDirectionOnEnter,
}: FocusOption) {
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
    moveDirectionOnEnter,

    get side() {
      if (this.columnName === null) {
        return null;
      }

      return someProp('name', this.columnName, column.visibleColumnsBySideWithRowHeader.R)
        ? 'R'
        : 'L';
    },

    get columnIndex() {
      const { columnName, side } = this;

      return columnName === null || side === null
        ? null
        : findPropIndex('name', columnName, column.visibleColumnsBySideWithRowHeader[side]);
    },

    get totalColumnIndex() {
      const { visibleColumnsBySideWithRowHeader } = column;
      const { columnIndex, side } = this;

      if (columnIndex === null) {
        return columnIndex;
      }

      return side === 'R' ? columnIndex + visibleColumnsBySideWithRowHeader.L.length : columnIndex;
    },

    get rowIndex() {
      const { rowKey } = this;

      if (isNull(rowKey)) {
        return null;
      }

      const index = findIndexByRowKey(data, column, id, rowKey);

      return isClientPagination(data) ? index - data.pageRowRange[0] : index;
    },

    get originalRowIndex() {
      const { rowIndex } = this;

      if (isNull(rowIndex)) {
        return null;
      }
      if (isClientPagination(data)) {
        return rowIndex + data.pageRowRange[0];
      }

      return rowIndex;
    },

    get cellPosRect() {
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

      if (isRowSpanEnabled(sortState, column) && rowSpan) {
        const verticalPos = getVerticalPosWithRowSpan(
          columnName,
          rowSpan,
          rowCoords,
          filteredRawData
        );
        return { left, right, top: verticalPos[0], bottom: verticalPos[1] };
      }

      return { left, right, top, bottom };
    },
  } as Focus);
}
