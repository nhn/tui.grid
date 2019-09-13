import { CellValue, DateFilterCode, NumberFilterCode, TextFilterCode } from '../store/types';
import { isNumber, isString, endsWith, startsWith } from './common';
import { cell } from '../theme/styleGenerator';
import { SingleFilterOptionType } from '../types';

interface FilterSelectOption {
  number: { [key in NumberFilterCode]: string };
  text: { [key in TextFilterCode]: string };
  date: { [key in DateFilterCode]: string };
}

export const filterSelectOption: FilterSelectOption = {
  number: {
    eq: '=',
    lt: '>',
    gt: '<',
    lte: '>=',
    gte: '<=',
    ne: '!='
  },
  text: {
    contain: 'Contains',
    eq: 'Equals',
    ne: 'Not equals',
    start: 'Starts with',
    end: 'Ends with'
  },
  date: {
    eq: 'Equals',
    ne: 'Not equals',
    after: 'After',
    afterEq: 'After or Equal',
    before: 'Before',
    beforeEq: 'Before or Equal'
  }
};

// eslint-disable-next-line consistent-return
export function getFilterConditionFn(
  code: NumberFilterCode | TextFilterCode | DateFilterCode,
  inputValue: CellValue,
  type: SingleFilterOptionType
) {
  switch (code) {
    case 'eq':
      return type === 'number'
        ? (cellValue: CellValue) => Number(cellValue) === Number(inputValue)
        : (cellValue: CellValue) => String(cellValue) === String(inputValue);
    case 'ne':
      return type === 'number'
        ? (cellValue: CellValue) => Number(cellValue) !== Number(inputValue)
        : (cellValue: CellValue) => String(cellValue) !== String(inputValue);
    case 'lt':
      return (cellValue: CellValue) => Number(cellValue) > Number(inputValue);
    case 'gt':
      return (cellValue: CellValue) => Number(cellValue) < Number(inputValue);
    case 'lte':
      return (cellValue: CellValue) => Number(cellValue) <= Number(inputValue);
    case 'gte':
      return (cellValue: CellValue) => Number(cellValue) >= Number(inputValue);
    case 'contain':
      return (cellValue: CellValue) =>
        isString(cellValue) && isString(inputValue) && cellValue.includes(inputValue);
    case 'start':
      return (cellValue: CellValue) =>
        isString(cellValue) && isString(inputValue) && startsWith(inputValue, cellValue);
    case 'end':
      return (cellValue: CellValue) =>
        isString(cellValue) && isString(inputValue) && endsWith(inputValue, cellValue);
    //  @TODO: date 타입 함수 추가 필요
    default:
    // no default
  }
}

export function composeConditionFn(fns: Function[], operator?: 'AND' | 'OR') {
  return function(value: CellValue) {
    return fns.reduce((acc, fn: Function) => {
      if (operator === 'OR') {
        return acc || fn(value);
      }
      return acc && fn(value);
    }, operator !== 'OR');
  };
}
