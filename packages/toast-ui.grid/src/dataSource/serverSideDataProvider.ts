import { DataProvider, DataSource, Params, Config } from './types';
import { Store } from '../store/types';
import { OptRow } from '../types';
import { Dispatch } from '../dispatch/create';
import { isObject, extract } from '../helper/common';
import { request } from './mutationRequest';
import { readData, reloadData } from './getterRequest';

function createConfig(store: Store, dispatch: Dispatch, dataSource: DataSource): Config {
  let lastRequiredData: Params = { perPage: store.data.pageOptions.perPage };

  const configKeys = ['cotentType', 'withCredentials', 'mimeType', 'headers', 'serializer'];
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

export function createProvider(store: Store, dispatch: Dispatch, data?: OptRow[] | DataSource) {
  // dummy function
  const errorFn = () => {
    throw new Error('Cannot execute server side API. To use this API, DataSource should be set');
  };
  const provider: DataProvider = {
    request: errorFn,
    readData: errorFn,
    reloadData: errorFn
  };

  if (!Array.isArray(data) && isObject(data)) {
    const { api, initialRequest = true } = data;

    if (!isObject(api?.readData)) {
      throw new Error('GET API should be configured in DataSource to get data');
    }

    const config = createConfig(store, dispatch, data);
    // @ts-ignore
    const curriedFns = [request, readData, reloadData].map(fn => fn.bind(null, config));

    Object.keys(provider).forEach((key, index) => {
      provider[key as keyof DataProvider] = curriedFns[index];
    });

    if (initialRequest) {
      readData(config, 1, api.readData.initParams);
    }
  }

  return provider;
}
