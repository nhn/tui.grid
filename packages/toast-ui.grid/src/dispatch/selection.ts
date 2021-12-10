import { SelectionRange, Selection, Range } from '@t/store/selection';
import { Store } from '@t/store';
import { clamp } from '../helper/common';
import { getEventBus } from '../event/eventBus';
import { isSameInputRange } from '../query/selection';
import GridEvent from '../event/gridEvent';
import { getRowRangeWithRowSpan } from '../query/rowSpan';

export function changeSelectionRange(
  selection: Selection,
  inputRange: SelectionRange | null,
  id: number
) {
  if (!isSameInputRange(selection.inputRange, inputRange)) {
    selection.inputRange = inputRange;
    const eventBus = getEventBus(id);
    const gridEvent = new GridEvent({ range: selection.rangeWithRowHeader });
    /**
     * Occurs when selecting cells
     * @event Grid#selection
     * @property {Object} range - Range of selection
     * @property {Array} range.start - Info of start cell (ex: [rowKey, columnName])
     * @property {Array} range.end - Info of end cell (ex: [rowKey, columnName])
     * @property {Grid} instance - Current grid instance
     */
    eventBus.trigger('selection', gridEvent);
  }
}

export function setSelection(store: Store, range: { start: Range; end: Range }) {
  const { selection, data, column, id } = store;
  const { visibleColumnsWithRowHeader, rowHeaderCount } = column;
  const { viewData } = data;
  const rowLength = viewData.length;
  const columnLength = visibleColumnsWithRowHeader.length;

  let startRowIndex = clamp(range.start[0], 0, rowLength - 1);
  let endRowIndex = clamp(range.end[0], 0, rowLength - 1);
  const startColumnIndex = clamp(range.start[1] + rowHeaderCount, rowHeaderCount, columnLength - 1);
  const endColumnIndex = clamp(range.end[1] + rowHeaderCount, rowHeaderCount, columnLength - 1);

  [startRowIndex, endRowIndex] = getRowRangeWithRowSpan(
    [startRowIndex, endRowIndex],
    [startColumnIndex, endColumnIndex],
    column,
    null,
    data
  );

  const inputRange: SelectionRange = {
    row: [startRowIndex, endRowIndex],
    column: [startColumnIndex, endColumnIndex],
  };

  changeSelectionRange(selection, inputRange, id);
}

export function initSelection(store: Store) {
  store.selection.inputRange = null;
}
