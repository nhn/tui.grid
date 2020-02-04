import { Params, Response, Config, ResponseData } from './types';
import { removeExpandedAttr } from '../dispatch/tree';
import { getChildRowKeys } from '../query/tree';
import { isUndefined, isFunction } from '../helper/common';
import { gridAjax } from './ajax/gridAjax';
import { getEventBus } from '../event/eventBus';
import { findRowByRowKey, getLoadingState } from '../query/data';
import { createAjaxConfig } from './helper/ajaxConfig';

function validateResponse(responseData?: ResponseData): asserts responseData {
  if (isUndefined(responseData)) {
    throw new Error('The response data is empty to rerender grid');
  }
}

function handleSuccessReadData(config: Config, response: Response) {
  const { dispatch, getLastRequiredData, store } = config;
  const { data: responseData } = response;

  validateResponse(responseData);

  if (store.data.pageOptions.type === 'scroll') {
    dispatch('makeInfiniteData', responseData.contents);
  } else {
    dispatch('resetData', responseData.contents);
  }
  if (responseData.pagination) {
    dispatch('updatePageOptions', {
      ...responseData.pagination,
      perPage: getLastRequiredData().perPage
    });
  }
}

function handleSuccessReadTreeData(config: Config, response: Response) {
  const { dispatch, store, getLastRequiredData } = config;
  const { data: responseData } = response;

  validateResponse(responseData);

  const { parentRowKey } = getLastRequiredData();
  const { column, id, data } = store;

  responseData.contents.forEach(row => dispatch('appendTreeRow', row, { parentRowKey }));

  const row = findRowByRowKey(data, column, id, parentRowKey);

  if (row && !getChildRowKeys(row).length) {
    removeExpandedAttr(row);
  }
}

export function readData(config: Config, page: number, data: Params = {}, resetData = false) {
  const {
    store,
    dispatch,
    api,
    getLastRequiredData,
    setLastRequiredData,
    hideLoadingBar,
    getRequestParams
  } = config;
  const lastRequiredData = getLastRequiredData();
  const commonRequestParams = getRequestParams();

  if (!api) {
    return;
  }

  const ajaxConfig = createAjaxConfig(api.readData);
  const { treeColumnName } = store.column;
  const { perPage } = store.data.pageOptions;
  const { method, url } = api.readData;
  const params = resetData ? { perPage, ...data, page } : { ...lastRequiredData, ...data, page };
  const callback = () => dispatch('setLoadingState', getLoadingState(store.data.rawData));

  let successCallback = handleSuccessReadData;

  if (treeColumnName && !isUndefined(data.parentRowKey)) {
    successCallback = handleSuccessReadTreeData;
    delete params.page;
    delete params.perPage;
  }

  setLastRequiredData(params);

  if (!hideLoadingBar) {
    dispatch('setLoadingState', 'LOADING');
  }

  gridAjax({
    method,
    url: isFunction(url) ? url() : url,
    params: { ...commonRequestParams, ...params },
    success: successCallback.bind(null, config),
    preCallback: callback,
    postCallback: callback,
    eventBus: getEventBus(store.id),
    ...ajaxConfig
  });
}

export function reloadData(config: Config) {
  readData(config, config.getLastRequiredData().page || 1);
}
