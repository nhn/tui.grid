import { isObject, isString, isUndefined, isNull } from '../../helper/common';
import { Params } from '../types';
import { Dictionary } from '../../store/types';

function encodeWithSpace(value: string) {
  return encodeURIComponent(value).replace(/%20/g, '+');
}

function encodeParamKey(key: string) {
  return key.indexOf('%5B') !== -1 ? key : encodeWithSpace(key);
}

function encodeObjParamKey(key: string, subKey: string | number) {
  const encodedKey = encodeParamKey(key);
  return `${encodedKey}${encodeURIComponent('[')}${subKey}${encodeURIComponent(']')}`;
}

function getEncodedData(name: string, subKey: string | number, value: Dictionary<any> | any[]) {
  const encodedKey = encodeObjParamKey(name, subKey);
  const valueWithType = Array.isArray(value) ? value[subKey as number] : value[subKey];
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return encodeFormData(encodedKey, valueWithType);
}

function encodeFormData(key: string, value: any) {
  if (isUndefined(value) || isNull(value) || value === '') {
    return '';
  }
  let encodedDataList: string[] = [];
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const encodedData = getEncodedData(key, index, value);
      encodedDataList = encodedData !== '' ? encodedDataList.concat(encodedData) : encodedDataList;
    }
  } else if (isObject(value)) {
    Object.keys(value).forEach((subKey) => {
      const valueWithType = value as Dictionary<any>;
      const encodedData = getEncodedData(key, subKey, valueWithType);
      encodedDataList = encodedData !== '' ? encodedDataList.concat(encodedData) : encodedDataList;
    });
  } else {
    const encodedKey = encodeParamKey(key);
    const encodedValue = isString(value) ? encodeWithSpace(value) : value;
    if (encodedValue !== '') {
      encodedDataList.push(`${encodedKey}=${encodedValue}`);
    }
  }
  return encodedDataList;
}

export function encodeParams(params: Params) {
  if (!params) {
    return '';
  }
  const encodedDataList = Object.keys(params).reduce(
    (acc, name) => {
      const value = params[name];
      return value !== '' ? acc.concat(encodeFormData(name, params[name])) : acc;
    },
    [] as string[]
  );

  return encodedDataList.join('&');
}
