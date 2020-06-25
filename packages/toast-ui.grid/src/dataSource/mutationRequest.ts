import { Config } from './type';
import {
  RequestOptions,
  RequestTypeCode,
  RequestType,
  AjaxConfig,
  Url,
  MutationParams,
} from '@t/dataSource';
import { Store } from '@t/store';
import { isUndefined, isFunction } from '../helper/common';
import { gridAjax } from './ajax/gridAjax';
import { getEventBus } from '../event/eventBus';
import { getDataManager } from '../instance';
import { getDataWithOptions } from './manager/modifiedDataManager';
import { getLoadingState } from '../query/data';
import { confirmMutation } from './helper/confirm';
import { createAjaxConfig } from './helper/ajaxConfig';

interface SendOptions {
  url: Url;
  method: string;
  options: RequestOptions;
  params: MutationParams;
  requestTypeCode: RequestTypeCode;
  ajaxConfig: AjaxConfig;
}

const requestTypeCodeMap = {
  createData: 'CREATE',
  updateData: 'UPDATE',
  deleteData: 'DELETE',
  modifyData: 'MODIFY',
} as const;

function createRequestParams(store: Store, type: RequestTypeCode, requestOptions: RequestOptions) {
  const { column, data, id } = store;
  const { checkedOnly, modifiedOnly } = requestOptions;
  const modifiedOptions = { checkedOnly, ignoredColumns: column.ignoredColumns };

  if (modifiedOnly) {
    const manager = getDataManager(id);

    return type === 'MODIFY'
      ? manager.getAllModifiedData(modifiedOptions)
      : manager.getModifiedData(type, modifiedOptions);
  }
  return { rows: getDataWithOptions(data.rawData, modifiedOptions) };
}

function createRequestOptions(ajaxConfig: AjaxConfig, requestOptions = {}) {
  const defaultOptions = {
    checkedOnly: false,
    modifiedOnly: true,
    showConfirm: true,
    withCredentials: ajaxConfig.withCredentials,
  };
  return { ...defaultOptions, ...requestOptions };
}

function send(config: Config, sendOptions: SendOptions) {
  const { store, dispatch, hideLoadingBar, getRequestParams } = config;
  const { id } = store;
  const commonRequestParams = getRequestParams();
  const manager = getDataManager(id);
  const { url, method, options, params, requestTypeCode, ajaxConfig } = sendOptions;
  const { showConfirm, withCredentials } = options;

  if (!showConfirm || confirmMutation(requestTypeCode, params)) {
    const callback = () => dispatch('setLoadingState', getLoadingState(store.data.rawData));

    if (!hideLoadingBar) {
      dispatch('setLoadingState', 'LOADING');
    }

    gridAjax({
      method,
      url: isFunction(url) ? url() : url,
      params: { ...commonRequestParams, ...params },
      success: () => manager.clearSpecificRows(params),
      preCallback: callback,
      postCallback: callback,
      eventBus: getEventBus(id),
      ...ajaxConfig,
      withCredentials: isUndefined(withCredentials) ? ajaxConfig.withCredentials : withCredentials,
    });
  }
}

export function request(config: Config, requestType: RequestType, requestOptions: RequestOptions) {
  const { store, api } = config;
  const url = requestOptions.url || api[requestType]?.url;
  const method = requestOptions.method || api[requestType]?.method;

  if (!url || !method) {
    throw new Error('url and method should be essential for request.');
  }

  const requestTypeCode = requestTypeCodeMap[requestType];
  const ajaxConfig = createAjaxConfig(api[requestType] || {});
  const options = createRequestOptions(ajaxConfig, requestOptions);
  const params = createRequestParams(store, requestTypeCode, options);

  send(config, { url, method, options, params, requestTypeCode, ajaxConfig });
}
