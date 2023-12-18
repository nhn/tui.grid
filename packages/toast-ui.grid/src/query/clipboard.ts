import { CustomValue, ColumnInfo } from '@t/store/column';
import { CellValue, Row, CellRenderData, ViewRow } from '@t/store/data';
import { ListItemOptions } from '@t/editor';
import { Store } from '@t/store';
import { SelectionRange, Range } from '@t/store/selection';
import { find, isNull, isNil } from '../helper/common';
import { makeObservable } from '../dispatch/data';
import { isObservable, notify } from '../helper/observable';

function getCustomValue(
  customValue: CustomValue,
  value: CellValue,
  rowAttrs: Row[],
  column: ColumnInfo
) {
  return typeof customValue === 'function' ? customValue(value, rowAttrs, column) : customValue;
}

function getTextWithCopyOptionsApplied(
  valueMap: CellRenderData,
  rawData: Row[],
  column: ColumnInfo
) {
  let text = valueMap.value;
  const { copyOptions, editor } = column;
  const editorOptions = editor && editor.options;

  // priority: customValue > useListItemText > useFormattedValue > original Data
  if (copyOptions) {
    if (copyOptions.customValue) {
      text = getCustomValue(copyOptions.customValue, valueMap.value, rawData, column);
    } else if (copyOptions.useListItemText && editorOptions?.listItems) {
      const { listItems } = editorOptions as ListItemOptions;
      const { value } = valueMap;
      let valueList = [value];
      const result: CellValue[] = [];

      if (typeof value === 'string') {
        valueList = value.split(',');
      }

      valueList.forEach((val) => {
        const listItem = find((item) => item.value === val, listItems);

        result.push(listItem ? listItem.text : val);
      });

      text = result.join(',');
    } else if (copyOptions.useFormattedValue) {
      text = `${valueMap.formattedValue}`;
    }
  }

  if (typeof text === 'undefined' || text === null) {
    return '';
  }

  return String(text);
}

function getObservableList(store: Store, filteredViewData: ViewRow[], start: number, end: number) {
  const rowList = [];

  for (let i = start; i <= end; i += 1) {
    if (!isObservable(filteredViewData[i].valueMap)) {
      makeObservable({ store, rowIndex: i, silent: true });

      if (i === end) {
        notify(store.data, 'rawData', 'filteredRawData', 'viewData', 'filteredViewData');
      }
    }
    rowList.push(filteredViewData[i]);
  }

  return rowList;
}

function getValuesToString(store: Store, ranges: { rowRange?: Range; columnRange?: Range }) {
  const {
    column: { visibleColumnsWithRowHeader },
    data: { filteredViewData, filteredRawData },
  } = store;

  const { rowRange, columnRange } = ranges;

  if (!rowRange || !columnRange) {
    return '';
  }

  const rowList = getObservableList(store, filteredViewData, ...rowRange);
  const columnInRange = visibleColumnsWithRowHeader.slice(columnRange[0], columnRange[1] + 1);

  return rowList
    .map(({ valueMap }) =>
      columnInRange
        .map((targetColumn) =>
          getTextWithCopyOptionsApplied(valueMap[targetColumn.name], filteredRawData, targetColumn)
        )
        .join('\t')
    )
    .join('\n');
}

export function getRangeToPaste(store: Store, pasteData: string[][]): SelectionRange {
  const {
    selection: { originalRange },
    focus: { totalColumnIndex, originalRowIndex },
    column: { visibleColumnsWithRowHeader },
  } = store;
  let startRowIndex, startColumnIndex;

  if (originalRange) {
    startRowIndex = originalRange.row[0];
    startColumnIndex = originalRange.column[0];
  } else {
    startRowIndex = originalRowIndex!;
    startColumnIndex = totalColumnIndex!;
  }

  const endRowIndex = pasteData.length + startRowIndex - 1;
  const endColumnIndex =
    Math.min(pasteData[0].length + startColumnIndex, visibleColumnsWithRowHeader.length) - 1;

  return {
    row: [startRowIndex, endRowIndex],
    column: [startColumnIndex, endColumnIndex],
  };
}

export function copyDataToRange(range: SelectionRange, pasteData: string[][]) {
  const rowLength = range.row[1] - range.row[0] + 1;
  const colLength = range.column[1] - range.column[0] + 1;
  const dataRowLength = pasteData.length;
  const dataColLength = pasteData[0].length;
  const rowDupCount = Math.floor(rowLength / dataRowLength) - 1;
  const colDupCount = Math.floor(colLength / dataColLength) - 1;
  const result = [...pasteData];

  for (let i = 0; i < rowDupCount; i += 1) {
    pasteData.forEach((row) => {
      result.push(row.slice(0));
    });
  }

  result.forEach((row) => {
    const rowData = row.slice(0);

    for (let i = 0; i < colDupCount; i += 1) {
      row.push(...rowData);
    }
  });

  return result;
}

export function getText(store: Store, ranges?: { rowRange: Range; columnRange: Range }) {
  const {
    selection: { originalRange },
    focus: { originalRowIndex, totalColumnIndex },
  } = store;

  let rowRange = ranges?.rowRange ?? originalRange?.row;
  let columnRange = ranges?.columnRange ?? originalRange?.column;

  // set focus index when there is no selection area
  if (isNil(rowRange) && !isNull(originalRowIndex)) {
    rowRange = [originalRowIndex, originalRowIndex];
  }

  if (isNil(columnRange) && !isNull(totalColumnIndex)) {
    columnRange = [totalColumnIndex, totalColumnIndex];
  }

  return getValuesToString(store, { rowRange, columnRange });
}
