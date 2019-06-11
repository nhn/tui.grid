import {
  CellValue,
  CellRenderData,
  Range,
  Row,
  ViewRow,
  ColumnInfo,
  CustomValue
} from '../store/types';
import { find, fromArray } from './common';
import { ListItemOptions } from '../editor/types';
import { WindowWithClipboard } from '../view/clipboard';

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

  for (let rowIdx = startRowspan; rowIdx < endRowspan; rowIdx += 1) {
    for (let columnIdx = startColspan; columnIdx < endColspan; columnIdx += 1) {
      data[rowIdx][columnIdx] = startRowspan === rowIdx && startColspan === columnIdx ? value : ' ';
    }
  }
}

export function convertTableToData(rows: HTMLCollectionOf<HTMLTableRowElement>) {
  const data: string[][] = [];
  let colspanRange: Range, rowspanRange: Range;

  for (let index = 0; index < rows.length; index += 1) {
    data[index] = [];
  }

  fromArray(rows).forEach((tr, rowIndex) => {
    let columnIndex = 0;

    fromArray(tr.cells).forEach((td) => {
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
    return text.substring(1, text.length - 1).replace(/""/g, '"');
  }

  return text;
}

function replaceNewlineToSubchar(text: string) {
  return text.replace(/"([^"]|"")*"/g, (value) =>
    value.replace(LF, CUSTOM_LF_SUBCHAR).replace(CR, CUSTOM_CR_SUBCHAR)
  );
}

export function convertTextToData(text: string) {
  // Each newline cell data is wrapping double quotes in the text and
  // newline characters should be replaced with substitution characters temporarily
  // before spliting the text by newline characters.
  text = replaceNewlineToSubchar(text);

  return text.split(/\r?\n/).map((row) =>
    row.split('\t').map((column) =>
      removeDoubleQuotes(column)
        .replace(CUSTOM_LF_REGEXP, LF)
        .replace(CUSTOM_CR_REGEXP, CR)
    )
  );
}

export function getCustomValue(
  customValue: CustomValue,
  value: CellValue,
  rowAttrs: Row[],
  column: ColumnInfo
) {
  return typeof customValue === 'function' ? customValue(value, rowAttrs, column) : customValue;
}

export function getTextWithCopyOptionsApplied(
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

      valueList.forEach((val) => {
        const listItem = find((item) => item.value === val, listItems);

        result.push(listItem ? listItem.text : val);
      });

      text = result.join(',');
    } else if (copyOptions.useFormattedValue) {
      const { prefix, postfix, formattedValue } = valueMap;
      text = `${prefix}${formattedValue}${postfix}`;
    }
  }

  if (typeof text === 'undefined' || text === null) {
    return '';
  }

  return String(text);
}

export function isColumnEditable(viewData: ViewRow[], rowIndex: number, columnName: string) {
  const { disabled, editable } = viewData[rowIndex].valueMap[columnName];
  return editable && !disabled;
}

export function isSupportWindowClipboardData() {
  return !!(window as WindowWithClipboard).clipboardData;
}
