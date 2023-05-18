import { Row, RowSpanAttributeValue } from '@t/store/data';
import { createRowSpan } from '../store/data';
import { findProp, isEmpty, findPropIndex, find } from '../helper/common';
import { Store } from '@t/store';
import { Dictionary } from '@t/options';
import { notify } from '../helper/observable';
import { getRowSpanOfColumn } from '../query/rowSpan';
import { DEFAULT_PER_PAGE } from '../helper/constant';

export function updateRowSpanWhenAppending(data: Row[], prevRow: Row, extendPrevRowSpan: boolean) {
  const { rowSpanMap: prevRowSpanMap } = prevRow;

  if (isEmpty(prevRowSpanMap)) {
    return;
  }

  Object.keys(prevRowSpanMap).forEach((columnName) => {
    const prevRowSpan = prevRowSpanMap[columnName];
    if (prevRowSpan) {
      const { count, mainRow: keyRow, mainRowKey } = prevRowSpan;
      const mainRow = keyRow ? prevRow : findProp('rowKey', mainRowKey, data)!;
      const mainRowSpan = mainRow.rowSpanMap[columnName];
      const startOffset = keyRow || extendPrevRowSpan ? 1 : -count + 1;

      // keep rowSpan state when appends row in the middle of rowSpan
      if (
        mainRowSpan.spanCount > startOffset ||
        (mainRowSpan.spanCount === 1 && startOffset === 1)
      ) {
        mainRowSpan.count += 1;
        mainRowSpan.spanCount += 1;

        updateSubRowSpan(data, mainRow, columnName, 1, mainRowSpan.spanCount);
      }
    }
  });
}

export function updateRowSpanWhenRemoving(
  data: Row[],
  removedRow: Row,
  nextRow: Row,
  keepRowSpanData: boolean
) {
  const { rowSpanMap: removedRowSpanMap } = removedRow;

  if (isEmpty(removedRowSpanMap)) {
    return;
  }

  Object.keys(removedRowSpanMap).forEach((columnName) => {
    const removedRowSpan = removedRowSpanMap[columnName];
    const { count, mainRow: keyRow, mainRowKey } = removedRowSpan;
    let mainRow: Row, spanCount: number;

    if (keyRow) {
      mainRow = nextRow;
      spanCount = count - 1;

      if (spanCount > 1) {
        const mainRowSpan = mainRow.rowSpanMap[columnName];
        mainRowSpan.mainRowKey = mainRow.rowKey;
        mainRowSpan.mainRow = true;
      }
      if (keepRowSpanData) {
        mainRow[columnName] = removedRow[columnName];
      }
    } else {
      mainRow = findProp('rowKey', mainRowKey, data)!;
      spanCount = mainRow.rowSpanMap[columnName].spanCount - 1;
    }

    if (spanCount > 1) {
      const mainRowSpan = mainRow.rowSpanMap[columnName];
      mainRowSpan.count = spanCount;
      mainRowSpan.spanCount = spanCount;
      updateSubRowSpan(data, mainRow, columnName, 1, spanCount);
    } else {
      delete mainRow.rowSpanMap[columnName];
    }
  });
}

export function updateRowSpan(store: Store) {
  const { data, column } = store;
  const { filteredRawData, pageOptions } = data;
  const { perPage: perPageOption } = pageOptions;
  const rowSpans: Dictionary<RowSpanAttributeValue> = {};
  const perPage = !isEmpty(pageOptions) && !perPageOption ? DEFAULT_PER_PAGE : perPageOption;

  if (column.visibleRowSpanEnabledColumns.length > 0) {
    resetRowSpan(store, true);

    column.visibleRowSpanEnabledColumns.forEach(({ name }) => {
      const rowSpanOfColumn = getRowSpanOfColumn(filteredRawData, name, perPage);

      Object.keys(rowSpanOfColumn).forEach((rowKey) => {
        if (rowSpans[rowKey]) {
          rowSpans[rowKey][name] = rowSpanOfColumn[rowKey][name];
        } else {
          rowSpans[rowKey] = rowSpanOfColumn[rowKey];
        }
      });
    });

    Object.keys(rowSpans).forEach((rowKey) => {
      const row = find(({ rowKey: key }) => `${key}` === rowKey, filteredRawData);

      updateMainRowSpan(filteredRawData, row!, rowSpans[rowKey]);
    });

    notify(data, 'rawData', 'filteredRawData', 'viewData', 'filteredViewData');
  }
}

export function updateMainRowSpan(data: Row[], mainRow: Row, rowSpan: RowSpanAttributeValue) {
  if (rowSpan) {
    const { rowKey, rowSpanMap } = mainRow;

    Object.keys(rowSpan).forEach((columnName) => {
      const spanCount = rowSpan[columnName];

      rowSpanMap[columnName] = createRowSpan(true, rowKey, spanCount, spanCount);
      updateSubRowSpan(data, mainRow, columnName, 1, spanCount);
    });
  }
}

function updateSubRowSpan(
  data: Row[],
  mainRow: Row,
  columnName: string,
  startOffset: number,
  spanCount: number
) {
  const mainRowIndex = findPropIndex('rowKey', mainRow.rowKey, data);

  for (let offset = startOffset; offset < spanCount; offset += 1) {
    const row = data[mainRowIndex + offset];
    row.rowSpanMap[columnName] = createRowSpan(false, mainRow.rowKey, -offset, spanCount);
  }
}

export function resetRowSpan({ data, column }: Store, slient = false) {
  if (column.visibleRowSpanEnabledColumns.length <= 0) {
    return;
  }

  data.rawData.forEach(({ rowSpanMap }) => {
    Object.keys(rowSpanMap).forEach((columnName) => {
      delete rowSpanMap[columnName];
    });
  });

  if (!slient) {
    notify(data, 'rawData', 'filteredRawData', 'viewData', 'filteredViewData');
  }
}
