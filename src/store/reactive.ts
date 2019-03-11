interface reactiveObj {
  ___id___?: string;
  [propName: string]: any;
}

interface handler {
  (val: any): void;
}

interface watcher {
  (): void
}

// interface HandlerMap {
//   [propName: string]: {
//     [propName: string]: handler[];
//   }
// }

let currFn = null;
// let lastId = 1;
// const handlerMap: HandlerMap = {}

export function watch(fn: watcher) {
  currFn = fn;
  fn();
  currFn = null;
}

export function reactive(obj: object): reactiveObj {
  // const id = lastId++;
  // const robj = <reactiveObj>obj;
  // const handlerMapInner = handlerMap[id] = {};
  // robj.___id___ = String(id);

  for (let key in obj) {
    // const handlers = handlerMapInner[key] = [];
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
        handlers.forEach((fn: handler) => {
          value = val
          fn(val);
        })
      }
    })
  }
  return obj;
}
