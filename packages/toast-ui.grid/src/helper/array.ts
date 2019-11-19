import { arrayEqual } from './common';
import { notify } from './observable';
import { Dictionary } from '../store/types';

type ArrayProtoProps = keyof typeof Array.prototype;
type Methods = ArrayProtoProps[];

const methods: Methods = ['splice', 'push', 'pop', 'shift', 'unshift', 'sort'];
const derivedProps: Dictionary<string[]> = {
  rawData: ['rawData', 'filteredRawData'],
  viewData: ['viewData', 'filteredViewData']
};

function isSortMethod(method: ArrayProtoProps) {
  return method === 'sort';
}

export function patchArrayMethods<T>(arr: any[], obj: T, key: string) {
  const arrayProto = Array.prototype;

  methods.forEach(method => {
    const keys = (derivedProps[key] || [key]) as (keyof T)[];
    arr[method] = function patch(...args: any[]) {
      const copied = isSortMethod(method) ? [...this] : null;
      const result = arrayProto[method].apply(this, args);

      if (isSortMethod(method)) {
        if (!arrayEqual(copied!, this)) {
          notify(obj, ...keys);
        }
      } else {
        notify(obj, ...keys);
      }
      return result;
    };
  });

  return arr;
}
