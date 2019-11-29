import { isObject, isString, isUndefined, isNull } from '../../helper/common';
import { Params } from '../types';
import { Dictionary } from '../../store/types';

const ENCODED_SPACE = '%20';
const ENCODED_LEFT_BRACKET = '%5B';

function encodeWithSpace(value: string, hasBody: boolean) {
  const regExp = new RegExp(ENCODED_SPACE, 'g');
  return hasBody ? encodeURIComponent(value).replace(regExp, '+') : encodeURIComponent(value);
}

function encodeParamKey(key: string, hasBody: boolean) {
  return key.indexOf(ENCODED_LEFT_BRACKET) !== -1 ? key : encodeWithSpace(key, hasBody);
}

function encodeObjParamKey(key: string, subKey: string | number, hasBody: boolean) {
  const encodedKey = encodeParamKey(key, hasBody);
  return `${encodedKey}${encodeURIComponent('[')}${subKey}${encodeURIComponent(']')}`;
}

function getEncodedData(
  name: string,
  subKey: string | number,
  value: Dictionary<any> | any[],
  hasBody: boolean
) {
  const encodedKey = encodeObjParamKey(name, subKey, hasBody);
  const valueWithType = Array.isArray(value) ? value[subKey as number] : value[subKey];
  return encodeFormData(encodedKey, valueWithType, hasBody);
}

function encodeFormData(key: string, value: any, hasBody: boolean) {
  if (isUndefined(value) || isNull(value) || value === '') {
    return '';
  }
  let encodedDataList: string[] = [];
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const encodedData = getEncodedData(key, index, value, hasBody);
      encodedDataList = encodedData !== '' ? encodedDataList.concat(encodedData) : encodedDataList;
    }
  } else if (isObject(value)) {
    Object.keys(value).forEach(subKey => {
      const valueWithType = value as Dictionary<any>;
      const encodedData = getEncodedData(key, subKey, valueWithType, hasBody);
      encodedDataList = encodedData !== '' ? encodedDataList.concat(encodedData) : encodedDataList;
    });
  } else {
    const encodedKey = encodeParamKey(key, hasBody);
    const encodedValue = isString(value) ? encodeWithSpace(value, hasBody) : value;
    if (encodedValue !== '') {
      encodedDataList.push(`${encodedKey}=${encodedValue}`);
    }
  }
  return encodedDataList;
}

export function encodeParams(params: Params, hasBody = false) {
  if (!params) {
    return '';
  }
  const encodedDataList = Object.keys(params).reduce((acc, name) => {
    const value = params[name];
    return value !== '' ? acc.concat(encodeFormData(name, value, hasBody)) : acc;
  }, [] as string[]);

  return encodedDataList.join('&');
}
