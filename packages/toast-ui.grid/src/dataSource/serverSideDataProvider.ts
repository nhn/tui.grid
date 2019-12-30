import {
  DataProvider,
  DataSource,
  RequestOptions,
  API,
  Params,
  Response,
  RequestTypeCode,
  RequestType
} from './types';
import { Store, Dictionary, Row, RowKey } from '../store/types';
import { OptRow } from '../types';
import { Dispatch } from '../dispatch/create';
import { removeExpandedAttr } from '../dispatch/tree';
import { getChildRowKeys } from '../query/tree';
import { isUndefined, isObject, isEmpty } from '../helper/common';
import GridAjax from './gridAjax';
import { getEventBus } from '../event/eventBus';
import { getDataManager } from '../instance';
import { getConfirmMessage, getAlertMessage } from './helper/message';
import { getDataWithOptions } from './modifiedDataManager';
import { findRowByRowKey, getLoadingState } from '../query/data';

interface SendOptions {
  url: string;
  method: string;
  options: RequestOptions;
  requestTypeCode: RequestTypeCode;
}

class ServerSideDataProvider implements DataProvider {
  private initialRequest: boolean;

  private api: API;

  private withCredentials: boolean;

  private lastRequiredData: Params;

  private store: Store;

  private dispatch: Dispatch;

  public constructor(store: Store, dispatch: Dispatch, dataSource: DataSource) {
    const { api, initialRequest = true, withCredentials = false } = dataSource;

    this.initialRequest = initialRequest;
    this.api = api;
    this.withCredentials = withCredentials;
    this.lastRequiredData = { perPage: store.data.pageOptions.perPage };
    this.store = store;
    this.dispatch = dispatch;

    if (this.initialRequest) {
      this.readData(1);
    }
  }

  private createRequestOptions(options = {}): RequestOptions {
    const defaultOptions = {
      checkedOnly: false,
      modifiedOnly: true,
      showConfirm: true,
      withCredentials: this.withCredentials
    };
    return { ...defaultOptions, ...options };
  }

  private createRequestParams(type: RequestTypeCode, options: RequestOptions) {
    const { checkedOnly, modifiedOnly } = options;
    const { ignoredColumns } = this.store.column;
    const manager = getDataManager(this.store.id);
    if (modifiedOnly) {
      return type === 'MODIFY'
        ? manager.getAllModifiedData({ checkedOnly, ignoredColumns })
        : manager.getModifiedData(type, { checkedOnly, ignoredColumns });
    }
    return { rows: getDataWithOptions(this.store.data.rawData, { checkedOnly, ignoredColumns }) };
  }

  private handleSuccessReadData = (response: Response) => {
    const { result, data } = response;
    if (!result || isUndefined(data)) {
      return;
    }
    this.dispatch('resetData', data.contents);
    if (data.pagination && !isEmpty(this.store.data.pageOptions)) {
      this.dispatch('updatePageOptions', {
        ...data.pagination,
        perPage: this.lastRequiredData.perPage
      });
    }
  };

  private handleSuccessReadTreeData = (response: Response) => {
    const { result, data } = response;

    if (!result || isUndefined(data)) {
      return;
    }

    const { parentRowKey } = this.lastRequiredData;
    const { column, id } = this.store;

    data.contents.forEach(row => {
      this.dispatch('appendTreeRow', row, {
        parentRowKey
      });
    });

    const row = findRowByRowKey(this.store.data, column, id, parentRowKey);

    if (row && !getChildRowKeys(row).length) {
      removeExpandedAttr(row);
    }
  };

  public readData(page: number, data = {}, resetData = false) {
    if (!this.api) {
      return;
    }
    const { api, withCredentials, store } = this;
    const { treeColumnName } = store.column;
    const { pageOptions } = store.data;
    const { perPage } = pageOptions;
    const { method, url } = api.readData;
    const dataWithType = data as Params;
    // assign request params
    const params = resetData
      ? { perPage, ...dataWithType, page }
      : { ...this.lastRequiredData, ...dataWithType, page };
    let handleSuccessReadData = this.handleSuccessReadData;

    if (treeColumnName && !isUndefined(dataWithType.parentRowKey)) {
      handleSuccessReadData = this.handleSuccessReadTreeData;
      delete params.page;
      delete params.perPage;
    }

    this.lastRequiredData = params;

    const callback = () => this.dispatch('setLoadingState', getLoadingState(store.data.rawData));
    const request = new GridAjax({
      method,
      url,
      params,
      callback: handleSuccessReadData,
      preCallback: callback,
      postCallback: callback,
      withCredentials,
      eventBus: getEventBus(this.store.id)
    });

    this.dispatch('setLoadingState', 'LOADING');
    request.open();
    request.send();
  }

  public createData(url: string, method: string, options: RequestOptions) {
    this.send({ url, method, options, requestTypeCode: 'CREATE' });
  }

  public updateData(url: string, method: string, options: RequestOptions) {
    this.send({ url, method, options, requestTypeCode: 'UPDATE' });
  }

  public deleteData(url: string, method: string, options: RequestOptions) {
    this.send({ url, method, options, requestTypeCode: 'DELETE' });
  }

  public modifyData(url: string, method: string, options: RequestOptions) {
    this.send({ url, method, options, requestTypeCode: 'MODIFY' });
  }

  public request(requestType: RequestType, options: RequestOptions) {
    let { url, method } = options;
    if (this.api && isObject(this.api[requestType])) {
      url = url || this.api[requestType]!.url;
      method = method || this.api[requestType]!.method;
    }

    if (!url || !method) {
      throw new Error('url and method should be essential for request.');
    }
    const requestOptions = this.createRequestOptions(options);
    this[requestType](url, method, requestOptions);
  }

  public reloadData() {
    this.readData(this.lastRequiredData.page || 1);
  }

  private send(sendOptions: SendOptions) {
    const { url, method, options, requestTypeCode } = sendOptions;
    const { id, data } = this.store;
    const manager = getDataManager(id);
    const params = this.createRequestParams(requestTypeCode, options);

    if (!options.showConfirm || this.confirm(requestTypeCode, this.getCount(params))) {
      const { withCredentials } = options;
      const callback = () => this.dispatch('setLoadingState', getLoadingState(data.rawData));
      const request = new GridAjax({
        method,
        url,
        params,
        callback: () => manager.clear(params),
        preCallback: callback,
        postCallback: callback,
        withCredentials: isUndefined(withCredentials) ? this.withCredentials : withCredentials,
        eventBus: getEventBus(id)
      });
      this.dispatch('setLoadingState', 'LOADING');
      request.open();
      request.send();
    }
  }

  private getCount(rowsMap: Dictionary<Row[] | RowKey[]>) {
    return Object.keys(rowsMap).reduce((acc, key) => acc + rowsMap[key].length, 0);
  }

  // @TODO need to options for custom conrifm UI
  private confirm(type: RequestTypeCode, count: number) {
    return count ? confirm(getConfirmMessage(type, count)) : alert(getAlertMessage(type));
  }
}

export function createProvider(
  store: Store,
  dispatch: Dispatch,
  data?: OptRow[] | DataSource
): DataProvider {
  if (!Array.isArray(data) && isObject(data)) {
    return new ServerSideDataProvider(store, dispatch, data as DataSource);
  }
  // dummy instance
  const providerErrorFn = () => {
    throw new Error('cannot execute server side API. for using this API, have to set dataSource');
  };
  return {
    createData: providerErrorFn,
    updateData: providerErrorFn,
    deleteData: providerErrorFn,
    modifyData: providerErrorFn,
    request: providerErrorFn,
    readData: providerErrorFn,
    reloadData: providerErrorFn
  };
}
