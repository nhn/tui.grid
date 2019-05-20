import {
  CellValue,
  CellRenderData,
  ClipboardCopyOptions,
  Range,
  Dictionary,
  Row,
  ViewRow,
  ColumnInfo,
  CustomValue
} from '../store/types';
import { find } from './common';
import { Options } from '../editor/select';

const CUSTOM_LF_SUBCHAR = '___tui_grid_lf___';
const CUSTOM_CR_SUBCHAR = '___tui_grid_cr___';
const CUSTOM_LF_REGEXP = new RegExp(CUSTOM_LF_SUBCHAR, 'g');
const CUSTOM_CR_REGEXP = new RegExp(CUSTOM_CR_SUBCHAR, 'g');
const LF = '\n';
const CR = '\r';

export function setDataInSpanRange(
  value: string,
  data: string[][],
  colspanRange: Range,
  rowspanRange: Range
) {
  const [startColspan, endColspan] = colspanRange;
  const [startRowspan, endRowspan] = rowspanRange;

  for (let rIndex = startRowspan; rIndex < endRowspan; rIndex += 1) {
    for (let cIndex = startColspan; cIndex < endColspan; cIndex += 1) {
      data[rIndex][cIndex] = startRowspan === rIndex && startColspan === cIndex ? value : ' ';
    }
  }
}

export function convertTableToData(rows: HTMLCollectionOf<HTMLTableRowElement>) {
  const data: string[][] = [];
  let colspanRange: Range, rowspanRange: Range;

  for (let index = 0; index < rows.length; index += 1) {
    data[index] = [];
  }

  const rowsIter = Array.prototype.slice.call(rows);
  rowsIter.forEach(function(tr: HTMLTableRowElement, rowIndex: number) {
    let columnIndex = 0;

    Array.prototype.slice.call(tr.cells).forEach(function(td: HTMLTableDataCellElement) {
      const text = td.textContent || td.innerText;

      while (data[rowIndex][columnIndex]) {
        columnIndex += 1;
      }

      colspanRange = [columnIndex, columnIndex + (td.colSpan || 1)];
      rowspanRange = [rowIndex, rowIndex + (td.rowSpan || 1)];

      setDataInSpanRange(text, data, colspanRange, rowspanRange);
      columnIndex = colspanRange[1];
    });
  });

  return data;
}

function removeDoubleQuotes(text: string) {
  if (text.match(CUSTOM_LF_REGEXP)) {
    text = text.substring(1, text.length - 1).replace(/""/g, '"');
  }

  return text;
}

function replaceNewlineToSubchar(text: string) {
  return text.replace(/"([^"]|"")*"/g, function(value: string) {
    return value.replace(LF, CUSTOM_LF_SUBCHAR).replace(CR, CUSTOM_CR_SUBCHAR);
  });
}

export function convertTextToData(text: string) {
  // Each newline cell data is wrapping double quotes in the text and
  // newline characters should be replaced with substitution characters temporarily
  // before spliting the text by newline characters.
  text = replaceNewlineToSubchar(text);

  return text.split(/\r?\n/).map(function(row: string) {
    return row.split('\t').map(function(column: string) {
      column = removeDoubleQuotes(column);

      return column.replace(CUSTOM_LF_REGEXP, LF).replace(CUSTOM_CR_REGEXP, CR);
    });
  });
}

export function getCustomValue(
  customValue: CustomValue,
  value: CellValue,
  rowAttrs: Row[],
  column: ColumnInfo
) {
  if (typeof customValue === 'function') {
    return customValue(value, rowAttrs, column);
  }
  return customValue;
}

export function getTextWithCopyOptionsApplied(
  valueMap: CellRenderData,
  rawData: Row[],
  column: ColumnInfo,
  copyOptions?: ClipboardCopyOptions,
  editorOptions?: Dictionary<Options>
) {
  let retValue = valueMap.value;

  // priority: customValue > useListItemText > useFormattedValue > original Data
  if (copyOptions) {
    if (copyOptions.customValue) {
      retValue = getCustomValue(copyOptions.customValue, valueMap.value, rawData, column);
    } else if (copyOptions.useListItemText && editorOptions) {
      const { listItems } = (editorOptions as unknown) as Options;
      const listItem = find((item) => item.value === valueMap.value, listItems);
      retValue = listItem ? listItem.text : valueMap.value;
    } else if (copyOptions.useFormattedValue) {
      retValue = valueMap.formattedValue;
    }
  }

  return retValue ? retValue.toString() : '';
}

export function isColumnEditable(viewData: ViewRow[], rowIndex: number, columnName: string) {
  const { disabled, editable } = viewData[rowIndex].valueMap[columnName];
  return editable && !disabled;
}

export function getEndIndexToPaste(
  startIndex: Range,
  pasteData: string[][],
  totalColumnLength: number,
  totalRowLength: number
): Range {
  const rowIndex = Math.min(pasteData.length + startIndex[0], totalRowLength) - 1;
  const columnIndex = Math.min(pasteData[0].length + startIndex[1], totalColumnLength) - 1;

  return [rowIndex, columnIndex];
}
