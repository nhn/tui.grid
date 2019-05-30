import { Store, RowKey, SelectionRange } from '../store/types';
import { KeyboardEventCommandType } from '../helper/keyboard';
import { getNextCellIndex } from '../query/keyboard';
import { changeFocus } from './focus';
import { changeSelectionRange } from './selection';
import { isRowHeader } from '../helper/column';

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
    column: { visibleColumns },
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
      column: [totalFocusColumnIndex, totalFocusColumnIndex]
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
  const nextColumnName = visibleColumns[nextColumnIndex].name;
  if (!isRowHeader(nextColumnName)) {
    const inputRange: SelectionRange = {
      row: [rowStartIndex, nextRowIndex],
      column: [columnStartIndex, nextColumnIndex]
    };

    changeSelectionRange(selection, inputRange, id);
  }
}

export function removeFocus(store: Store) {
  // @TODO: 이후 관련 키보드 이벤트 작업 필요
  console.log(store);
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
