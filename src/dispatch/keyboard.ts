import { Store, RowKey, SelectionRange, Range } from '../store/types';
import { KeyboardEventCommandType } from '../helper/keyboard';
import { getNextCellIndex, getRemoveRange } from '../query/keyboard';
import { changeFocus } from './focus';
import { changeSelectionRange } from './selection';
import { isRowHeader } from '../helper/column';
import { getRowRangeWithRowSpan, enableRowSpan } from '../helper/rowSpan';
import { getSortedRange } from '../helper/selection';

function getNextCellIndexWithRowSpan(
  store: Store,
  command: KeyboardEventCommandType,
  rowIndex: number,
  columnRange: Range,
  cellIndexes: Range
) {
  let nextRowIndex;
  const [startColumnIndex, endColumnIndex] = getSortedRange(columnRange);
  const nextColumnIndex = cellIndexes[1];

  for (let columnIndex = startColumnIndex; columnIndex <= endColumnIndex; columnIndex += 1) {
    const prevRowIndex = cellIndexes[0];
    nextRowIndex = getNextCellIndex(store, command, [rowIndex, columnIndex])[0];

    if (command === 'up' && nextRowIndex < prevRowIndex) {
      cellIndexes = [nextRowIndex, nextColumnIndex];
    }
    if (command === 'down' && nextRowIndex > prevRowIndex) {
      cellIndexes = [nextRowIndex, nextColumnIndex];
    }
  }
  return cellIndexes;
}

export function moveFocus(store: Store, command: KeyboardEventCommandType) {
  const {
    focus,
    data,
    column: { visibleColumns },
    id
  } = store;
  const { viewData } = data;
  const { rowIndex, totalColumnIndex: columnIndex } = focus;

  if (rowIndex === null || columnIndex === null) {
    return;
  }

  const [nextRowIndex, nextColumnIndex] = getNextCellIndex(store, command, [rowIndex, columnIndex]);
  const nextColumnName = visibleColumns[nextColumnIndex].name;
  if (!isRowHeader(nextColumnName)) {
    focus.navigating = true;
    changeFocus(focus, data, viewData[nextRowIndex].rowKey, nextColumnName, id);
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
    data,
    column: { visibleColumns, rowHeaderCount },
    id
  } = store;
  const { viewData } = data;
  const { rowIndex: focusRowIndex, totalColumnIndex: totalFocusColumnIndex } = focus;
  let { inputRange: currentInputRange } = selection;

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
    if (enableRowSpan(data)) {
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

  let startRowIndex = rowStartIndex;
  let endRowIndex = nextRowIndex;

  if (enableRowSpan(data)) {
    const rowRange: Range = [startRowIndex, endRowIndex];
    const colRange: Range = [columnStartIndex, nextColumnIndex];
    [startRowIndex, endRowIndex] = getRowRangeWithRowSpan(
      rowRange,
      colRange,
      visibleColumns,
      focus.rowIndex,
      data
    );
  }

  const inputRange: SelectionRange = {
    row: [startRowIndex, endRowIndex],
    column: [columnStartIndex, nextColumnIndex]
  };

  changeSelectionRange(selection, inputRange, id);
}

export function removeContent(store: Store) {
  const { column, data } = store;
  const { visibleColumns } = column;
  const { rawData } = data;
  const removeRange = getRemoveRange(store);

  if (!removeRange) {
    return;
  }

  const {
    column: [columnStart, columnEnd],
    row: [rowStart, rowEnd]
  } = removeRange;

  visibleColumns
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
