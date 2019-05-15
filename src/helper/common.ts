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

export function findIndexes<T>(predicate: (v: T) => boolean, arr: T[]) {
  return arr.reduce((acc, v, idx) => (predicate(v) ? [...acc, idx] : acc), [] as number[]);
}

export function findPrevIndex<T>(arr: T[], pred: (_: T) => boolean): number {
  const index = arr.findIndex(pred);

  return index >= 0 ? index - 1 : arr.length - 1;
}

export function findOffsetIndex(offsets: number[], targetOffset: number) {
  return findPrevIndex(offsets, (offset) => offset > targetOffset);
}

export function pipe<T>(initVal: T, ...args: Function[]) {
  return args.reduce((acc, fn) => fn(acc), initVal);
}

// eslint-disable-next-line consistent-return
export function find<T>(pred: (item: T) => boolean, arr: T[]) {
  for (const item of arr) {
    if (pred(item)) {
      return item;
    }
  }
}

export function findProp<T>(propName: keyof T, value: T[keyof T], arr: T[]) {
  return find((item) => item[propName] === value, arr);
}

export function some<T>(pred: (item: T) => boolean, arr: T[]) {
  return !!find(pred, arr);
}

export function someProp<T>(propName: keyof T, value: T[keyof T], arr: T[]) {
  return !!findProp(propName, value, arr);
}

export function findIndex<T>(pred: (item: T) => boolean, arr: T[]) {
  for (let i = 0, len = arr.length; i <= len; i += 1) {
    if (pred(arr[i])) {
      return i;
    }
  }
  return -1;
}

export function findPropIndex<T>(propName: keyof T, value: T[keyof T], arr: T[]) {
  return findIndex((item) => item[propName] === value, arr);
}

export function mapProp<T, K extends keyof T>(propName: K, arr: T[]) {
  return arr.map((item) => item[propName]);
}

export function deepAssign<T1 extends Obj, T2 extends Obj>(targetObj: T1, obj: T2): T1 & T2 {
  const resultObj = { ...(targetObj as T1 & T2) };

  for (const prop of Object.keys(obj)) {
    if (resultObj.hasOwnProperty(prop) && typeof resultObj[prop] === 'object') {
      resultObj[prop] = deepAssign(resultObj[prop], obj[prop]);
    } else {
      resultObj[prop] = obj[prop];
    }
  }

  return resultObj;
}

export function createMapFromArray<T>(arr: T[], propName: keyof T) {
  const resultMap: { [key: string]: T } = {};
  arr.forEach((item) => {
    const key = String(item[propName]);
    resultMap[key] = item;
  });

  return resultMap;
}

/**
 * Returns a number whose value is limited to the given range.
 * @param {Number} value - A number to force within given min-max range
 * @param {Number} min - The lower boundary of the output range
 * @param {Number} max - The upper boundary of the output range
 * @returns {number} A number in the range [min, max]
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
