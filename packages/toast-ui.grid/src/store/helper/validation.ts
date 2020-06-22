import { OptRow } from '@t/options';
import { Validation, ValidationType, Column } from '@t/store/column';
import { RowKey, CellValue, Row } from '@t/store/data';
import {
  isString,
  debounce,
  isBlank,
  isFunction,
  omit,
  convertToNumber,
  isNumber,
  includes
} from '../../helper/common';
import {
  isObservable,
  notify,
  unobservedInvoke,
  getOriginObject,
  Observable,
  getRunningObservers
} from '../../helper/observable';

type UniqueInfoMap = Record<string, Record<string, RowKey[]>>;

interface ValidationOption {
  id: number;
  value: CellValue;
  row: Row;
  rawData: Row[];
  columnName: string;
  validation?: Validation;
}

const UNIQUENESS_DEBOUNCE_TIME = 50;
const instanceValidationMap: Record<number, UniqueInfoMap> = {};
let validatingUniqueness = false;

export function createValidationMap(id: number) {
  instanceValidationMap[id] = {};
}

export function invokeWithUniqueValidationColumn(column: Column, fn: (name: string) => void) {
  column.validationColumns.forEach(({ name, validation }) => {
    if (validation!.unique) {
      fn(name);
    }
  });
}

export function addUniqueInfoMap(id: number, row: OptRow, column: Column) {
  invokeWithUniqueValidationColumn(column, name =>
    addColumnUniqueInfoMap(id, row.rowKey as RowKey, name, row[name])
  );
}

export function removeUniqueInfoMap(id: number, row: OptRow, column: Column) {
  invokeWithUniqueValidationColumn(column, name =>
    removeColumnUniqueInfoMap(id, row.rowKey as RowKey, name, row[name])
  );
}

export function clearUniqueInfoMap(id: number) {
  instanceValidationMap[id] = {};
}

export function removeColumnUniqueInfoMap(
  id: number,
  rowKey: RowKey,
  columnName: string,
  cellValue: CellValue
) {
  const value = String(cellValue);
  const uniqueInfoMap = instanceValidationMap[id];
  if (uniqueInfoMap && uniqueInfoMap[value] && uniqueInfoMap[value][columnName]) {
    uniqueInfoMap[value][columnName] = uniqueInfoMap[value][columnName].filter(
      targetRowKey => targetRowKey !== rowKey
    );
  }
}

export function addColumnUniqueInfoMap(
  id: number,
  rowKey: RowKey,
  columnName: string,
  cellValue: CellValue
) {
  const value = String(cellValue);
  const uniqueInfoMap = instanceValidationMap[id];
  uniqueInfoMap[value] = uniqueInfoMap[value] || {};
  uniqueInfoMap[value][columnName] = uniqueInfoMap[value][columnName] || [];
  uniqueInfoMap[value][columnName].push(rowKey);
}

export function hasDuplicateValue(id: number, columnName: string, cellValue: CellValue) {
  const value = String(cellValue);
  const uniqueInfoMap = instanceValidationMap[id];
  return uniqueInfoMap && uniqueInfoMap[value] && uniqueInfoMap[value][columnName]?.length > 1;
}

const validateDataUniqueness = debounce((rawData: Row[], rowKey: RowKey, columnName: string) => {
  rawData.forEach(row => {
    if (isObservable(row) && row.rowKey !== rowKey) {
      notify(row, columnName);
    }
  });
  validatingUniqueness = false;
}, UNIQUENESS_DEBOUNCE_TIME);

export function getValidationCode({
  id,
  value,
  row,
  rawData,
  columnName,
  validation
}: ValidationOption) {
  const invalidStates: ValidationType[] = [];

  if (!validation) {
    return invalidStates;
  }

  const { required, dataType, min, max, regExp, unique, validatorFn } = validation;

  if (required && isBlank(value)) {
    invalidStates.push('REQUIRED');
  }

  if (unique) {
    if (hasDuplicateValue(id, columnName, value)) {
      invalidStates.push('UNIQUE');
    }

    // prevent recursive call of 'validateDataUniqueness' when scrolling or manipulating the data
    if (!validatingUniqueness && !includes(getRunningObservers(), 'lazyObservable')) {
      validatingUniqueness = true;
      validateDataUniqueness(rawData, row.rowKey, columnName);
    }
  }

  if (isFunction(validatorFn)) {
    const originRow = omit(
      getOriginObject(row as Observable<Row>),
      'sortKey',
      'uniqueKey',
      '_relationListItemMap',
      '_disabledPriority'
    ) as Row;

    unobservedInvoke(() => {
      if (!validatorFn(value, originRow, columnName)) {
        invalidStates.push('VALIDATOR_FN');
      }
    });
  }

  if (dataType === 'string' && !isString(value)) {
    invalidStates.push('TYPE_STRING');
  }

  if (regExp && isString(value) && !regExp.test(value)) {
    invalidStates.push('REGEXP');
  }

  const numberValue = convertToNumber(value);

  if (dataType === 'number' && !isNumber(numberValue)) {
    invalidStates.push('TYPE_NUMBER');
  }

  if (min && isNumber(numberValue) && numberValue < min) {
    invalidStates.push('MIN');
  }

  if (max && isNumber(numberValue) && numberValue > max) {
    invalidStates.push('MAX');
  }

  return invalidStates;
}
