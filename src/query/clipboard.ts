import { CellValue, SelectionRange, Store } from '../store/types';
import {
  getEndIndexToPaste,
  getTextWithCopyOptionsApplied,
  isColumnEditable
} from '../helper/clipboard';

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

  const [endRowIndex, endColumnIndex] = getEndIndexToPaste(
    [startRowIndex, startColumnIndex],
    pasteData,
    visibleColumns.length,
    viewData.length
  );

  return {
    row: [startRowIndex, endRowIndex],
    column: [startColumnIndex, endColumnIndex]
  };
}

export function applyPasteDataToRawData(
  store: Store,
  pasteData: string[][],
  indexToPaste: SelectionRange
) {
  const {
    data: { rawData, viewData },
    column: { visibleColumns }
  } = store;
  const {
    row: [startRowIndex, endRowIndex],
    column: [startColumnIndex, endColumnIndex]
  } = indexToPaste;

  const columnNames = visibleColumns.map(({ name }) => name);

  for (let rowIdx = 0; rowIdx + startRowIndex <= endRowIndex; rowIdx += 1) {
    const rawRowIndex = rowIdx + startRowIndex;
    for (let columnIdx = 0; columnIdx + startColumnIndex <= endColumnIndex; columnIdx += 1) {
      const rawColumnIndex = columnIdx + startColumnIndex;
      const name = columnNames[rawColumnIndex];
      if (isColumnEditable(viewData, rawRowIndex, name)) {
        rawData[rawRowIndex][name] = pasteData[rowIdx][columnIdx];
      }
    }
  }
}

export function duplicateData(range: SelectionRange, pasteData: string[][]) {
  const rowLength = range.row[1] - range.row[0] + 1;
  const colLength = range.column[1] - range.column[0] + 1;
  const dataRowLength = pasteData.length;
  const dataColLength = pasteData[0].length;
  const rowDupCount = Math.floor(rowLength / dataRowLength) - 1;
  const colDupCount = Math.floor(colLength / dataColLength) - 1;
  const result = [...pasteData];

  for (let i = 0; i < rowDupCount; i += 1) {
    pasteData.forEach((data) => {
      result.push(data.slice(0));
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
    column: { visibleColumns, allColumnMap },
    focus: { rowIndex, columnName, totalColumnIndex },
    data: { viewData, rawData }
  } = store;

  if (rowIndex === null || columnName === null || totalColumnIndex === null) {
    // @TODO: 이럴 때 빈문자열 복사되는 것이 맞나?
    return '';
  }

  const valueMap = viewData[rowIndex].valueMap[columnName];
  const { copyOptions } = visibleColumns[totalColumnIndex];

  return getTextWithCopyOptionsApplied(valueMap, rawData, allColumnMap[columnName], copyOptions);
}

function getValuesToString(store: Store) {
  const {
    selection: { range },
    column: { visibleColumns, allColumnMap },
    data: { viewData, rawData }
  } = store;

  if (!range) {
    return '';
  }

  const { row, column } = range;
  const rowList = viewData.slice(row[0], row[1] + 1);
  const columnNames = visibleColumns
    .slice(column[0], column[1] + 1)
    .map(({ name, copyOptions, editorOptions }) => {
      return { name, copyOptions, editorOptions };
    });

  const result: string[] = [];

  rowList.forEach((viewRow) => {
    const { valueMap } = viewRow;
    const rowResult: CellValue[] = [];
    columnNames.forEach(({ name, copyOptions, editorOptions }) => {
      rowResult.push(
        getTextWithCopyOptionsApplied(
          valueMap[name],
          rawData,
          allColumnMap[name],
          copyOptions,
          editorOptions
        )
      );
    });
    result.push(rowResult.join('\t'));
  });

  return result.join('\n');
}

export function getText(store: Store) {
  const {
    selection,
    focus: { rowIndex, columnName }
  } = store;

  if (selection.range) {
    return getValuesToString(store);
  }

  if (rowIndex && columnName) {
    return getValueToString(store);
  }

  return '';
}
