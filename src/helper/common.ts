const CLS_PREFIX = 'tui-grid-';

type ClassName =
  | 'body-area'
  | 'body-container'
  | 'border-line'
  | 'border-line-top'
  | 'border-line-left'
  | 'border-line-right'
  | 'border-line-bottom'
  | 'cell-content'
  | 'cell'
  | 'cell-head'
  | 'column-resize-container'
  | 'column-resize-handle'
  | 'column-resize-handle-last'
  | 'container'
  | 'content-area'
  | 'head-area'
  | 'no-scroll-x'
  | 'no-scroll-y'
  | 'lside-area'
  | 'rside-area'
  | 'layer-selection'
  | 'layer-focus'
  | 'layer-focus-border'
  | 'layer-state'
  | 'layer-editing'
  | 'height-resize-handle'
  | 'scrollbar-frozen-border'
  | 'scrollbar-y-inner-border'
  | 'scrollbar-y-outer-border'
  | 'scrollbar-right-top'
  | 'scrollbar-right-bottom'
  | 'table-container'
  | 'table';

export function cls(...names: ClassName[]) {
  const result = [];

  for (let name of names) {
    if (Array.isArray(name)) {
      name = name[0] ? name[1] : null;
    }

    if (name) {
      result.push(`${CLS_PREFIX}${name}`);
    }
  }

  return result.join(' ');
}

interface Obj {
  [propName: string]: any;
}

export function shallowEqual(o1: Obj, o2: Obj) {
  for (let key in o1) {
    if (o1[key] !== o2[key]) {
      return false;
    }
  }
  for (let key in o2) {
    if (!(key in o1)) {
      return false;
    }
  }
  return true;
}

export function arrayEqual(a1: any, a2: any) {
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

export function sum(nums: number[]): number {
  return nums.reduce((acc, num) => acc + num, 0);
}

export function findIndexes<T>(predicate: (v: T) => boolean, arr: T[]) {
  return arr.reduce((acc, v, idx) => (predicate(v) ? [...acc, idx] : acc), <number[]>[]);
}

export function pipe(initVal: any, ...args: Function[]) {
  return args.reduce((acc, fn) => fn(acc), initVal);
}

export function mapProp<T, K extends keyof T>(propName: K, arr: T[]) {
  return arr.map((item) => item[propName]);
}
