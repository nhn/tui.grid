import { hasOwnProp, isObject, forEachObject, last, isEmpty, isFunction } from './common';
import { Dictionary } from '../store/types';
import { patchArrayMethods } from './array';

type BooleanSet = Dictionary<boolean>;

interface ObserverInfo {
  fn: Function;
  targetObserverIdSets: BooleanSet[];
  sync: boolean;
}

export type Observable<T extends Dictionary<any>> = T & {
  __storage__: T;
  __propObserverIdSetMap__: Dictionary<BooleanSet>;
};

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

function callObserver(observerId: string) {
  observerIdStack.push(observerId);
  observerInfoMap[observerId].fn();
  observerIdStack.pop();
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

function run(observerId: string) {
  const { sync } = observerInfoMap[observerId];

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
    Object.keys(observerIdSet).forEach(observerId => {
      run(observerId);
    });
  }
}

export function isObservable<T>(resultObj: T): resultObj is Observable<T> {
  return isObject(resultObj) && hasOwnProp(resultObj, '__storage__');
}

export function observe(fn: Function, sync = false) {
  const observerId = generateObserverId();
  observerInfoMap[observerId] = { fn, targetObserverIdSets: [], sync };
  run(observerId);

  // return unobserve function
  return () => {
    observerInfoMap[observerId].targetObserverIdSets.forEach(idSet => {
      delete idSet[observerId];
    });
    delete observerInfoMap[observerId];
  };
}

export function observable<T extends Dictionary<any>>(obj: T, sync = false): Observable<T> {
  if (isObservable(obj)) {
    throw new Error('Target object is already Reactive');
  }

  if (Array.isArray(obj)) {
    throw new Error('Array object cannot be Reactive');
  }

  const storage = {} as T;
  const propObserverIdSetMap = {} as Dictionary<BooleanSet>;
  const resultObj = {} as T;

  Object.defineProperties(resultObj, {
    __storage__: { value: storage },
    __propObserverIdSetMap__: { value: propObserverIdSetMap }
  });

  Object.keys(obj).forEach(key => {
    const getter = (Object.getOwnPropertyDescriptor(obj, key) || {}).get;
    const observerIdSet: BooleanSet = (propObserverIdSetMap[key] = {});

    Object.defineProperty(resultObj, key, {
      configurable: true,
      get() {
        const observerId = last(observerIdStack);
        if (observerId && !observerIdSet[observerId]) {
          observerIdSet[observerId] = true;
          observerInfoMap[observerId].targetObserverIdSets.push(observerIdSet);
        }
        return storage[key];
      }
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
        }
      });
    }
  });

  return resultObj as Observable<T>;
}

function notifyUnit<T, K extends keyof T>(obj: Observable<T>, key: K) {
  Object.keys(obj.__propObserverIdSetMap__[key as string]).forEach(observerId => {
    run(observerId);
  });
}

export function notify<T, K extends keyof T>(obj: T, ...keys: K[]) {
  if (isObservable(obj)) {
    keys.forEach(key => notifyUnit(obj, key));
  }
}

export function getOriginObject<T>(obj: Observable<T>) {
  const result = {} as T;

  forEachObject((value, key) => {
    result[key] = isObservable(value) ? getOriginObject(value) : value;
  }, obj.__storage__);

  return isEmpty(result) ? obj : result;
}
