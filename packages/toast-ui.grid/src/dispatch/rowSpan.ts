import { Row, RowAttributes, RowSpanAttribute, RowSpanAttributeValue } from '@t/store/data';
import { createRowSpan } from '../store/data';
import { findProp, isEmpty, findPropIndex, find } from '../helper/common';
import { Store } from '@t/store';
import { Dictionary, RecursivePartial } from '@t/options';
import { notify } from '../helper/observable';
import { getRowSpanOfColumn } from '../query/rowSpan';

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
      if (mainRowSpan.spanCount > startOffset) {
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
  const allRowSpans: Dictionary<RowSpanAttributeValue> = {};

  resetRowSpan(store);

  column.rowSpanEnabledColumns.forEach(({ name }) => {
    const rowSpanOfColumn = getRowSpanOfColumn(data, name);

    Object.keys(rowSpanOfColumn).forEach((rowKey) => {
      if (allRowSpans[rowKey]) {
        allRowSpans[rowKey]![name] = rowSpanOfColumn[rowKey]![name];
      } else {
        allRowSpans[rowKey] = rowSpanOfColumn[rowKey];
      }
    });
  });

  Object.keys(allRowSpans).forEach((rowKey) => {
    const row = find(({ rowKey: key }) => `${key}` === rowKey, data.rawData);

    updateMainRowSpan(data.filteredRawData, row!, allRowSpans[rowKey]);
  });

  notify(data, 'rawData', 'filteredRawData', 'viewData', 'filteredViewData');
}

export function updateMainRowSpan(data: Row[], mainRow: Row, rowSpan: RowSpanAttributeValue) {
  if (!rowSpan) {
    return;
  }

  const { rowKey, rowSpanMap, _attributes } = mainRow;

  (_attributes as RecursivePartial<RowAttributes & RowSpanAttribute>).rowSpan = rowSpan;

  Object.keys(rowSpan).forEach((columnName) => {
    const spanCount = rowSpan[columnName];

    const span = createRowSpan(true, rowKey, spanCount, spanCount);

    rowSpanMap[columnName] = span;
    updateSubRowSpan(data, mainRow, columnName, 1, spanCount);
  });
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

export function resetRowSpan({ data, column }: Store, isNotify = false) {
  column.rowSpanEnabledColumns.forEach(({ name }) => {
    data.rawData.forEach((row) => {
      const _attributes = row._attributes as RecursivePartial<RowAttributes & RowSpanAttribute>;
      if (row.rowSpanMap[name]) {
        delete row.rowSpanMap[name];
      }

      if (_attributes.rowSpan) {
        delete _attributes.rowSpan;
      }
    });
  });

  if (isNotify) {
    notify(data, 'rawData', 'filteredRawData', 'viewData', 'filteredViewData');
  }
}
