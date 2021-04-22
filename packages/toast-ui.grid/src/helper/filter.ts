import {
  OperatorType,
  FilterOptionType,
  NumberFilterCode,
  TextFilterCode,
  DateFilterCode,
} from '@t/store/filterLayerState';
import { CellValue } from '@t/store/data';
import { isString, endsWith, startsWith } from './common';
import i18n from '../i18n';

interface FilterSelectOption {
  number: { [key in NumberFilterCode]: string };
  text: { [key in TextFilterCode]: string };
  date: { [key in DateFilterCode]: string };
}

let filterSelectOption: FilterSelectOption;

export function createFilterSelectOption(): FilterSelectOption {
  if (!filterSelectOption) {
    filterSelectOption = {
      number: {
        eq: '=',
        lt: '<',
        gt: '>',
        lte: '<=',
        gte: '>=',
        ne: '!=',
      },
      text: {
        contain: i18n.get('filter.contains'),
        eq: i18n.get('filter.eq'),
        ne: i18n.get('filter.ne'),
        start: i18n.get('filter.start'),
        end: i18n.get('filter.end'),
      },
      date: {
        eq: i18n.get('filter.eq'),
        ne: i18n.get('filter.ne'),
        after: i18n.get('filter.after'),
        afterEq: i18n.get('filter.afterEq'),
        before: i18n.get('filter.before'),
        beforeEq: i18n.get('filter.beforeEq'),
      },
    };
  }
  return filterSelectOption;
}

export function getUnixTime(value: CellValue) {
  return parseInt((new Date(String(value)).getTime() / 1000).toFixed(0), 10);
}

function getPredicateWithType(
  code: 'eq' | 'ne',
  type: FilterOptionType,
  inputValue: CellValue
): (cellValue: CellValue) => boolean {
  const convertFn = {
    number: Number,
    text: String,
    select: String,
    date: getUnixTime,
  }[type];

  return code === 'eq'
    ? (cellValue) => convertFn(cellValue) === convertFn(inputValue)
    : (cellValue) => convertFn(cellValue) !== convertFn(inputValue);
}

export function getFilterConditionFn(
  code: NumberFilterCode | TextFilterCode | DateFilterCode,
  inputValue: string,
  type: FilterOptionType
): (cellValue: CellValue) => boolean {
  switch (code) {
    case 'eq':
    case 'ne':
      return getPredicateWithType(code, type, inputValue);
    case 'lt':
      return (cellValue) => Number(cellValue) < Number(inputValue);
    case 'gt':
      return (cellValue) => Number(cellValue) > Number(inputValue);
    case 'lte':
      return (cellValue) => Number(cellValue) <= Number(inputValue);
    case 'gte':
      return (cellValue) => Number(cellValue) >= Number(inputValue);
    case 'contain':
      return (cellValue) =>
        isString(cellValue) && isString(inputValue) && cellValue.indexOf(inputValue) !== -1;
    case 'start':
      return (cellValue) =>
        isString(cellValue) && isString(inputValue) && startsWith(inputValue, cellValue);
    case 'end':
      return (cellValue) =>
        isString(cellValue) && isString(inputValue) && endsWith(inputValue, cellValue);
    case 'after':
      return (cellValue) => getUnixTime(cellValue) > getUnixTime(inputValue);
    case 'afterEq':
      return (cellValue) => getUnixTime(cellValue) >= getUnixTime(inputValue);
    case 'before':
      return (cellValue) => getUnixTime(cellValue) < getUnixTime(inputValue);
    case 'beforeEq':
      return (cellValue) => getUnixTime(cellValue) <= getUnixTime(inputValue);
    default:
      throw new Error('code not available.');
  }
}

export function composeConditionFn(fns: Function[], operator?: OperatorType) {
  return function (value: CellValue) {
    return fns.reduce((acc, fn: Function) => {
      return operator === 'OR' ? acc || fn(value) : acc && fn(value);
    }, operator !== 'OR');
  };
}
