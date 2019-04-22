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
  const storage: T = ({} as unknown) as T;
  const computedProps: ComputedProp<T>[] = [];

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
        if (currWatcher) {
          handlers.push(currWatcher);
        }

        return storage[key];
      }
    });
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
