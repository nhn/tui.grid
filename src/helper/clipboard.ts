import {
  Store,
  CellValue,
  CellRenderData,
  ClipboardCopyOptions,
  ViewRow,
  Dictionary
} from '../store/types';
import { find } from './common';
import { Options } from '../editor/select';

// @TODO: 변형된 값 넣기. test 스토리북에 넣기(테스트)
// paste작업 시작. 스펙 어떻게 될 지 보기

export const CUSTOM_LF_SUBCHAR = '___tui_grid_lf___';
export const CUSTOM_CR_SUBCHAR = '___tui_grid_cr___';
const CUSTOM_LF_REGEXP = new RegExp(CUSTOM_LF_SUBCHAR, 'g');
const CUSTOM_CR_REGEXP = new RegExp(CUSTOM_CR_SUBCHAR, 'g');
const LF = '\n';
const CR = '\r';

// @TODO: 이럴 때 빈문자열 복사되는 것이 맞나?

export function addDoubleQuotes(text: string) {
  if (text.match(/\r?\n/g)) {
    text = `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

// @TODO: getcustomValue 어떤 스펙으로 될지 (파라미터가 변하는데?)
// function getCustomValue(customValue, value, rowAttrs, column) {
//   if (typeof customValue === 'function') {
//     return customValue(value, rowAttrs, column);
//   }
//   return customValue;
// }

function getTextWithCopyOptionsApplied(
  valueMap: CellRenderData,
  copyOptions?: ClipboardCopyOptions,
  editorOptions?: Dictionary<Options>
) {
  let retValue = valueMap.value;

  // priority: customValue > useListItemText > useFormattedValue > original Data
  if (copyOptions) {
    if (copyOptions.customValue) {
      // @TODO: getCustomValue 파라미터 정해서 제대로 하기
      // return getCustomValue(value);
      retValue = valueMap.value;
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

function getValueToString(store: Store) {
  const {
    column,
    focus: { rowIndex, columnName, totalColumnIndex },
    data: { viewData }
  } = store;
  if (rowIndex === null || columnName === null || totalColumnIndex === null) {
    // @TODO: 이럴 때 빈문자열 복사되는 것이 맞나?
    return '';
  }

  const { visibleColumns } = column;
  const valueMap = viewData[rowIndex].valueMap[columnName];
  const { copyOptions } = visibleColumns[totalColumnIndex];

  return getTextWithCopyOptionsApplied(valueMap, copyOptions);
}

function getValuesToString(store: Store) {
  const {
    selection: { range },
    column: { visibleColumns },
    data: { viewData }
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
      rowResult.push(getTextWithCopyOptionsApplied(valueMap[name], copyOptions, editorOptions));
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
