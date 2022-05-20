interface Obj {
  [propName: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

type OmitedKey<T, K extends keyof T> = keyof Omit<T, K>;
type PickedKey<T, K extends keyof T> = keyof Pick<T, K>;

const CUSTOM_LF_SUBCHAR = '___tui_grid_lf___';
const CUSTOM_CR_SUBCHAR = '___tui_grid_cr___';
const LF = '\n';
const CR = '\r';
const CUSTOM_LF_REGEXP = new RegExp(CUSTOM_LF_SUBCHAR, 'g');
const CUSTOM_CR_REGEXP = new RegExp(CUSTOM_CR_SUBCHAR, 'g');

export function shallowEqual(o1: Obj, o2: Obj) {
  for (const key in o1) {
    if (o1[key] !== o2[key]) {
      return false;
    }
  }
  for (const key in o2) {
    if (!(key in o1)) {
      return false;
    }
  }

  return true;
}

export function arrayEqual(a1: unknown[], a2: unknown[]) {
  if (a1.length !== a2.length) {
    return false;
  }

  for (let i = 0, len = a1.length; i < len; i += 1) {
    if (a1[i] !== a2[i]) {
      return false;
    }
  }

  return true;
}

export function sum(nums: number[]) {
  return nums.reduce((acc, num) => acc + num, 0);
}

export function pipe<T>(initVal: T, ...args: Function[]) {
  return args.reduce((acc, fn) => fn(acc), initVal);
}

export function includes<T>(arr: T[], searchItem: T, searchIndex?: number) {
  if (typeof searchIndex === 'number' && arr[searchIndex] !== searchItem) {
    return false;
  }
  for (const item of arr) {
    if (item === searchItem) {
      return true;
    }
  }
  return false;
}

// eslint-disable-next-line consistent-return
export function find<T>(predicate: (item: T) => boolean, arr: T[]) {
  for (const item of arr) {
    if (predicate(item)) {
      return item;
    }
  }
}

export function findProp<T>(propName: keyof T, value: T[keyof T], arr: T[]) {
  return find((item) => item[propName] === value, arr);
}

export function some<T>(predicate: (item: T) => boolean, arr: T[]) {
  return !!find(predicate, arr);
}

export function someProp<T>(propName: keyof T, value: T[keyof T], arr: T[]) {
  return !!findProp(propName, value, arr);
}

export function findIndex<T>(predicate: (item: T) => boolean, arr: T[]) {
  for (let i = 0, len = arr.length; i < len; i += 1) {
    if (predicate(arr[i])) {
      return i;
    }
  }
  return -1;
}

export function findPropIndex<T>(propName: keyof T, value: T[keyof T], arr: T[]) {
  return findIndex((item) => item[propName] === value, arr);
}

export function findIndexes<T>(predicate: (v: T) => boolean, arr: T[]) {
  return arr.reduce((acc, v, idx) => (predicate(v) ? [...acc, idx] : acc), [] as number[]);
}

export function findPrevIndex<T>(arr: T[], predicate: (_: T) => boolean): number {
  const index = findIndex(predicate, arr);
  const positiveIndex = index <= 0 ? 0 : index - 1;

  return index >= 0 ? positiveIndex : arr.length - 1;
}

export function findOffsetIndex(offsets: number[], targetOffset: number) {
  return findPrevIndex(offsets, (offset) => offset > targetOffset);
}

export function mapProp<T, K extends keyof T>(propName: K, arr: T[]) {
  return arr.map((item) => item[propName]);
}

export function deepMergedCopy<T1 extends Obj, T2 extends Obj>(targetObj: T1, obj: T2) {
  const resultObj = { ...targetObj } as T1 & T2;

  Object.keys(obj).forEach((prop: keyof T2) => {
    if (isObject(resultObj[prop])) {
      if (Array.isArray(obj[prop])) {
        resultObj[prop as keyof T1 & T2] = deepCopyArray(obj[prop]);
      } else if (resultObj.hasOwnProperty(prop)) {
        resultObj[prop] = deepMergedCopy(resultObj[prop], obj[prop]);
      } else {
        resultObj[prop as keyof T1 & T2] = deepCopy(obj[prop]);
      }
    } else {
      resultObj[prop as keyof T1 & T2] = obj[prop];
    }
  });

  return resultObj;
}

export function deepCopyArray<T extends Array<any>>(items: T): T {
  return items.map((item: T[number]) => {
    if (isObject(item)) {
      return Array.isArray(item) ? deepCopyArray(item) : deepCopy(item);
    }
    return item;
  }) as T;
}

export function deepCopy<T extends Obj>(obj: T) {
  const resultObj = {} as T;
  const keys = Object.keys(obj);

  if (!keys.length) {
    return obj;
  }

  keys.forEach((prop: keyof T) => {
    if (isObject(obj[prop])) {
      resultObj[prop] = Array.isArray(obj[prop]) ? deepCopyArray(obj[prop]) : deepCopy(obj[prop]);
    } else {
      resultObj[prop] = obj[prop];
    }
  });

  return resultObj as T;
}

export function assign(targetObj: Obj, obj: Obj) {
  Object.keys(obj).forEach((prop) => {
    if (targetObj.hasOwnProperty(prop) && typeof targetObj[prop] === 'object') {
      if (Array.isArray(obj[prop])) {
        targetObj[prop] = obj[prop];
      } else {
        assign(targetObj[prop], obj[prop]);
      }
    } else {
      targetObj[prop] = obj[prop];
    }
  });
}

export function removeArrayItem<T>(targetItem: T, arr: T[]) {
  const targetIdx = findIndex((item) => item === targetItem, arr);
  if (targetIdx !== -1) {
    arr.splice(targetIdx, 1);
  }

  return arr;
}

export function createMapFromArray<T>(arr: T[], propName: keyof T) {
  const resultMap: { [key: string]: T } = {};
  arr.forEach((item) => {
    const key = String(item[propName]);
    resultMap[key] = item;
  });

  return resultMap;
}

export function isFunction(obj: unknown): obj is Function {
  return typeof obj === 'function';
}

export function isObject(obj: unknown): obj is object {
  return typeof obj === 'object' && obj !== null;
}

export function forEachObject<T extends Obj, K extends Extract<keyof T, string>, V extends T[K]>(
  fn: (value: V, key: K, obj: T) => void,
  obj: T
) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      fn(obj[key as K] as V, key as K, obj);
    }
  }
}

export function hasOwnProp<T extends object, K extends keyof T>(obj: T, key: string | K): key is K {
  return obj.hasOwnProperty(key);
}

export function encodeHTMLEntity(html: string) {
  const entities = {
    '"': 'quot',
    '&': 'amp',
    '<': 'lt',
    '>': 'gt',
    "'": '#39',
  };
  type EntityKey = keyof typeof entities;

  return html.replace(/[<>&"']/g, (match) => `&${entities[match as EntityKey]};`);
}

export function setDefaultProp<T>(obj: T, key: keyof T, defValue: any): void {
  if (isUndefined(obj[key]) || isNull(obj[key])) {
    obj[key] = defValue;
  }
}

/**
 * Returns a number whose value is limited to the given range.
 * @param value - A number to force within given min-max range
 * @param min - The lower boundary of the output range
 * @param max - The upper boundary of the output range
 * @returns A number in the range [min, max]
 * @example
 *      // limit the output of this computation to between 0 and 255
 *      value = clamp(value, 0, 255);
 */
export function clamp(value: number, min: number, max: number) {
  if (min > max) {
    [max, min] = [min, max];
  }

  return Math.max(min, Math.min(value, max));
}

export function range(end: number) {
  const arr = [];

  for (let i = 0; i < end; i += 1) {
    arr.push(i);
  }

  return arr;
}

export function last(arr: any[]) {
  return arr[arr.length - 1];
}

export function isBlank(value: any) {
  if (typeof value === 'string') {
    return !value.length;
  }

  return typeof value === 'undefined' || value === null;
}

export function isUndefined(value: unknown): value is undefined {
  return typeof value === 'undefined';
}

export function isNull(value: unknown): value is null {
  return value === null;
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNil(value: unknown): value is null | undefined {
  return isUndefined(value) || isNull(value);
}
/**
 * check the emptiness(included null) of object or array. if obj parameter is null or undefind, return true
 * @param obj - target object or array
 * @returns the emptiness of obj
 */
export function isEmpty(obj: any) {
  return (
    isNull(obj) ||
    isUndefined(obj) ||
    (!isUndefined(obj.length) && obj.length === 0) ||
    Object.keys(obj).length === 0
  );
}

export function fromArray<T>(value: ArrayLike<T>): T[] {
  return Array.prototype.slice.call(value);
}

export function convertToNumber(value: any) {
  if (typeof value === 'number' || isNaN(value) || isBlank(value)) {
    return value;
  }

  return Number(value);
}

export function debounce(fn: Function, wait: number, immediate = false) {
  let timeout: number | null = null;

  return (...args: any[]) => {
    const later = function () {
      timeout = -1;
      if (!immediate) {
        fn(...args);
      }
    };
    const callNow = immediate && !timeout;
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = window.setTimeout(later, wait);
    if (callNow) {
      fn(...args);
    }
  };
}

export function pruneObject<T>(obj: T) {
  const pruned = {} as Required<T>;
  forEachObject((value, key) => {
    if (!isUndefined(value) && !isNull(value)) {
      pruned[key] = value;
    }
  }, obj);

  return pruned;
}

export function omit<T extends object, K extends keyof T>(obj: T, ...propNames: K[]) {
  const resultMap = {} as Omit<T, K>;
  Object.keys(obj).forEach((key) => {
    if (!includes(propNames, key as K)) {
      resultMap[key as OmitedKey<T, K>] = obj[key as OmitedKey<T, K>];
    }
  });
  return resultMap;
}

export function pick<T extends object, K extends keyof T>(obj: T, ...propNames: K[]) {
  const resultMap = {} as Pick<T, K>;
  Object.keys(obj).forEach((key) => {
    if (includes(propNames, key as K)) {
      resultMap[key as PickedKey<T, K>] = obj[key as PickedKey<T, K>];
    }
  });
  return resultMap;
}

export function uniq<T extends unknown>(arr: T[]) {
  return arr.filter((name, index) => arr.indexOf(name) === index);
}

export function uniqByProp<T extends unknown>(propName: keyof T, arr: T[]) {
  return arr.filter((obj, index) => findPropIndex(propName, obj[propName], arr) === index);
}

export function startsWith(str: string, targetStr: string) {
  return targetStr.slice(0, str.length) === str;
}

export function endsWith(str: string, targetStr: string) {
  const index = targetStr.lastIndexOf(str);
  return index !== -1 && index + str.length === targetStr.length;
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

  return text
    .split(/\r?\n/)
    .map((row) =>
      row
        .split('\t')
        .map((column) =>
          removeDoubleQuotes(column).replace(CUSTOM_LF_REGEXP, LF).replace(CUSTOM_CR_REGEXP, CR)
        )
    );
}

export function convertDataToText(data: string[][], delimiter: string) {
  return data.map((row) => `"${row.join(`"${delimiter}"`)}"`).join('\n');
}

export function silentSplice<T>(arr: T[], start: number, deleteCount: number, ...items: T[]): T[] {
  return Array.prototype.splice.call(arr, start, deleteCount, ...items);
}

export function isBetween(value: number, start: number, end: number) {
  return start <= value && value <= end;
}

export function pixelToNumber(pixelString: string) {
  const regExp = new RegExp(/[0-9]+px/);
  return regExp.test(pixelString) ? parseInt(pixelString.replace('px', ''), 10) : 0;
}

export function getLongestText(texts: string[]) {
  return texts.reduce((acc, text) => (text.length > acc.length ? text : acc), '');
}
