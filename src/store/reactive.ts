let currFn = null;

export function watch(fn: Function) {
  currFn = fn;
  fn();
  currFn = null;
}

export function reactive<T>(obj: T): T {
  for (let key in obj) {
    const handlers = [];
    let value = obj[key];

    Object.defineProperty(obj, key, {
      get() {
        if (currFn) {
          handlers.push(currFn);
        }
        return value;
      },
      set(val) {
        value = val;
        handlers.forEach((fn: Function) => {
          fn(val);
        })
      }
    })
  }
  return obj;
}
