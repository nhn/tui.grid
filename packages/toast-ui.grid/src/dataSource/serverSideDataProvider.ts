import { DataProvider, DataSource, Params, Config, AjaxConfigKeys } from './types';
import { Store } from '../store/types';
import { OptRow } from '../types';
import { Dispatch } from '../dispatch/create';
import { isObject, extract } from '../helper/common';
import { request } from './mutationRequest';
import { readData, reloadData } from './getterRequest';

function createConfig(store: Store, dispatch: Dispatch, dataSource: DataSource): Config {
  let lastRequiredData: Params = { perPage: store.data.pageOptions.perPage };

  const configKeys: AjaxConfigKeys[] = [
    'contentType',
    'withCredentials',
    'mimeType',
    'headers',
    'serializer'
  ];
  const ajaxConfig = extract(dataSource, ...configKeys);
  const getLastRequiredData = () => lastRequiredData;
  const setLastRequiredData = (params: Params) => {
    lastRequiredData = params;
  };

  return {
    api: dataSource.api,
    store,
    dispatch,
    ajaxConfig,
    setLastRequiredData,
    getLastRequiredData
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
    reloadData: errorFn
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

    if (initialRequest) {
      readData(config, 1, api.readData.initParams);
    }
  }
  return provider;
}
