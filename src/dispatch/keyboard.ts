import { Store, RowKey, SelectionRange, Range } from '../store/types';
import { KeyboardEventCommandType } from '../helper/keyboard';
import { getNextCellIndex, getRemoveRange } from '../query/keyboard';
import { changeFocus } from './focus';
import { changeSelectionRange } from './selection';
import { isRowHeader } from '../helper/column';
import { getRowRangeWithRowSpan, enableRowSpan } from '../helper/rowSpan';
import { getSortedRange } from '../helper/selection';
import { isCellDisabled } from '../query/data';

function getNextCellIndexWithRowSpan(
  store: Store,
  command: KeyboardEventCommandType,
  currentRowIndex: number,
  columnRange: Range,
  cellIndexes: Range
) {
  let rowIndex = cellIndexes[0];
  const columnIndex = cellIndexes[1];
  const [startColumnIndex, endColumnIndex] = getSortedRange(columnRange);

  for (let index = startColumnIndex; index <= endColumnIndex; index += 1) {
    const nextRowIndex = getNextCellIndex(store, command, [currentRowIndex, index])[0];

    if (
      (command === 'up' && nextRowIndex < rowIndex) ||
      (command === 'down' && nextRowIndex > rowIndex)
    ) {
      rowIndex = nextRowIndex;
    }
  }
  return [rowIndex, columnIndex];
}

export function moveFocus(store: Store, command: KeyboardEventCommandType) {
  const {
    focus,
    data,
    column: { visibleColumnsWithRowHeader },
    id
  } = store;
  const { viewData } = data;
  const { rowIndex, totalColumnIndex: columnIndex } = focus;

  if (rowIndex === null || columnIndex === null) {
    return;
  }

  const [nextRowIndex, nextColumnIndex] = getNextCellIndex(store, command, [rowIndex, columnIndex]);
  const nextColumnName = visibleColumnsWithRowHeader[nextColumnIndex].name;
  if (!isRowHeader(nextColumnName)) {
    focus.navigating = true;
    changeFocus(focus, data, viewData[nextRowIndex].rowKey, nextColumnName, id);
  }
}

export function editFocus({ column, focus, data }: Store, command: KeyboardEventCommandType) {
  const { rowKey, columnName } = focus;

  if (rowKey === null || columnName === null) {
    return;
  }

  if (command === 'currentCell') {
    const columnInfo = column.allColumnMap[columnName];

    if (columnInfo && columnInfo.editor && !isCellDisabled(data, rowKey, columnName)) {
      focus.navigating = false;
      focus.editingAddress = { rowKey, columnName };
    }
  }
}

export function changeSelection(store: Store, command: KeyboardEventCommandType) {
  const {
    selection,
    focus,
    data,
    column: { visibleColumnsWithRowHeader, rowHeaderCount },
    id
  } = store;
  const { viewData, sortOptions } = data;
  const { rowIndex: focusRowIndex, totalColumnIndex: totalFocusColumnIndex } = focus;
  let { inputRange: currentInputRange } = selection;

  if (focusRowIndex === null || totalFocusColumnIndex === null) {
    return;
  }

  if (!currentInputRange) {
    currentInputRange = selection.inputRange = {
      row: [focusRowIndex, focusRowIndex],
      column: [totalFocusColumnIndex, totalFocusColumnIndex]
    };
  }

  const rowLength = viewData.length;
  const columnLength = visibleColumnsWithRowHeader.length;
  let rowStartIndex = currentInputRange.row[0];
  const rowIndex = currentInputRange.row[1];
  let columnStartIndex = currentInputRange.column[0];
  const columnIndex = currentInputRange.column[1];
  let nextCellIndexes;

  if (command === 'all') {
    rowStartIndex = 0;
    columnStartIndex = rowHeaderCount;
    nextCellIndexes = [rowLength - 1, columnLength - 1];
  } else {
    nextCellIndexes = getNextCellIndex(store, command, [rowIndex, columnIndex]);
    if (enableRowSpan(sortOptions.columnName)) {
      nextCellIndexes = getNextCellIndexWithRowSpan(
        store,
        command,
        rowIndex,
        [columnStartIndex, columnIndex],
        nextCellIndexes
      );
    }
  }

  const [nextRowIndex, nextColumnIndex] = nextCellIndexes;
  const nextColumnName = visibleColumnsWithRowHeader[nextColumnIndex].name;
  let startRowIndex = rowStartIndex;
  let endRowIndex = nextRowIndex;

  if (command !== 'all') {
    [startRowIndex, endRowIndex] = getRowRangeWithRowSpan(
      [startRowIndex, endRowIndex],
      [columnStartIndex, nextColumnIndex],
      visibleColumnsWithRowHeader,
      focus.rowIndex,
      data
    );
  }

  if (!isRowHeader(nextColumnName)) {
    const inputRange: SelectionRange = {
      row: [startRowIndex, endRowIndex],
      column: [columnStartIndex, nextColumnIndex]
    };

    changeSelectionRange(selection, inputRange, id);
  }
}

export function removeContent(store: Store) {
  const {
    column: { visibleColumnsWithRowHeader },
    data
  } = store;
  const { rawData } = data;
  const removeRange = getRemoveRange(store);

  if (!removeRange) {
    return;
  }

  const {
    column: [columnStart, columnEnd],
    row: [rowStart, rowEnd]
  } = removeRange;

  visibleColumnsWithRowHeader
    .slice(columnStart, columnEnd + 1)
    .filter(({ editor }) => !!editor)
    .forEach(({ name }) => {
      rawData.slice(rowStart, rowEnd + 1).forEach((row) => {
        row[name] = '';
      });
    });
}

export function setFocusInfo(
  store: Store,
  rowKey: RowKey | null,
  columnName: string | null,
  navigating: boolean
) {
  const { focus, id, data } = store;
  focus.navigating = navigating;

  changeFocus(focus, data, rowKey, columnName, id);
}
