interface Obj {
  [propName: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

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
  return find(item => item[propName] === value, arr);
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
  return findIndex(item => item[propName] === value, arr);
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
  return findPrevIndex(offsets, offset => offset > targetOffset);
}

export function mapProp<T, K extends keyof T>(propName: K, arr: T[]) {
  return arr.map(item => item[propName]);
}

export function deepMergedCopy<T1 extends Obj, T2 extends Obj>(targetObj: T1, obj: T2): T1 & T2 {
  const resultObj = { ...(targetObj as T1 & T2) };

  for (const prop of Object.keys(obj)) {
    if (resultObj.hasOwnProperty(prop) && typeof resultObj[prop] === 'object') {
      if (Array.isArray(obj[prop])) {
        resultObj[prop] = obj[prop];
      } else {
        resultObj[prop] = deepMergedCopy(resultObj[prop], obj[prop]);
      }
    } else {
      resultObj[prop] = obj[prop];
    }
  }

  return resultObj;
}

export function assign<T1 extends Obj, T2 extends Obj>(targetObj: T1, obj: T2) {
  for (const prop of Object.keys(obj)) {
    if (targetObj.hasOwnProperty(prop) && typeof targetObj[prop] === 'object') {
      if (Array.isArray(obj[prop])) {
        targetObj[prop] = obj[prop];
      } else {
        assign(targetObj[prop], obj[prop]);
      }
    } else {
      targetObj[prop] = obj[prop];
    }
  }
}

export function removeArrayItem<T>(targetItem: T, arr: T[]) {
  const targetIdx = findIndex(item => item === targetItem, arr);
  arr.splice(targetIdx, 1);

  return arr;
}

export function createMapFromArray<T>(arr: T[], propName: keyof T) {
  const resultMap: { [key: string]: T } = {};
  arr.forEach(item => {
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

export function forEachObject<T, K extends Extract<keyof T, string>, V extends T[K]>(
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
    "'": '#39'
  };
  type EntityKey = keyof typeof entities;

  return html.replace(/[<>&"']/g, match => `&${entities[match as EntityKey]};`);
}

export function setDefaultProp<T>(obj: T, key: keyof T, defValue: any): void {
  if (typeof obj[key] === 'undefined') {
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
  if (typeof value === 'string') {
    value = value.replace(/,/g, '');
  }

  if (typeof value === 'number' || isNaN(value) || isBlank(value)) {
    return value;
  }

  return Number(value);
}

export function debounce(fn: Function, wait: number, immediate = false) {
  let timeout: number | null = null;

  return (...args: any[]) => {
    const later = function() {
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
  const pruned: Partial<T> = {};
  forEachObject((value, key) => {
    if (!isUndefined(value) && !isNull(value)) {
      pruned[key] = value;
    }
  }, obj);

  return pruned;
}

export function omit<T extends object>(obj: T, ...propNames: string[]) {
  const resultMap = {} as T;
  for (const key in obj) {
    if (hasOwnProp(obj, key) && !includes(propNames, key)) {
      resultMap[key] = obj[key];
    }
  }
  return resultMap;
}
