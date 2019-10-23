import {
  SelectionRange,
  Store,
  CustomValue,
  CellValue,
  Row,
  ColumnInfo,
  CellRenderData
} from '../store/types';
import { ListItemOptions } from '../editor/types';
import { find } from '../helper/common';

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
    } else if (copyOptions.useListItemText && editorOptions) {
      const { listItems } = (editorOptions as unknown) as ListItemOptions;
      const { value } = valueMap;
      let valueList = [value];
      const result: CellValue[] = [];

      if (typeof value === 'string') {
        valueList = value.split(',');
      }

      valueList.forEach(val => {
        const listItem = find(item => item.value === val, listItems);

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

function getValueToString(store: Store) {
  const {
    column: { visibleColumnsWithRowHeader },
    focus: { rowIndex, columnName, totalColumnIndex },
    data: { filteredViewData, filteredRawData }
  } = store;

  if (rowIndex === null || columnName === null || totalColumnIndex === null) {
    return '';
  }
  const valueMap = filteredViewData[rowIndex].valueMap[columnName];

  return getTextWithCopyOptionsApplied(
    valueMap,
    filteredRawData,
    visibleColumnsWithRowHeader[totalColumnIndex]
  );
}

function getValuesToString(store: Store) {
  const {
    selection: { originalRange },
    column: { visibleColumnsWithRowHeader },
    data: { filteredViewData, filteredRawData }
  } = store;

  if (!originalRange) {
    return '';
  }

  const { row, column } = originalRange!;

  const rowList = filteredViewData.slice(row[0], row[1] + 1);
  const columnInRange = visibleColumnsWithRowHeader.slice(column[0], column[1] + 1);

  return rowList
    .map(({ valueMap }) =>
      columnInRange
        .map(({ name }, index) =>
          getTextWithCopyOptionsApplied(
            valueMap[name],
            filteredRawData,
            visibleColumnsWithRowHeader[index]
          )
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
    data: { viewData }
  } = store;
  let startRowIndex, startColumnIndex;

  if (originalRange) {
    startRowIndex = originalRange.row[0];
    startColumnIndex = originalRange.column[0];
  } else {
    startRowIndex = originalRowIndex!;
    startColumnIndex = totalColumnIndex!;
  }

  const endRowIndex = Math.min(pasteData.length + startRowIndex, viewData.length) - 1;
  const endColumnIndex =
    Math.min(pasteData[0].length + startColumnIndex, visibleColumnsWithRowHeader.length) - 1;

  return {
    row: [startRowIndex, endRowIndex],
    column: [startColumnIndex, endColumnIndex]
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
    pasteData.forEach(row => {
      result.push(row.slice(0));
    });
  }

  result.forEach(row => {
    const rowData = row.slice(0);

    for (let i = 0; i < colDupCount; i += 1) {
      row.push(...rowData);
    }
  });

  return result;
}

export function getText(store: Store) {
  const {
    selection,
    focus: { rowIndex, columnName }
  } = store;

  if (selection.range) {
    return getValuesToString(store);
  }

  if (rowIndex !== null && columnName !== null) {
    return getValueToString(store);
  }

  return '';
}
