import { Store, RowKey, SelectionRange, Range } from '../store/types';
import { KeyboardEventCommandType } from '../helper/keyboard';
import { getNextCellIndex, getRemoveRange } from '../query/keyboard';
import { changeFocus } from './focus';
import { changeSelectionRange } from './selection';
import { isRowHeader } from '../helper/column';
import { getRowRangeWithRowSpan, isRowSpanEnabled } from '../helper/rowSpan';
import { getSortedRange } from '../helper/selection';
import { isCellEditable } from '../query/data';

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
  const { filteredViewData } = data;
  const { rowIndex, totalColumnIndex: columnIndex } = focus;

  if (rowIndex === null || columnIndex === null) {
    return;
  }

  const [nextRowIndex, nextColumnIndex] = getNextCellIndex(store, command, [rowIndex, columnIndex]);
  const nextColumnName = visibleColumnsWithRowHeader[nextColumnIndex].name;
  if (!isRowHeader(nextColumnName)) {
    focus.navigating = true;
    changeFocus(store, filteredViewData[nextRowIndex].rowKey, nextColumnName, id);
  }
}

export function editFocus(store: Store, command: KeyboardEventCommandType) {
  const { focus, data, column, id } = store;
  const { visibleColumnsWithRowHeader } = column;
  const { rowKey, columnName, rowIndex, totalColumnIndex: columnIndex } = focus;

  if (rowKey === null || columnName === null || rowIndex === null || columnIndex === null) {
    return;
  }

  if (command === 'currentCell' && isCellEditable(data, column, rowKey, columnName)) {
    focus.navigating = false;
    focus.editingAddress = { rowKey, columnName };
  } else {
    // get prevCell or nextCell
    const [nextRowIndex, nextColumnIndex] = getNextCellIndex(store, command, [
      rowIndex,
      columnIndex
    ]);
    // @TODO: change rawData to filteredRawData after rebase
    const nextRowKey = data.rawData[nextRowIndex].rowKey;
    const nextColumnName = visibleColumnsWithRowHeader[nextColumnIndex].name;

    if (!isRowHeader(nextColumnName)) {
      focus.navigating = true;
      changeFocus(store, nextRowKey, nextColumnName, id);
      if (focus.editingAddress) {
        focus.navigating = false;
        focus.editingAddress = { rowKey: nextRowKey, columnName: nextColumnName };
      }
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
  const { filteredViewData, sortState } = data;
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

  const rowLength = filteredViewData.length;
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
    if (isRowSpanEnabled(sortState)) {
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
      rawData.slice(rowStart, rowEnd + 1).forEach(row => {
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
  const { focus, id } = store;
  focus.navigating = navigating;

  changeFocus(store, rowKey, columnName, id);
}
