import { arrayEqual } from './common';
import { Dictionary } from '../store/types';
import { notify } from './observable';

type PatchingMethodMap = {
  splice: Function;
  pop: Function;
  push: Function;
  sort: Function;
};

const methods = ['splice', 'pop', 'push', 'sort'] as const;
const patchedMethodMap = {} as Dictionary<PatchingMethodMap>;

function fillPachedMethodMap(arr: any[], key: string) {
  let patchedMethods = patchedMethodMap[key as string];

  methods.forEach(method => {
    if (!patchedMethodMap[key as string]) {
      patchedMethods = patchedMethodMap[key as string] = {} as PatchingMethodMap;
    }
    if (!patchedMethods[method]) {
      patchedMethods[method] = arr[method];
    }
  });
}

export function patchArrayMethods<T>(arr: any[], obj: T, key: keyof T) {
  fillPachedMethodMap(arr, key as string);
  const patchedMethods = patchedMethodMap[key as string];

  methods.forEach(method => {
    if (method === 'sort') {
      arr[method] = function(...args: any) {
        const copied = [...this];
        const result = patchedMethods[method].apply(this, args);
        if (!arrayEqual(copied, this)) {
          notify(obj, key);
        }
        return result;
      };
    } else {
      arr[method] = function(...args: any) {
        const result = patchedMethods[method].apply(this, args);
        notify(obj, key);
        return result;
      };
    }
  });

  return arr;
}
