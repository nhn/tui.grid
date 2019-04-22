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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function pipe(initVal: any, ...args: Function[]) {
  return args.reduce((acc, fn) => fn(acc), initVal);
}

export function mapProp<T, K extends keyof T>(propName: K, arr: T[]) {
  return arr.map((item) => item[propName]);
}

export function deepAssign<T1 extends Obj, T2 extends Obj>(targetObj: T1, obj: T2): T1 & T2 {
  const resultObj: T1 & T2 = Object.assign({}, targetObj) as T1 & T2;

  for (const prop of Object.keys(obj)) {
    if (resultObj.hasOwnProperty(prop) && typeof resultObj[prop] === 'object') {
      resultObj[prop] = deepAssign(resultObj[prop], obj[prop]);
    } else {
      resultObj[prop] = obj[prop];
    }
  }

  return resultObj;
}
