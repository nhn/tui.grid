import { Store, RowKey, SelectionRange } from '../store/types';
import { KeyboardEventCommandType } from '../helper/keyboard';
import { getNextCellIndex } from '../query/keyboard';
import { changeFocus } from './focus';
import { changeSelectionRange } from './selection';
import { isRowHeader } from '../helper/column';
import { isNull } from '../helper/common';

export function moveFocus(store: Store, command: KeyboardEventCommandType) {
  const {
    focus,
    data: { viewData },
    column: { visibleColumns },
    id
  } = store;
  const { rowIndex, totalColumnIndex: columnIndex } = focus;

  if (rowIndex === null || columnIndex === null) {
    return;
  }

  const [nextRowIndex, nextColumnIndex] = getNextCellIndex(store, command, [rowIndex, columnIndex]);
  const nextColumnName = visibleColumns[nextColumnIndex].name;
  if (!isRowHeader(nextColumnName)) {
    focus.navigating = true;
    changeFocus(focus, viewData[nextRowIndex].rowKey, nextColumnName, id);
  }
}

export function editFocus({ column, focus }: Store, command: KeyboardEventCommandType) {
  const { rowKey, columnName } = focus;

  if (rowKey === null || columnName === null) {
    return;
  }

  if (command === 'currentCell') {
    const columnInfo = column.allColumnMap[columnName];

    if (columnInfo && columnInfo.editor) {
      focus.navigating = false;
      focus.editingAddress = { rowKey, columnName };
    }
  }
}

export function changeSelection(store: Store, command: KeyboardEventCommandType) {
  const {
    selection,
    focus,
    data: { viewData },
    column: { visibleColumns, rowHeaderCount },
    id
  } = store;
  let { inputRange: currentInputRange } = selection;
  const { rowIndex: focusRowIndex, totalColumnIndex: totalFocusColumnIndex } = focus;

  if (focusRowIndex === null || totalFocusColumnIndex === null) {
    return;
  }

  if (!currentInputRange) {
    currentInputRange = selection.inputRange = {
      row: [focusRowIndex, focusRowIndex],
      column: [totalFocusColumnIndex - rowHeaderCount, totalFocusColumnIndex - rowHeaderCount]
    };
  }

  const rowLength = viewData.length;
  const columnLength = visibleColumns.length;
  let rowStartIndex = currentInputRange.row[0];
  const rowIndex = currentInputRange.row[1];
  let columnStartIndex = currentInputRange.column[0];
  const columnIndex = currentInputRange.column[1];
  let nextCellIndexes;

  if (command === 'all') {
    rowStartIndex = 0;
    columnStartIndex = 0;
    nextCellIndexes = [rowLength - 1, columnLength - 1];
  } else {
    nextCellIndexes = getNextCellIndex(store, command, [rowIndex, columnIndex]);
  }

  const [nextRowIndex, nextColumnIndex] = nextCellIndexes;
  const inputRange: SelectionRange = {
    row: [rowStartIndex, nextRowIndex],
    column: [columnStartIndex, nextColumnIndex]
  };

  changeSelectionRange(selection, inputRange, id);
}

export function removeContent(store: Store) {
  const { focus, column, data, selection } = store;
  const { totalColumnIndex, rowIndex } = focus;
  const { visibleColumns } = column;
  const { range } = selection;
  const { rawData } = data;
  let rowStart, rowEnd, columnStart, columnEnd;

  if (range) {
    [columnStart, columnEnd] = range.column;
    [rowStart, rowEnd] = range.row;
  } else if (!isNull(totalColumnIndex) && !isNull(rowIndex)) {
    columnStart = columnEnd = totalColumnIndex;
    rowStart = rowEnd = rowIndex;
  } else {
    return;
  }

  for (let colIdx = columnStart; colIdx <= columnEnd; colIdx += 1) {
    const { editorOptions, name } = visibleColumns[colIdx];
    if (!editorOptions) {
      continue;
    }
    for (let rowIdx = rowStart; rowIdx <= rowEnd; rowIdx += 1) {
      rawData[rowIdx][name] = '';
    }
  }
}

export function setFocusInfo(
  store: Store,
  rowKey: RowKey | null,
  columnName: string | null,
  navigating: boolean
) {
  const { focus, id } = store;
  focus.navigating = navigating;

  changeFocus(store.focus, rowKey, columnName, id);
}
