import { Config } from './type';
import { API, Params, DataSource, DataProvider } from '@t/dataSource';
import { Store } from '@t/store';
import { OptRow } from '@t/options';
import { Dispatch } from '../dispatch/create';
import { isObject, deepMergedCopy } from '../helper/common';
import { request } from './mutationRequest';
import { readData, reloadData, sort, unsort } from './getterRequest';
import { createAjaxConfig } from './helper/ajaxConfig';

function createConfig(store: Store, dispatch: Dispatch, dataSource: DataSource): Config {
  let lastRequiredData: Params = { perPage: store.data.pageOptions.perPage };
  let requestParams: Record<string, any> = {};

  const { api, hideLoadingBar = false } = dataSource;
  const ajaxConfig = createAjaxConfig(dataSource);
  Object.keys(api).forEach((key) => {
    api[key as keyof API] = deepMergedCopy(ajaxConfig, api[key as keyof API]!);
  });

  const getLastRequiredData = () => lastRequiredData;
  const setLastRequiredData = (params: Params) => {
    lastRequiredData = params;
  };
  const getRequestParams = () => requestParams;
  const setRequestParams = (params: Params) => {
    requestParams = params;
  };

  return {
    api,
    hideLoadingBar,
    store,
    dispatch,
    setLastRequiredData,
    getLastRequiredData,
    setRequestParams,
    getRequestParams,
  };
}

function createFallbackProvider(): DataProvider {
  // dummy function
  const errorFn = () => {
    throw new Error('Cannot execute server side API. To use this API, DataSource should be set');
  };
  return {
    request: errorFn,
    readData: errorFn,
    reloadData: errorFn,
    setRequestParams: errorFn,
    sort: errorFn,
    unsort: errorFn,
  };
}

export function createProvider(store: Store, dispatch: Dispatch, data?: OptRow[] | DataSource) {
  const provider = createFallbackProvider();

  if (!Array.isArray(data) && isObject(data)) {
    const { api, initialRequest = true } = data;

    if (!isObject(api?.readData)) {
      throw new Error('GET API should be configured in DataSource to get data');
    }

    const config = createConfig(store, dispatch, data);

    // set curried function
    provider.request = request.bind(null, config);
    provider.readData = readData.bind(null, config);
    provider.reloadData = reloadData.bind(null, config);
    provider.sort = sort.bind(null, config);
    provider.unsort = unsort.bind(null, config);
    provider.setRequestParams = config.setRequestParams;

    if (initialRequest) {
      readData(config, 1, api.readData.initParams);
    }
  }
  return provider;
}
