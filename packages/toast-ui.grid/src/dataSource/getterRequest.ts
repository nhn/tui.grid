import { Params, Response, Config } from './types';
import { removeExpandedAttr } from '../dispatch/tree';
import { getChildRowKeys } from '../query/tree';
import { isUndefined, isFunction } from '../helper/common';
import { gridAjax } from './ajax/gridAjax';
import { getEventBus } from '../event/eventBus';
import { findRowByRowKey, getLoadingState } from '../query/data';

function handleSuccessReadData(config: Config, response: Response) {
  const { dispatch, getLastRequiredData } = config;
  const { result, data: responseData } = response;

  if (!result || isUndefined(responseData)) {
    return;
  }
  dispatch('resetData', responseData.contents);
  if (responseData.pagination) {
    dispatch('updatePageOptions', {
      ...responseData.pagination,
      perPage: getLastRequiredData().perPage
    });
  }
}

function handleSuccessReadTreeData(config: Config, response: Response) {
  const { dispatch, store, getLastRequiredData } = config;
  const { result, data: responseData } = response;
  if (!result || isUndefined(responseData)) {
    return;
  }
  const { parentRowKey } = getLastRequiredData();
  const { column, id, data } = store;

  responseData.contents.forEach(row => dispatch('appendTreeRow', row, { parentRowKey }));

  const row = findRowByRowKey(data, column, id, parentRowKey);

  if (row && !getChildRowKeys(row).length) {
    removeExpandedAttr(row);
  }
}

export function readData(config: Config, page: number, data: Params = {}, resetData = false) {
  const { store, dispatch, api, ajaxConfig, getLastRequiredData, setLastRequiredData } = config;
  const lastRequiredData = getLastRequiredData();

  if (!api) {
    return;
  }

  const { treeColumnName } = store.column;
  const { perPage } = store.data.pageOptions;
  const { method, url } = api.readData;
  const params = resetData ? { perPage, ...data, page } : { ...lastRequiredData, ...data, page };

  let success = handleSuccessReadData;

  if (treeColumnName && !isUndefined(data.parentRowKey)) {
    success = handleSuccessReadTreeData;
    delete params.page;
    delete params.perPage;
  }

  setLastRequiredData(params);
  const callback = () => dispatch('setLoadingState', getLoadingState(store.data.rawData));

  dispatch('setLoadingState', 'LOADING');

  gridAjax({
    method,
    url: isFunction(url) ? url() : url,
    params,
    success: success.bind(null, config),
    preCallback: callback,
    postCallback: callback,
    eventBus: getEventBus(store.id),
    ...ajaxConfig
  });
}

export function reloadData(config: Config) {
  readData(config, config.getLastRequiredData().page || 1);
}
