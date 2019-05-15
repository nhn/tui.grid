import { Store, Range } from '../store/types';
import { getSortedRange } from './mouse';
import { clamp } from '../helper/common';

export function setSelection(store: Store, range: { start: Range; end: Range }) {
  const {
    selection,
    data: { viewData },
    column: { visibleColumns }
  } = store;
  const rowLength = viewData.length;
  const columnLength = visibleColumns.length;

  const startRowIndex = clamp(range.start[0], 0, rowLength - 1);
  const endRowIndex = clamp(range.end[0], 0, rowLength - 1);
  const startColumnIndex = clamp(range.start[1], 0, columnLength - 1);
  const endColumnIndex = clamp(range.end[1], 0, columnLength - 1);

  selection.range = {
    row: getSortedRange([startRowIndex, endRowIndex]),
    column: getSortedRange([startColumnIndex, endColumnIndex])
  };
}
