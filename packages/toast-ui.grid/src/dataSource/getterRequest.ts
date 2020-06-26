import { Config } from './type';
import { ResetOptions } from '@t/options';
import { Params, Response, ResponseData } from '@t/dataSource';
import { removeExpandedAttr } from '../dispatch/tree';
import { getChildRowKeys } from '../query/tree';
import { isUndefined, isFunction } from '../helper/common';
import { gridAjax } from './ajax/gridAjax';
import { getEventBus } from '../event/eventBus';
import { findRowByRowKey, getLoadingState, isScrollPagination } from '../query/data';
import { createAjaxConfig } from './helper/ajaxConfig';
import { emitBeforeSort, emitAfterSort } from '../dispatch/sort';
import { isCancelSort } from '../query/sort';

function validateResponse(responseData?: ResponseData): asserts responseData {
  if (isUndefined(responseData)) {
    throw new Error('The response data is empty to rerender grid');
  }
}

function handleSuccessReadData(config: Config, response: Response) {
  const { dispatch, getLastRequiredData, store } = config;
  const { data: responseData } = response;
  const { perPage, sortColumn = 'sortKey', sortAscending = true } = getLastRequiredData();

  validateResponse(responseData);

  const { contents, pagination } = responseData;

  if (isScrollPagination(store.data)) {
    dispatch('appendRows', contents);
  } else {
    const options: ResetOptions = {};
    if (sortColumn !== 'sortKey') {
      options.sortState = { columnName: sortColumn, ascending: sortAscending, multiple: true };
    }
    dispatch('resetData', contents, options);
  }

  if (pagination) {
    dispatch('updatePageOptions', { ...pagination, perPage });
  }
}

function handleSuccessReadTreeData(config: Config, response: Response) {
  const { dispatch, store, getLastRequiredData } = config;
  const { data: responseData } = response;

  validateResponse(responseData);

  const { parentRowKey } = getLastRequiredData();
  const { column, id, data } = store;

  responseData.contents.forEach((row) => dispatch('appendTreeRow', row, { parentRowKey }));

  const row = findRowByRowKey(data, column, id, parentRowKey);

  if (row && !getChildRowKeys(row).length) {
    removeExpandedAttr(row);
  }
}

export function readData(config: Config, page: number, data: Params = {}, resetData = false) {
  const { store, getLastRequiredData } = config;
  const lastRequiredData = getLastRequiredData();
  const { treeColumnName } = store.column;
  const { perPage } = store.data.pageOptions;
  const params = resetData ? { perPage, ...data, page } : { ...lastRequiredData, ...data, page };

  let successCallback = handleSuccessReadData;

  if (treeColumnName && !isUndefined(data.parentRowKey)) {
    successCallback = handleSuccessReadTreeData;
    delete params.page;
    delete params.perPage;
  }

  sendRequest(config, params, successCallback);
}

export function reloadData(config: Config) {
  readData(config, config.getLastRequiredData().page || 1);
}

export function sort(
  config: Config,
  sortColumn: string,
  sortAscending: boolean,
  cancelable: boolean
) {
  const { store } = config;
  const cancelSort = isCancelSort(store, sortColumn, sortAscending, cancelable);
  const gridEvent = emitBeforeSort(store, cancelSort, {
    columnName: sortColumn,
    ascending: sortAscending,
    multiple: false,
  });

  if (gridEvent.isStopped()) {
    return;
  }

  const params: Params = { perPage: store.data.pageOptions.perPage, page: 1 };
  if (!cancelSort) {
    params.sortColumn = sortColumn;
    params.sortAscending = sortAscending;
  }
  const successCallback = (successConfig: Config, response: Response) => {
    handleSuccessReadData(successConfig, response);
    emitAfterSort(store, cancelSort, sortColumn);
  };

  sendRequest(config, params, successCallback);
}

export function unsort(config: Config, sortColumn = 'sortKey') {
  const { store } = config;

  const gridEvent = emitBeforeSort(store, true, {
    columnName: sortColumn,
    multiple: false,
  });

  if (gridEvent.isStopped()) {
    return;
  }

  const params = { perPage: store.data.pageOptions.perPage, page: 1 };
  const successCallback = (successConfig: Config, response: Response) => {
    handleSuccessReadData(successConfig, response);
    emitAfterSort(store, true, sortColumn);
  };

  sendRequest(config, params, successCallback);
}

function sendRequest(
  config: Config,
  params: Params,
  successCallback: (config: Config, response: Response) => void
) {
  const { store, dispatch, api, setLastRequiredData, hideLoadingBar, getRequestParams } = config;
  const commonRequestParams = getRequestParams();

  const ajaxConfig = createAjaxConfig(api.readData);
  const { method, url } = api.readData;
  const callback = () => dispatch('setLoadingState', getLoadingState(store.data.rawData));

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
    ...ajaxConfig,
  });
}
