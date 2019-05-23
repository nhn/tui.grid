import { removeArrayItem, hasOwnProp, isObject } from './common';
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

function isReactive<T>(obj: T): obj is Reactive<T> {
  return isObject(obj) && hasOwnProp(obj, '__storage__');
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

export function reactive<T>(obj: T): Reactive<T> {
  const reactiveObj = obj as Reactive<T>;
  const computedProps: ComputedProp<T>[] = [];
  const storage = {} as T;
  const handlerMap = {} as Dictionary<Function[]>;

  if (!Array.isArray(obj)) {
    // eslint-disable-next-line guard-for-in
    for (const key in obj) {
      const handlers: Function[] = [];
      const getter = (Object.getOwnPropertyDescriptor(obj, key) || {}).get;

      if (typeof getter === 'function') {
        computedProps.push({ key, getter });
      } else {
        storage[key] = obj[key];
        Object.defineProperty(obj, key, {
          set(value) {
            setValue(storage, handlers, key, value);
          }
        });
      }

      Object.defineProperty(obj, key, {
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
  }

  reactiveObj.__storage__ = storage;
  reactiveObj.__handlerMap__ = handlerMap;

  computedProps.forEach(({ key, getter }) => {
    watch(() => {
      const value = getter.call(obj);
      setValue(storage, handlerMap[key as string], key, value);
    });
  });

  return obj as Reactive<T>;
}
