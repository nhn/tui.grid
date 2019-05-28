import { hasOwnProp, isObject, forEachObject } from './common';
import { Dictionary } from '../store/types';

const generateObserverId = (() => {
  let lastId = 0;
  return () => {
    lastId += 1;
    return `@observer${lastId}`;
  };
})();

type BooleanSet = Dictionary<boolean>;

interface ObserverInfo {
  fn: Function;
  targetObserverIdSets: BooleanSet[];
}

const observerInfoMap: Dictionary<ObserverInfo> = {};
const observerIdStack: string[] = [];

interface ComputedProp<T> {
  key: keyof T;
  getter: Function;
}

export type Observable<T extends Dictionary<any>> = T & {
  __storage__: T;
  __propHandlerIdMap__: Dictionary<Function[]>;
};

function isObservable<T>(resultObj: T): resultObj is Observable<T> {
  return isObject(resultObj) && hasOwnProp(resultObj, '__storage__');
}

function observedCall(id: string) {
  observerIdStack.push(id);
  observerInfoMap[id].fn();
  observerIdStack.pop();
}

export function observe(fn: Function) {
  const id = generateObserverId();
  observerInfoMap[id] = { fn, targetObserverIdSets: [] };

  observedCall(id);

  // return unobserve function
  return () => {
    observerInfoMap[id].targetObserverIdSets.forEach((idSet) => {
      delete idSet[id];
    });
  };
}

function setValue<T, K extends keyof T>(
  storage: T,
  observerIdSet: BooleanSet,
  key: keyof T,
  value: T[K]
) {
  if (storage[key] !== value) {
    storage[key] = value;
    Object.keys(observerIdSet).forEach((id) => {
      observedCall(id);
    });
  }
}

export function notify<T, K extends keyof T>(obj: T, key: K) {
  if (isObservable(obj)) {
    Object.keys(obj.__propHandlerIdMap__[key as string]).forEach((id) => {
      observedCall(id);
    });
  }
}

export function observable<T extends Dictionary<any>>(obj: T): Observable<T> {
  const computedProps: ComputedProp<T>[] = [];
  const storage = {} as T;
  const propObserverIdSetMap = {} as Dictionary<BooleanSet>;

  if (isObservable(obj)) {
    throw new Error('Target object is already Reactive');
  }

  if (Array.isArray(obj)) {
    throw new Error('Array object cannot be Reactive');
  }

  const resultObj = {} as T;

  Object.keys(obj).forEach((key) => {
    const observerIdSet: BooleanSet = {};
    const getter = (Object.getOwnPropertyDescriptor(obj, key) || {}).get;

    if (typeof getter === 'function') {
      computedProps.push({ key, getter });
    } else {
      storage[key] = obj[key];
      Object.defineProperty(resultObj, key, {
        configurable: true,
        set(value) {
          setValue(storage, observerIdSet, key, value);
        }
      });
    }

    Object.defineProperty(resultObj, key, {
      get() {
        const id = observerIdStack[observerIdStack.length - 1];
        if (id && !observerIdSet[id]) {
          observerIdSet[id] = true;
          observerInfoMap[id].targetObserverIdSets.push(observerIdSet);
        }
        return storage[key];
      }
    });

    propObserverIdSetMap[key] = observerIdSet;
  });

  Object.defineProperties(resultObj, {
    __storage__: { value: storage },
    __propHandlerIdMap__: { value: propObserverIdSetMap }
  });

  computedProps.forEach(({ key, getter }) => {
    observe(() => {
      const value = getter.call(resultObj);
      setValue(storage, propObserverIdSetMap[key as string], key, value);
    });
  });

  return resultObj as Observable<T>;
}

export function getOriginObject<T>(obj: Observable<T>) {
  const result = {} as T;
  forEachObject((value, key) => {
    result[key] = isObservable(value) ? getOriginObject(value) : value;
  }, obj.__storage__);

  return result;
}
