import { Dictionary } from '@t/options';
import { forEachObject, hasOwnProp, isEmpty, isFunction, isNull, isObject, last } from './common';
import { patchArrayMethods } from './array';

type BooleanSet = Dictionary<boolean>;

interface ObserverInfo {
  fn: Function;
  targetObserverIdSets: BooleanSet[];
  sync: boolean;
  name?: string;
  key?: string;
}

export type Observable<T extends Dictionary<any>> = T & {
  __storage__: T;
  __propObserverIdSetMap__: Dictionary<BooleanSet>;
};

type BatchTargetFn = () => void;

const generateObserverId = (() => {
  let lastId = 0;
  return () => {
    lastId += 1;
    return `@observer${lastId}`;
  };
})();

// store all observer info
export const observerInfoMap: Dictionary<ObserverInfo> = {};

// observerId stack for managing recursive observing calls
const observerIdStack: string[] = [];

let queue: string[] = [];

let observerIdMap: Dictionary<boolean> = {};

let pending = false;

let paused = false;

function batchUpdate(observerId: string) {
  if (!observerIdMap[observerId]) {
    observerIdMap[observerId] = true;
    queue.push(observerId);
  }
  if (!pending) {
    flush();
  }
}

function clearQueue() {
  queue = [];
  observerIdMap = {};
  pending = false;
}

export function getRunningObservers() {
  return queue.map((id) => observerInfoMap[id].name).filter((name) => name);
}

function callObserver(observerId: string) {
  observerIdStack.push(observerId);
  observerInfoMap[observerId].fn(observerInfoMap[observerId].key);
  observerIdStack.pop();
  delete observerInfoMap[observerId].key;
}

function flush() {
  pending = true;

  for (let index = 0; index < queue.length; index += 1) {
    const observerId = queue[index];
    observerIdMap[observerId] = false;
    callObserver(observerId);
  }

  clearQueue();
}

function run(observerId: string, key: string) {
  const { sync } = observerInfoMap[observerId];
  observerInfoMap[observerId].key = key;

  if (sync) {
    callObserver(observerId);
  } else {
    batchUpdate(observerId);
  }
}

function setValue<T, K extends keyof T>(
  storage: T,
  resultObj: T,
  observerIdSet: BooleanSet,
  key: keyof T,
  value: T[K]
) {
  if (storage[key] !== value) {
    if (Array.isArray(value)) {
      patchArrayMethods(value, resultObj, key as string);
    }
    storage[key] = value;
    Object.keys(observerIdSet).forEach((observerId) => {
      run(observerId, 'setValue');
    });
  }
}

export function isObservable<T>(resultObj: T): resultObj is Observable<T> {
  return isObject(resultObj) && hasOwnProp(resultObj, '__storage__');
}

export function observe(fn: Function, sync = false, name = '') {
  const observerId = generateObserverId();
  observerInfoMap[observerId] = { fn, targetObserverIdSets: [], sync, name };
  run(observerId, 'observe');

  // return unobserve function
  return () => {
    observerInfoMap[observerId].targetObserverIdSets.forEach((idSet) => {
      delete idSet[observerId];
    });
    delete observerInfoMap[observerId];
  };
}

// eslint-disable-next-line max-params
function makeObservableData<T extends Dictionary<any>>(
  obj: T,
  resultObj: T,
  key: string,
  storage: T,
  propObserverIdSetMap: Dictionary<BooleanSet>,
  sync?: boolean
) {
  const getter = (Object.getOwnPropertyDescriptor(obj, key) || {}).get;
  const observerIdSet: BooleanSet = (propObserverIdSetMap[key] = {});

  Object.defineProperty(resultObj, key, {
    configurable: true,
    enumerable: true,
    get() {
      const observerId = last(observerIdStack);
      if (!paused && observerId && !observerIdSet[observerId]) {
        observerIdSet[observerId] = true;
        observerInfoMap[observerId].targetObserverIdSets.push(observerIdSet);
      }
      return storage[key];
    },
  });

  if (isFunction(getter)) {
    observe(() => {
      const value = getter.call(resultObj);
      setValue(storage, resultObj, observerIdSet, key, value);
    }, sync);
  } else {
    // has to add 'as' type assertion and refer the below typescript issue
    // In general, the constraint Record<string, XXX> doesn't actually ensure that an argument has a string index signature,
    // it merely ensures that the properties of the argument are assignable to type XXX.
    // So, in the example above you could effectively pass any object and the function could write to any property without any checks.
    // https://github.com/microsoft/TypeScript/issues/31661
    (storage[key] as T) = obj[key];

    if (Array.isArray(storage[key])) {
      patchArrayMethods(storage[key], resultObj, key);
    }

    Object.defineProperty(resultObj, key, {
      set(value) {
        setValue(storage, resultObj, observerIdSet, key, value);
      },
    });
  }
}

export function partialObservable<T extends Dictionary<any>>(obj: T, key: string) {
  const storage = obj.__storage__;
  const propObserverIdSetMap = obj.__propObserverIdSetMap__;

  makeObservableData(obj, obj, key, storage, propObserverIdSetMap);
}

export function unobservable<T extends Dictionary<any>>(obj: T, keys: Array<keyof T> = []) {
  if (isObservable(obj)) {
    const originObject = getOriginObject(obj) as Observable<T>;

    keys.forEach((key) => {
      delete obj[key];

      obj[key] = originObject[key];
    });

    delete obj.__storage__;
  }
}

export function observable<T extends Dictionary<any>>(obj: T, sync = false): Observable<T> {
  if (Array.isArray(obj)) {
    throw new Error('Array object cannot be Reactive');
  }

  if (isObservable(obj)) {
    return obj;
  }

  const storage = {} as T;
  const propObserverIdSetMap = {} as Dictionary<BooleanSet>;
  const resultObj = {} as T;

  Object.defineProperties(resultObj, {
    __storage__: { value: storage, configurable: true },
    __propObserverIdSetMap__: { value: propObserverIdSetMap },
  });

  Object.keys(obj).forEach((key) => {
    makeObservableData(obj, resultObj, key, storage, propObserverIdSetMap, sync);
  });

  return resultObj as Observable<T>;
}

function notifyUnit<T, K extends keyof T>(obj: Observable<T>, key: K) {
  Object.keys(obj.__propObserverIdSetMap__[key as string]).forEach((observerId) => {
    run(observerId, key.toString());
  });
}

export function notify<T, K extends keyof T>(obj: T, ...keys: K[]) {
  if (isObservable(obj)) {
    keys.forEach((key) => notifyUnit(obj, key));
  }
}

export function getOriginObject<T>(obj: Observable<T>) {
  const result = {} as T;

  forEachObject((value, key) => {
    result[key] = isObservable(value) ? getOriginObject(value) : value;
  }, obj.__storage__);

  return isEmpty(result) ? obj : result;
}

export function unobservedInvoke(fn: BatchTargetFn) {
  paused = true;
  fn();
  paused = false;
}

export function batchObserver(fn: BatchTargetFn) {
  pending = true;
  fn();
  pending = false;
}

let asyncTimer: null | number = null;

export function asyncInvokeObserver(fn: BatchTargetFn) {
  if (isNull(asyncTimer)) {
    asyncTimer = setTimeout(() => {
      fn();
      asyncTimer = null;
    });
  }
}
