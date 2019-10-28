import { ColumnInfo, SelectionRange } from '../store/types';
import { findPropIndex } from '../helper/common';

function getColSpanRange(name: string, visibleColumnsWithRowHeader: ColumnInfo[]) {
  const startIdx = findPropIndex('name', name, visibleColumnsWithRowHeader);
  const spanCount = visibleColumnsWithRowHeader[startIdx].headerColSpan!.spanCount;

  return [startIdx, startIdx + spanCount - 1];
}

export function getSelectionRangeWithColSpan(
  selectionRange: SelectionRange,
  visibleColumnsWithRowHeader: ColumnInfo[]
): SelectionRange {
  let [startColumnIdx, endColumnIdx] = selectionRange.column;
  const startColSpan = visibleColumnsWithRowHeader[startColumnIdx].headerColSpan;
  const endColSpan = visibleColumnsWithRowHeader[endColumnIdx].headerColSpan;

  if (startColSpan) {
    [startColumnIdx] = getColSpanRange(startColSpan.columnName, visibleColumnsWithRowHeader);
  }

  if (endColSpan) {
    [, endColumnIdx] = getColSpanRange(endColSpan.columnName, visibleColumnsWithRowHeader);
  }

  return {
    row: selectionRange.row,
    column: [startColumnIdx, endColumnIdx]
  };
}
