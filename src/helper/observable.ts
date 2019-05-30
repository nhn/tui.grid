import { hasOwnProp, isObject, forEachObject, last } from './common';
import { Dictionary } from '../store/types';

type BooleanSet = Dictionary<boolean>;

interface ObserverInfo {
  fn: Function;
  targetObserverIdSets: BooleanSet[];
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
const observerInfoMap: Dictionary<ObserverInfo> = {};

// observerId stack for managing recursive observing calls
const observerIdStack: string[] = [];

function isObservable<T>(resultObj: T): resultObj is Observable<T> {
  return isObject(resultObj) && hasOwnProp(resultObj, '__storage__');
}

function callObserver(observerId: string) {
  observerIdStack.push(observerId);
  observerInfoMap[observerId].fn();
  observerIdStack.pop();
}

function setValue<T, K extends keyof T>(
  storage: T,
  observerIdSet: BooleanSet,
  key: keyof T,
  value: T[K]
) {
  if (storage[key] !== value) {
    storage[key] = value;
    Object.keys(observerIdSet).forEach((observerId) => {
      callObserver(observerId);
    });
  }
}

export function observe(fn: Function) {
  const observerId = generateObserverId();
  observerInfoMap[observerId] = { fn, targetObserverIdSets: [] };
  callObserver(observerId);

  // return unobserve function
  return () => {
    observerInfoMap[observerId].targetObserverIdSets.forEach((idSet) => {
      delete idSet[observerId];
    });
  };
}

export function observable<T extends Dictionary<any>>(obj: T): Observable<T> {
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

  Object.keys(obj).forEach((key) => {
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

    if (typeof getter === 'function') {
      observe(() => {
        const value = getter.call(resultObj);
        setValue(storage, observerIdSet, key, value);
      });
    } else {
      storage[key] = obj[key];
      Object.defineProperty(resultObj, key, {
        set(value) {
          setValue(storage, observerIdSet, key, value);
        }
      });
    }
  });

  return resultObj as Observable<T>;
}

export function notify<T, K extends keyof T>(obj: T, key: K) {
  if (isObservable(obj)) {
    Object.keys(obj.__propObserverIdSetMap__[key as string]).forEach((observerId) => {
      callObserver(observerId);
    });
  }
}

export function getOriginObject<T>(obj: Observable<T>) {
  const result = {} as T;
  forEachObject((value, key) => {
    result[key] = isObservable(value) ? getOriginObject(value) : value;
  }, obj.__storage__);

  return result;
}
