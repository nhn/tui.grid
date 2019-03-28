interface ValueMap {
  [propName: string]: any;
}

interface Storage {
  __storage__: ValueMap
}

interface ComputedProp {
  key: string;
  getter: Function;
  handlers: Function[];
}

let currWatcher: (Function | null) = null;

export function watch(fn: Function) {
  currWatcher = fn;
  fn();
  currWatcher = null;
}

export function reactive<T>(obj: T): T & Storage {
  const storage: ValueMap = {};
  const computedProps: ComputedProp[] = [];

  for (let key in obj) {
    const handlers: Function[] = [];
    const getter = (Object.getOwnPropertyDescriptor(obj, key) || {}).get;

    if (typeof getter === 'function') {
      computedProps.push({ key, handlers, getter })
    } else {
      storage[key] = obj[key];
      Object.defineProperty(obj, key, {
        set(value) {
          if (storage[key] !== value) {
            storage[key] = value;
            handlers.forEach(fn => fn());
          }
        }
      });
    }

    Object.defineProperty(obj, key, {
      get() {
        if (currWatcher) {
          handlers.push(currWatcher);
        }
        return storage[key];
      }
    })
  }

  const rObj = <T & Storage>obj;
  rObj.__storage__ = storage;

  computedProps.forEach(({ key, handlers, getter }) => {
    watch(() => {
      const value = getter.call(obj);
      if (storage[key] !== value) {
        storage[key] = value;
        handlers.forEach(fn => fn());
      }
    });
  });

  return rObj;
}
