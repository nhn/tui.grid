import { Params } from '../../../types/dataSource';
import { Dictionary } from '../../../types/options';
import { isObject, isEmpty, isNil } from '../../helper/common';

/**
 * 1. Array format
 *
 * The default array format to serialize is 'bracket'.
 * However in case of nested array, only the deepest format follows the 'bracket', the rest follow 'indice' format.
 *
 * - basic
 *   { a: [1, 2, 3] } => a[]=1&a[]=2&a[]=3
 * - nested
 *   { a: [1, 2, [3]] } => a[]=1&a[]=2&a[2][]=3
 *
 * 2. Object format
 *
 * The default object format to serialize is 'bracket' notation and doesn't allow the 'dot' notation.
 *
 * - basic
 *   { a: { b: 1, c: 2 } } => a[b]=1&a[c]=2
 */
function encodePairs(key: string, value: any) {
  return `${encodeURIComponent(key)}=${encodeURIComponent(isNil(value) ? '' : value)}`;
}

function serializeParams(key: string, value: any, serializedList: string[]) {
  if (Array.isArray(value)) {
    value.forEach((arrVal, index) => {
      serializeParams(`${key}[${isObject(arrVal) ? index : ''}]`, arrVal, serializedList);
    });
  } else if (isObject(value)) {
    Object.keys(value).forEach((objKey) => {
      serializeParams(`${key}[${objKey}]`, (value as Dictionary<any>)[objKey], serializedList);
    });
  } else {
    serializedList.push(encodePairs(key, value));
  }
}

export function serialize(params: Params) {
  if (!params || isEmpty(params)) {
    return '';
  }
  const serializedList: string[] = [];
  Object.keys(params).forEach((key) => {
    serializeParams(key, params[key], serializedList);
  });
  return serializedList.join('&');
}
