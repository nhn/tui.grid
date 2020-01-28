import { AjaxConfig, AjaxConfigKeys } from '../types';
import { pick } from '../../helper/common';

export function createAjaxConfig(target: AjaxConfig) {
  const configKeys: AjaxConfigKeys[] = [
    'contentType',
    'withCredentials',
    'mimeType',
    'headers',
    'serializer'
  ];
  return pick(target, ...configKeys);
}
