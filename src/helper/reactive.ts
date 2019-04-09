interface ComputedProp<T> {
  key: keyof T;
  getter: Function;
  handlers: Function[];
}

let currWatcher: Function | null = null;

export function watch(fn: Function) {
  currWatcher = fn;
  fn();
  currWatcher = null;
}

export type Reactive<T> = T & {
  __storage__: Readonly<T>;
};

export function reactive<T>(obj: T): Reactive<T> {
  const storage: T = <T>{};
  const computedProps: ComputedProp<T>[] = [];

  for (let key in obj) {
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
      get() {
        if (currWatcher) {
          handlers.push(currWatcher);
        }
        return storage[key];
      }
    });
  }

  const rObj = <Reactive<T>>obj;
  rObj.__storage__ = storage;

  computedProps.forEach(({ key, handlers, getter }) => {
    watch(() => {
      const value = getter.call(obj);
      if (storage[key] !== value) {
        storage[key] = value;
        handlers.forEach((fn) => fn());
      }
    });
  });

  return rObj;
}
