import { SelectionRange, Store } from '../store/types';
import { getTextWithCopyOptionsApplied } from '../helper/clipboard';

export function getRangeToPaste(store: Store, pasteData: string[][]): SelectionRange {
  const {
    selection: { range },
    focus: { rowIndex, totalColumnIndex },
    column: { visibleColumns },
    data: { viewData }
  } = store;
  let startRowIndex, startColumnIndex;

  if (range) {
    startRowIndex = range.row[0];
    startColumnIndex = range.column[0];
  } else {
    startRowIndex = rowIndex!;
    startColumnIndex = totalColumnIndex!;
  }

  const endRowIndex = Math.min(pasteData.length + startRowIndex, viewData.length) - 1;
  const endColumnIndex =
    Math.min(pasteData[0].length + startColumnIndex, visibleColumns.length) - 1;

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

function getValueToString(store: Store) {
  const {
    column: { visibleColumns },
    focus: { rowIndex, columnName, totalColumnIndex },
    data: { viewData, rawData }
  } = store;

  if (rowIndex === null || columnName === null || totalColumnIndex === null) {
    return '';
  }
  const valueMap = viewData[rowIndex].valueMap[columnName];

  return getTextWithCopyOptionsApplied(valueMap, rawData, visibleColumns[totalColumnIndex]);
}

function getValuesToString(store: Store) {
  const {
    selection: { range },
    column: { visibleColumns },
    data: { viewData, rawData }
  } = store;

  if (!range) {
    return '';
  }

  const { row, column } = range;
  const rowList = viewData.slice(row[0], row[1] + 1);
  const columnInRange = visibleColumns.slice(column[0], column[1] + 1);

  return rowList
    .map(({ valueMap }) =>
      columnInRange
        .map(({ name }, index) =>
          getTextWithCopyOptionsApplied(valueMap[name], rawData, visibleColumns[index])
        )
        .join('\t')
    )
    .join('\n');
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
