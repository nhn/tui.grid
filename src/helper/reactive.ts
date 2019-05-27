import { hasOwnProp, isObject, forEachObject } from './common';
import { Dictionary } from '../store/types';

const generateHandlerId = (() => {
  let lastId = 0;
  return () => {
    lastId += 1;
    return `@handler${lastId}`;
  };
})();

const globalHandlerMap: Dictionary<Function> = {};

interface ComputedProp<T> {
  key: keyof T;
  getter: Function;
}

export type Reactive<T extends Dictionary<any>> = T & {
  __storage__: T;
  __propHandlerIdMap__: Dictionary<Function[]>;
};

let currWatcherId: string | null = null;
let currWatcherHandlerIdMaps: Dictionary<boolean>[] | null = null;

function isReactive<T>(resultObj: T): resultObj is Reactive<T> {
  return isObject(resultObj) && hasOwnProp(resultObj, '__storage__');
}

function watchCall(id: string) {
  currWatcherId = id;
  currWatcherHandlerIdMaps = [];

  globalHandlerMap[id]();
  const handlerIdMaps = currWatcherHandlerIdMaps;

  currWatcherId = null;
  currWatcherHandlerIdMaps = null;

  return handlerIdMaps;
}

export function watch(fn: Function) {
  const id = generateHandlerId();
  globalHandlerMap[id] = fn;

  const handlerIdMaps = watchCall(id);

  return () => {
    handlerIdMaps.forEach((idMap) => {
      delete idMap[id];
    });
  };
}

function setValue<T, K extends keyof T>(
  storage: T,
  handlerIdMap: Dictionary<boolean>,
  key: keyof T,
  value: T[K]
) {
  if (storage[key] !== value) {
    storage[key] = value;
    Object.keys(handlerIdMap).forEach((id) => {
      watchCall(id);
    });
  }
}

export function notify<T, K extends keyof T>(obj: T, key: K) {
  if (isReactive(obj)) {
    // const handlerIdMap = obj.__propHandlerIdMap__[key as string];
    Object.keys(obj.__propHandlerIdMap__[key as string]).forEach((id) => {
      watchCall(id);
    });
  }
}

export function reactive<T extends Dictionary<any>>(obj: T): Reactive<T> {
  const computedProps: ComputedProp<T>[] = [];
  const storage = {} as T;
  const propHandlerIdMap = {} as Dictionary<Dictionary<boolean>>;

  if (isReactive(obj)) {
    throw new Error('Target object is already Reactive');
  }

  if (Array.isArray(obj)) {
    throw new Error('Array object cannot be Reactive');
  }

  const resultObj = {} as T;

  Object.keys(obj).forEach((key) => {
    const handlerIdMap: Dictionary<boolean> = {};
    const getter = (Object.getOwnPropertyDescriptor(obj, key) || {}).get;

    if (typeof getter === 'function') {
      computedProps.push({ key, getter });
    } else {
      storage[key] = obj[key];
      Object.defineProperty(resultObj, key, {
        configurable: true,
        set(value) {
          setValue(storage, handlerIdMap, key, value);
        }
      });
    }

    Object.defineProperty(resultObj, key, {
      get() {
        if (currWatcherId && currWatcherHandlerIdMaps) {
          if (!handlerIdMap[currWatcherId]) {
            handlerIdMap[currWatcherId] = true;
          }
          currWatcherHandlerIdMaps.push(handlerIdMap);
        }
        return storage[key];
      }
    });

    propHandlerIdMap[key] = handlerIdMap;
  });

  Object.defineProperties(resultObj, {
    __storage__: { value: storage },
    __propHandlerIdMap__: { value: propHandlerIdMap }
  });

  computedProps.forEach(({ key, getter }) => {
    watch(() => {
      const value = getter.call(resultObj);
      setValue(storage, propHandlerIdMap[key as string], key, value);
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
