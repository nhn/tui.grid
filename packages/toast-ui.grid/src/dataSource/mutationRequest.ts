import { RequestOptions, RequestTypeCode, RequestType, AjaxConfig, Url, Config } from './types';
import { Store } from '../store/types';
import { isUndefined, isFunction } from '../helper/common';
import { gridAjax } from './ajax/gridAjax';
import { getEventBus } from '../event/eventBus';
import { getDataManager } from '../instance';
import { getDataWithOptions } from './manager/modifiedDataManager';
import { getLoadingState } from '../query/data';
import { confirmMutation } from './helper/confirm';

interface SendOptions {
  url: Url;
  method: string;
  options: RequestOptions;
  requestTypeCode: RequestTypeCode;
}

const requestTypeCodeMap = {
  createData: 'CREATE',
  updateData: 'UPDATE',
  deleteData: 'DELETE',
  modifyData: 'MODIFY'
} as const;

function createRequestOptions(ajaxConfig: AjaxConfig, options = {}): RequestOptions {
  const defaultOptions = {
    checkedOnly: false,
    modifiedOnly: true,
    showConfirm: true,
    withCredentials: ajaxConfig.withCredentials
  };
  return { ...defaultOptions, ...options };
}

function createRequestParams(store: Store, type: RequestTypeCode, options: RequestOptions) {
  const { column, data, id } = store;
  const { checkedOnly, modifiedOnly } = options;
  const modifiedOptions = { checkedOnly, ignoredColumns: column.ignoredColumns };

  if (modifiedOnly) {
    const manager = getDataManager(id);

    return type === 'MODIFY'
      ? manager.getAllModifiedData(modifiedOptions)
      : manager.getModifiedData(type, modifiedOptions);
  }
  return { rows: getDataWithOptions(data.rawData, modifiedOptions) };
}

function send(config: Config, sendOptions: SendOptions) {
  const { store, dispatch, ajaxConfig } = config;
  const { id } = store;
  const { url, method, options, requestTypeCode } = sendOptions;
  const manager = getDataManager(id);
  const params = createRequestParams(store, requestTypeCode, options);
  const { showConfirm, withCredentials } = options;

  if (!showConfirm || confirmMutation(requestTypeCode, params)) {
    const callback = () => dispatch('setLoadingState', getLoadingState(store.data.rawData));

    dispatch('setLoadingState', 'LOADING');

    gridAjax({
      method,
      url: isFunction(url) ? url() : url,
      params,
      success: () => manager.clear(params),
      preCallback: callback,
      postCallback: callback,
      eventBus: getEventBus(id),
      ...ajaxConfig,
      withCredentials: isUndefined(withCredentials) ? ajaxConfig.withCredentials : withCredentials
    });
  }
}

export function request(config: Config, requestType: RequestType, options: RequestOptions) {
  const { api, ajaxConfig } = config;
  const url = options.url || api[requestType]?.url;
  const method = options.method || api[requestType]?.method;

  if (!url || !method) {
    throw new Error('url and method should be essential for request.');
  }

  const sendOptions = {
    url,
    method,
    options: createRequestOptions(ajaxConfig, options),
    requestTypeCode: requestTypeCodeMap[requestType]
  };

  send(config, sendOptions);
}
