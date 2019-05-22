import { Dictionary } from 'src/store/types';
import { removeArrayItem } from './common';

interface ComputedProp<T> {
  key: keyof T;
  getter: Function;
  handlers: Function[];
}

let currWatcher: Function | null = null;
let currWatcherHandlers: Function[][] | null = null;

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

export type Reactive<T> = T & {
  __storage__: Readonly<T>;
  __handlerMap__: Dictionary<Function[]>;
};

export function reactive<T>(obj: T): Reactive<T> {
  const storage: T = ({} as unknown) as T;
  const handlerMap: Dictionary<Function[]> = {};
  const computedProps: ComputedProp<T>[] = [];

  if (!Array.isArray(obj)) {
    // eslint-disable-next-line guard-for-in
    for (const key in obj) {
      const handlers: Function[] = [];
      const getter = (Object.getOwnPropertyDescriptor(obj, key) || {}).get;

      if (typeof getter === 'function') {
        computedProps.push({ key, handlers, getter });
      } else {
        storage[key] = obj[key];
        Object.defineProperty(obj, key, {
          set(value) {
            if (storage[key] !== value) {
              storage[key] = value;
              handlers.forEach((fn) => fn());
            }
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

  (obj as Reactive<T>).__storage__ = storage;

  computedProps.forEach(({ key, handlers, getter }) => {
    watch(() => {
      const value = getter.call(obj);
      if (storage[key] !== value) {
        storage[key] = value;
        handlers.forEach((fn) => fn());
      }
    });
  });

  return obj as Reactive<T>;
}
