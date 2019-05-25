import { removeArrayItem, hasOwnProp, isObject, forEachObject } from './common';
import { Dictionary } from 'src/store/types';

interface ComputedProp<T> {
  key: keyof T;
  getter: Function;
}

export type Reactive<T> = T & {
  __storage__: T;
  __handlerMap__: Dictionary<Function[]>;
};

let currWatcher: Function | null = null;
let currWatcherHandlers: Function[][] | null = null;

function isReactive<T>(resultObj: T): resultObj is Reactive<T> {
  return isObject(resultObj) && hasOwnProp(resultObj, '__storage__');
}

export function watch(fn: Function) {
  currWatcher = fn;
  currWatcherHandlers = [];
  const handlersArr = currWatcherHandlers;

  fn();

  const unwatch = () => {
    handlersArr.forEach((handlers) => {
      removeArrayItem(fn, handlers);
    });
  };

  currWatcher = null;
  currWatcherHandlers = null;

  return unwatch;
}

function setValue<T, K extends keyof T>(
  storage: T,
  handlers: Function[],
  key: keyof T,
  value: T[K]
) {
  if (storage[key] !== value) {
    storage[key] = value;
    handlers.forEach((fn) => fn());
  }
}

export function notify<T, K extends keyof T>(obj: T, key: K) {
  if (isReactive(obj)) {
    obj.__handlerMap__[key as string].forEach((fn) => fn());
  }
}

export function reactive<T extends Dictionary<any>>(obj: T): Reactive<T> {
  const computedProps: ComputedProp<T>[] = [];
  const storage = {} as T;
  const handlerMap = {} as Dictionary<Function[]>;

  if (isReactive(obj)) {
    throw new Error('Target object is already Reactive');
  }

  if (Array.isArray(obj)) {
    throw new Error('Array object cannot be Reactive');
  }

  const resultObj = {} as T;

  // eslint-disable-next-line guard-for-in
  for (const key in obj) {
    const handlers: Function[] = [];
    const getter = (Object.getOwnPropertyDescriptor(obj, key) || {}).get;

    if (typeof getter === 'function') {
      computedProps.push({ key, getter });
    } else {
      storage[key] = obj[key];
      Object.defineProperty(resultObj, key, {
        configurable: true,
        set(value) {
          setValue(storage, handlers, key, value);
        }
      });
    }

    Object.defineProperty(resultObj, key, {
      // eslint-disable-next-line no-loop-func
      get() {
        if (currWatcher && currWatcherHandlers) {
          handlers.push(currWatcher);
          currWatcherHandlers.push(handlers);
        }
        return storage[key];
      }
    });

    handlerMap[key] = handlers;
  }

  Object.defineProperties(resultObj, {
    __storage__: { value: storage },
    __handlerMap__: { value: handlerMap }
  });

  computedProps.forEach(({ key, getter }) => {
    watch(() => {
      const value = getter.call(resultObj);
      setValue(storage, handlerMap[key as string], key, value);
    });
  });

  return resultObj as Reactive<T>;
}

export function getOriginObject<T>(obj: Reactive<T>) {
  const result = {} as T;
  forEachObject((value, key) => {
    result[key] = isReactive(value) ? getOriginObject(value) : value;
  }, obj.__storage__);

  return result;
}
