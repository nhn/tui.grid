import { notify } from './observable';
import { hasOwnProp } from './common';

type ArrayProtoProps = keyof typeof Array.prototype;
type Methods = ArrayProtoProps[];

const methods: Methods = ['splice', 'push', 'pop', 'shift', 'unshift'];

export function patchArrayMethods<T>(arr: any[], obj: T, key: string) {
  methods.forEach((method) => {
    const patchedMethod = hasOwnProp(arr, method) ? arr[method] : Array.prototype[method];
    const derivedPatchedMethod = !patchedMethod.registered && hasOwnProp(arr, method);

    // To prevent to stack the patched method recursively
    if (derivedPatchedMethod || !hasOwnProp(arr, method)) {
      arr[method] = function patch(...args: any[]) {
        const result = patchedMethod.apply(this, args);
        notify(obj, key as keyof T);
        return result;
      };
      if (derivedPatchedMethod) {
        arr[method].registered = true;
      }
    }
  });

  return arr;
}
