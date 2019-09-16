import { CellValue, DateFilterCode, NumberFilterCode, TextFilterCode } from '../store/types';
import { isString, endsWith, startsWith } from './common';
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

function getUnixTime(value: CellValue) {
  console.log(parseInt((new Date(String(value)).getTime() / 1000).toFixed(0), 10));
  return parseInt((new Date(String(value)).getTime() / 1000).toFixed(0), 10);
}

// eslint-disable-next-line consistent-return
function getPredicateWithType(
  code: 'eq' | 'ne',
  type: SingleFilterOptionType,
  inputValue: CellValue
) {
  switch (type) {
    case 'number':
      return code === 'eq'
        ? (cellValue: CellValue) => Number(cellValue) === Number(inputValue)
        : (cellValue: CellValue) => Number(cellValue) !== Number(inputValue);
    case 'text':
    case 'select':
      return code === 'eq'
        ? (cellValue: CellValue) => String(cellValue) === String(inputValue)
        : (cellValue: CellValue) => String(cellValue) !== String(inputValue);
    case 'date':
      return code === 'eq'
        ? (cellValue: CellValue) => getUnixTime(cellValue) === getUnixTime(inputValue)
        : (cellValue: CellValue) => getUnixTime(cellValue) !== getUnixTime(inputValue);
    default:
    // no-default
  }
}

// eslint-disable-next-line consistent-return
export function getFilterConditionFn(
  code: NumberFilterCode | TextFilterCode | DateFilterCode,
  inputValue: CellValue,
  type: SingleFilterOptionType
) {
  switch (code) {
    case 'eq':
    case 'ne':
      return getPredicateWithType(code, type, inputValue);
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
    case 'after':
      return (cellValue: CellValue) => getUnixTime(cellValue) > getUnixTime(inputValue);
    case 'afterEq':
      return (cellValue: CellValue) => getUnixTime(cellValue) >= getUnixTime(inputValue);
    case 'before':
      return (cellValue: CellValue) => getUnixTime(cellValue) < getUnixTime(inputValue);
    case 'beforeEq':
      return (cellValue: CellValue) => getUnixTime(cellValue) <= getUnixTime(inputValue);
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
