import {
  DataProvider,
  DataSource,
  RequestOptions,
  API,
  Params,
  Response,
  RequestTypeCode,
  RequestType,
  AjaxConfig,
  Url
} from './types';
import { Store, Dictionary, Row, RowKey } from '../store/types';
import { OptRow } from '../types';
import { Dispatch } from '../dispatch/create';
import { removeExpandedAttr } from '../dispatch/tree';
import { getChildRowKeys } from '../query/tree';
import { isUndefined, isObject, isFunction } from '../helper/common';
import GridAjax from './gridAjax';
import { getEventBus } from '../event/eventBus';
import { getDataManager } from '../instance';
import { getConfirmMessage, getAlertMessage } from './helper/message';
import { getDataWithOptions } from './modifiedDataManager';
import { findRowByRowKey, getLoadingState } from '../query/data';

interface SendOptions {
  url: Url;
  method: string;
  options: RequestOptions;
  requestTypeCode: RequestTypeCode;
}

class ServerSideDataProvider implements DataProvider {
  private initialRequest: boolean;

  private api: API;

  private lastRequiredData: Params;

  private ajaxConfig: AjaxConfig;

  private store: Store;

  private dispatch: Dispatch;

  public constructor(store: Store, dispatch: Dispatch, dataSource: DataSource) {
    const {
      api,
      initialRequest = true,
      withCredentials,
      contentType,
      mimeType,
      headers,
      serializer
    } = dataSource;

    this.initialRequest = initialRequest;
    this.api = api;
    this.lastRequiredData = { perPage: store.data.pageOptions.perPage };
    this.store = store;
    this.dispatch = dispatch;
    this.ajaxConfig = {
      contentType,
      withCredentials,
      mimeType,
      headers,
      serializer
    };

    if (this.initialRequest) {
      this.readData(1, api.readData.initParams);
    }
  }

  private createRequestOptions(options = {}): RequestOptions {
    const defaultOptions = {
      checkedOnly: false,
      modifiedOnly: true,
      showConfirm: true,
      withCredentials: this.ajaxConfig.withCredentials
    };
    return { ...defaultOptions, ...options };
  }

  private createRequestParams(type: RequestTypeCode, options: RequestOptions) {
    const { column, data, id } = this.store;
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

  private handleSuccessReadData = (response: Response) => {
    const { result, data } = response;
    if (!result || isUndefined(data)) {
      return;
    }
    this.dispatch('resetData', data.contents);
    if (data.pagination) {
      this.dispatch('updatePageOptions', {
        ...data.pagination,
        perPage: this.lastRequiredData.perPage
      });
    }
  };

  private handleSuccessReadTreeData = ({ result, data: responseData }: Response) => {
    if (!result || isUndefined(responseData)) {
      return;
    }

    const { lastRequiredData, store, dispatch } = this;
    const { parentRowKey } = lastRequiredData;
    const { column, id, data } = store;

    responseData.contents.forEach(row => dispatch('appendTreeRow', row, { parentRowKey }));

    const row = findRowByRowKey(data, column, id, parentRowKey);

    if (row && !getChildRowKeys(row).length) {
      removeExpandedAttr(row);
    }
  };

  public readData(page: number, data: Params = {}, resetData = false) {
    const { api, store, ajaxConfig, lastRequiredData, dispatch } = this;

    if (!api) {
      return;
    }

    const { treeColumnName } = store.column;
    const { perPage } = store.data.pageOptions;
    const { method, url } = api.readData;
    const params = resetData ? { perPage, ...data, page } : { ...lastRequiredData, ...data, page };

    let handleSuccessReadData = this.handleSuccessReadData;

    if (treeColumnName && !isUndefined(data.parentRowKey)) {
      handleSuccessReadData = this.handleSuccessReadTreeData;
      delete params.page;
      delete params.perPage;
    }

    this.lastRequiredData = params;

    const callback = () => dispatch('setLoadingState', getLoadingState(store.data.rawData));
    const request = new GridAjax({
      method,
      url: isFunction(url) ? url() : url,
      params,
      success: handleSuccessReadData,
      preCallback: callback,
      postCallback: callback,
      eventBus: getEventBus(store.id),
      ...ajaxConfig
    });

    dispatch('setLoadingState', 'LOADING');
    request.open();
    request.send();
  }

  public createData(url: Url, method: string, options: RequestOptions) {
    this.send({ url, method, options, requestTypeCode: 'CREATE' });
  }

  public updateData(url: Url, method: string, options: RequestOptions) {
    this.send({ url, method, options, requestTypeCode: 'UPDATE' });
  }

  public deleteData(url: Url, method: string, options: RequestOptions) {
    this.send({ url, method, options, requestTypeCode: 'DELETE' });
  }

  public modifyData(url: Url, method: string, options: RequestOptions) {
    this.send({ url, method, options, requestTypeCode: 'MODIFY' });
  }

  public request(requestType: RequestType, options: RequestOptions) {
    const url = options.url || this.api[requestType]?.url;
    const method = options.method || this.api[requestType]?.method;

    if (!url || !method) {
      throw new Error('url and method should be essential for request.');
    }

    this[requestType](url, method, this.createRequestOptions(options));
  }

  public reloadData() {
    this.readData(this.lastRequiredData.page || 1);
  }

  private send(sendOptions: SendOptions) {
    const { store, ajaxConfig, getCount, confirm, dispatch } = this;
    const { id } = store;
    const { url, method, options, requestTypeCode } = sendOptions;
    const manager = getDataManager(id);
    const params = this.createRequestParams(requestTypeCode, options);
    const { showConfirm, withCredentials } = options;

    if (!showConfirm || confirm(requestTypeCode, getCount(params))) {
      const callback = () => dispatch('setLoadingState', getLoadingState(store.data.rawData));
      const request = new GridAjax({
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
      dispatch('setLoadingState', 'LOADING');
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
    if (!isObject(data.api?.readData)) {
      throw new Error('GET API should be configured in DataSource to get data');
    }
    return new ServerSideDataProvider(store, dispatch, data as DataSource);
  }
  // dummy instance
  const providerErrorFn = () => {
    throw new Error('Cannot execute server side API. To use this API, DataSource should be set');
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
