import { AjaxConfig, AjaxConfigKeys } from '../types';
import { extract } from '../../helper/common';

export function createAjaxConfig(target: AjaxConfig) {
  const configKeys: AjaxConfigKeys[] = [
    'contentType',
    'withCredentials',
    'mimeType',
    'headers',
    'serializer'
  ];
  return extract(target, ...configKeys);
}
