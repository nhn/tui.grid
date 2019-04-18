const CLS_PREFIX = 'tui-grid-';

export type ClassNameType =
  | 'body-area'
  | 'body-container'
  | 'border-line'
  | 'border-line-top'
  | 'border-line-left'
  | 'border-line-right'
  | 'border-line-bottom'
  | 'btn-text'
  | 'btn-sorting'
  | 'btn-sorting-up'
  | 'btn-sorting-down'
  | 'btn-excel-download'
  | 'btn-excel-icon'
  | 'btn-excel-page'
  | 'btn-excel-all'
  | 'btn-tree'
  | 'content-before'
  | 'content-after'
  | 'content-input'
  | 'content-text'
  | 'cell-content'
  | 'cell'
  | 'cell-content'
  | 'cell-head'
  | 'clipboard'
  | 'column-resize-container'
  | 'column-resize-handle'
  | 'column-resize-handle-last'
  | 'container'
  | 'content-area'
  | 'clipboard'
  | 'cell-row-head'
  | 'cell-summary'
  | 'cell-row-odd'
  | 'cell-row-even'
  | 'cell-editable'
  | 'cell-dummy'
  | 'cell-required'
  | 'cell-disabled'
  | 'cell-selected'
  | 'cell-invalid'
  | 'cell-ellipsis'
  | 'cell-current-row'
  | 'cell-main-button'
  | 'cell-has-input'
  | 'cell-has-tree'
  | 'frozen-border'
  | 'frozen-border-top'
  | 'frozen-border-bottom'
  | 'head-area'
  | 'height-resize-handle'
  | 'layer-focus'
  | 'layer-focus-border'
  | 'layer-state'
  | 'layer-state-content'
  | 'layer-state-loading'
  | 'layer-focus-deactive'
  | 'layer-editing'
  | 'layer-datepicker'
  | 'lside-area'
  | 'layer-selection'
  | 'rside-area'
  | 'row-odd'
  | 'row-even'
  | 'no-scroll-x'
  | 'no-scroll-y'
  | 'pagination'
  | 'height-resize-handle'
  | 'height-resize-bar'
  | 'has-summary-top'
  | 'has-summary-bottom'
  | 'show-lside-area'
  | 'scrollbar-frozen-border'
  | 'scrollbar-left-bottom'
  | 'scrollbar-y-inner-border'
  | 'scrollbar-y-outer-border'
  | 'scrollbar-right-top'
  | 'scrollbar-right-bottom'
  | 'scrollbar-left-bottom'
  | 'scrollbar-left-top'
  | 'summary-area'
  | 'table-container'
  | 'table'
  | 'tree-wrapper-relative'
  | 'tree-wrapper-valign-center'
  | 'tree-extra-content'
  | 'tree-depth'
  | 'tree-button-expand'
  | 'tree-button-collapse'
  | 'tree-icon';

export function cls(...names: (ClassNameType | [boolean, ClassNameType])[]) {
  const result = [];

  for (let name of names) {
    let className: string | null;
    if (Array.isArray(name)) {
      className = name[0] ? name[1] : null;
    } else {
      className = name;
    }

    if (className) {
      result.push(`${CLS_PREFIX}${className}`);
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

export function hasClass(el: HTMLElement, className: ClassName) {
  return el.className.includes(cls(className));
}

export function findParent(el: HTMLElement, className: ClassName) {
  let currentEl: HTMLElement | null = el;
  do {
    currentEl = currentEl.parentElement;
  } while (currentEl && !hasClass(currentEl, className));

  return currentEl;
}

export function getCellAddress(el: HTMLElement) {
  const cellElement = findParent(el, 'cell');

  if (!cellElement) {
    return null;
  }
  const rowKey = Number(cellElement.getAttribute('data-row-key'));
  const columnName = cellElement.getAttribute('data-column-name') as string;

  return { rowKey, columnName };
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

export function deepAssign<T1 extends Obj, T2 extends Obj>(targetObj: T1, obj: T2): T1 & T2 {
  const resultObj: T1 & T2 = <T1 & T2>Object.assign({}, targetObj);

  for (const prop of Object.keys(obj)) {
    if (resultObj.hasOwnProperty(prop) && typeof resultObj[prop] === 'object') {
      resultObj[prop] = deepAssign(resultObj[prop], obj[prop]);
    } else {
      resultObj[prop] = obj[prop];
    }
  }

  return resultObj;
}
