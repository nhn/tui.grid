import { notify } from './observable';
import { hasOwnProp } from './common';

type ArrayProtoProps = keyof typeof Array.prototype;
type Methods = ArrayProtoProps[];

const methods: Methods = ['splice', 'push', 'pop', 'shift', 'unshift', 'sort'];

export function patchArrayMethods<T>(arr: any[], obj: T, key: string) {
  methods.forEach(method => {
    const patchedMethods = hasOwnProp(arr, method) ? arr[method] : Array.prototype[method];

    arr[method] = function patch(...args: any[]) {
      const result = patchedMethods.apply(this, args);
      notify(obj, key as keyof T);
      return result;
    };
  });

  return arr;
}
